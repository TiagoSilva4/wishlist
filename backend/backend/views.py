from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Category, Wishlist, Item
from .serializers import (
    CategorySerializer, WishlistSerializer, WishlistDetailSerializer,
    ItemSerializer
)

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny


import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import re
import json

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.core.mail import send_mail

from allauth.account.models import EmailAddress
from allauth.account.utils import user_pk_to_url_str, send_email_confirmation
from django.contrib.auth.tokens import default_token_generator

import os
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import EmailMultiAlternatives


# Custom permission for wishlist access
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a wishlist to edit it.
    Others can view if the wishlist is public or shared.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            # Check if obj is an Item or Wishlist
            if isinstance(obj, Item):
                # For items, check the wishlist's privacy
                wishlist = obj.wishlist
                # Always allow access to shared wishlists
                if wishlist.privacy == 'shared':
                    return True
                # Always allow access to public wishlists
                if wishlist.privacy == 'public':
                    return True
                # Only the owner can view private wishlists
                return wishlist.user == request.user
            else:
                # For wishlists, check the privacy setting
                # Always allow access to shared wishlists
                if obj.privacy == 'shared':
                    return True
                # Always allow access to public wishlists
                if obj.privacy == 'public':
                    return True
                # Only the owner can view private wishlists
                return obj.user == request.user
        
        # Write permissions are only allowed to the owner
        if isinstance(obj, Item):
            return obj.wishlist.user == request.user
        else:
            return obj.user == request.user

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class WishlistViewSet(viewsets.ModelViewSet):
    """
    API endpoint for wishlists
    """
    queryset = Wishlist.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WishlistDetailSerializer
        return WishlistSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Check if the my_wishlists filter is applied
        my_wishlists = self.request.query_params.get('my_wishlists', 'false').lower() == 'true'
        
        # If my_wishlists is true, only return the current user's wishlists
        if my_wishlists and user.is_authenticated:
            return Wishlist.objects.filter(user=user)
        
        # Special handling for retrieve action (detail view)
        # This ensures shared wishlists are accessible even for anonymous users
        if self.action == 'retrieve':
            slug = self.kwargs.get('slug')
            if slug:
                try:
                    wishlist = Wishlist.objects.get(slug=slug)
                    # Allow access to shared wishlists regardless of auth status
                    if wishlist.privacy == 'shared':
                        return Wishlist.objects.filter(slug=slug)
                except Wishlist.DoesNotExist:
                    pass  # Fall back to standard filtering
        
        # Otherwise, use the default filtering logic
        # If user is authenticated, show their wishlists and public ones
        if user.is_authenticated:
            # Get user's own wishlists
            user_wishlists = Wishlist.objects.filter(user=user)
            
            # Get public wishlists that aren't user's
            public_wishlists = Wishlist.objects.filter(privacy='public').exclude(user=user)
            
            # Combine the querysets - DO NOT include shared wishlists from other users in the main listing
            return (user_wishlists | public_wishlists).distinct()
        
        # For unauthenticated users, only show public wishlists, not shared
        return Wishlist.objects.filter(privacy='public')
    
    @action(detail=True, methods=['post'])
    def mark_purchased(self, request, slug=None):
        """
        Mark an item as purchased
        """
        wishlist = self.get_object()
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response(
                {"error": "Item ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            item = Item.objects.get(pk=item_id, wishlist=wishlist)
            item.purchased = True
            item.purchased_by = request.user
            item.purchased_date = timezone.now()
            item.save()
            
            serializer = ItemSerializer(item)
            return Response(serializer.data)
        except Item.DoesNotExist:
            return Response(
                {"error": "Item not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class ItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for wishlist items
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    
    def get_permissions(self):
        """
        Items inherit permissions from their wishlist
        """
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
    
    def get_queryset(self):
        # Filter by wishlist if provided
        wishlist_slug = self.request.query_params.get('wishlist', None)
        if wishlist_slug:
            return Item.objects.filter(wishlist__slug=wishlist_slug)
        
        # Otherwise, return items from wishlists the user can access
        user = self.request.user
        if user.is_authenticated:
            # Get items from user's own wishlists
            user_items = Item.objects.filter(wishlist__user=user)
            
            # Get items from public wishlists
            public_items = Item.objects.filter(wishlist__privacy='public')
            
            # Get items from shared wishlists
            shared_items = Item.objects.filter(wishlist__privacy='shared')
            
            # Combine the querysets
            return (user_items | public_items | shared_items).distinct()
        
        # Unauthenticated users can only see items from public and shared wishlists
        public_items = Item.objects.filter(wishlist__privacy='public')
        shared_items = Item.objects.filter(wishlist__privacy='shared')
        return (public_items | shared_items).distinct()
    
    def perform_create(self, serializer):
        """
        Override to set the current user as the item creator
        """
        wishlist_id = self.request.data.get('wishlist')
        try:
            wishlist = Wishlist.objects.get(pk=wishlist_id)
            # Check if the user is the owner of the wishlist
            if wishlist.user != self.request.user:
                raise PermissionDenied("You can only add items to your own wishlists")
                
            # Check if the wishlist is shared
            if wishlist.privacy == 'shared' and self.request.query_params.get('shared_view') == 'true':
                raise PermissionDenied("Cannot add items to a shared wishlist in shared view mode")
                
            serializer.save()
        except Wishlist.DoesNotExist:
            raise ValidationError({"wishlist": "Wishlist does not exist"})
    
    def perform_update(self, serializer):
        """
        Override to verify permissions and set updated_at
        """
        instance = self.get_object()
        
        # Check if the user is the owner of the wishlist
        if instance.wishlist.user != self.request.user:
            raise PermissionDenied("You can only update items in your own wishlists")
            
        # Check if the wishlist is shared
        if instance.wishlist.privacy == 'shared' and self.request.query_params.get('shared_view') == 'true':
            raise PermissionDenied("Cannot update items in a shared wishlist in shared view mode")
            
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def mark_purchased(self, request, pk=None):
        """
        Mark an item as purchased
        """
        item = self.get_object()
        wishlist = item.wishlist
        
        # Add check for shared wishlist
        if wishlist.privacy == 'shared' and request.query_params.get('shared_view') == 'true':
            return Response(
                {"error": "Cannot mark items as purchased in a shared wishlist view"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if item.purchased:
            return Response(
                {"error": "This item is already marked as purchased"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        item.purchased = True
        item.purchased_by = request.user
        item.purchased_date = timezone.now()
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_unpurchased(self, request, pk=None):
        """
        Mark an item as not purchased
        """
        item = self.get_object()
        wishlist = item.wishlist
        
        # Owner can always mark unpurchased
        is_owner = wishlist.user == request.user
        
        # Add check for shared wishlist
        if wishlist.privacy == 'shared' and request.query_params.get('shared_view') == 'true':
            return Response(
                {"error": "Cannot update items in a shared wishlist view"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only the owner or the person who purchased it can mark it unpurchased
        if not is_owner and item.purchased_by != request.user:
            return Response(
                {"error": "You don't have permission to mark this item as unpurchased"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if not item.purchased:
            return Response(
                {"error": "This item is not marked as purchased"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        item.purchased = False
        item.purchased_by = None
        item.purchased_date = None
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)
    
    # Add this to your views.py or create this file if it doesn't exist
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def test_endpoint(request):
    """
    Test endpoint to verify API connectivity
    """
    return Response({
        "message": "API is working!",
        "authenticated": request.user.is_authenticated,
        "user": request.user.username if request.user.is_authenticated else None
    })


# Add this new view for the /mine/ endpoint
class MyWishlistsView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        print(f"User requesting wishlists: {self.request.user}, authenticated: {self.request.user.is_authenticated}")
        user_wishlists = Wishlist.objects.filter(user=self.request.user)
        print(f"Found {user_wishlists.count()} wishlists for {self.request.user}")
        # For debugging, return all wishlists if none found for this user
        if not user_wishlists.exists():
            print("No wishlists found for user, checking all wishlists...")
            all_wishlists = Wishlist.objects.all()
            print(f"Total wishlists in database: {all_wishlists.count()}")
            if all_wishlists.exists():
                for w in all_wishlists:
                    print(f"Wishlist '{w.title}' belongs to user '{w.user.username}'")
        return user_wishlists
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_wishlists(request):
    """Debug endpoint to check wishlists"""
    user_wishlists = Wishlist.objects.filter(user=request.user)
    all_wishlists = Wishlist.objects.all()
    return Response({
        "user": request.user.username,
        "authenticated": request.user.is_authenticated,
        "user_wishlist_count": user_wishlists.count(),
        "all_wishlist_count": all_wishlists.count(),
        "user_wishlists": [{"id": w.id, "title": w.title} for w in user_wishlists],
        "all_wishlists": [{"id": w.id, "title": w.title, "user": w.user.username} for w in all_wishlists]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_item_from_url(request):
    """
    Add an item to a wishlist by scraping data from a URL.
    If extract_only=True is passed, just return the scraped data without creating an item.
    """
    # Get URL and wishlist_id from request data
    url = request.data.get('url')
    wishlist_id = request.data.get('wishlist_id')
    extract_only = request.data.get('extract_only', False)
    
    if not url:
        return Response(
            {"error": "URL is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not extract_only and not wishlist_id:
        return Response(
            {"error": "wishlist_id is required for adding items"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # If not just extracting, verify the wishlist exists and belongs to the user
    if not extract_only:
        try:
            wishlist = Wishlist.objects.get(pk=wishlist_id, user=request.user)
        except Wishlist.DoesNotExist:
            return Response(
                {"error": "Wishlist not found or you don't have permission to add to it"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Scrape data from URL
    try:
        product_data = scrape_product_data(url)
    except Exception as e:
        return Response(
            {"error": f"Failed to scrape product data: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # If extract_only is True, just return the scraped data
    if extract_only:
        return Response(product_data, status=status.HTTP_200_OK)
    
    # Otherwise, create new item - without using the scraped description
    item = Item(
        wishlist=wishlist,
        name=product_data.get('name', 'Unknown Product'),
        description="",  # Do not use scraped description, leave empty
        price=product_data.get('price'),
        url=url,
        image_url=product_data.get('image_url')
    )
    item.save()
    
    # Return serialized item
    serializer = ItemSerializer(item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

def scrape_product_data(url):
    """
    Scrape product information from a URL
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
    }
    
    # Early detection of specific store URLs for custom handling
    is_abercrombie = 'abercrombie.com' in url
    
    # Initialize default values
    product_data = {
        'name': 'Unknown Product',
        'description': '',
        'price': None,
        'image_url': None
    }
    
    # Pre-extract product ID if this is Abercrombie (will be used for fallbacks)
    abercrombie_id = None
    abercrombie_title = None
    if is_abercrombie:
        # Try to get ID from the URL
        abercrombie_id_match = re.search(r'p/([^/]+)-(\d+)', url)
        if abercrombie_id_match:
            abercrombie_title = abercrombie_id_match.group(1).replace('-', ' ').title()
            abercrombie_id = abercrombie_id_match.group(2)
            print(f"Extracted Abercrombie ID: {abercrombie_id} and title: {abercrombie_title}")
            
            # Set these as fallbacks in case scraping fails
            if abercrombie_title:
                product_data['name'] = abercrombie_title
            product_data['price'] = 59.95  # Default fallback price
    
    try:
        print(f"Attempting to scrape URL: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        
        html_content = response.content
        print(f"Response size: {len(html_content)} bytes")
        
        # Save raw HTML for deep debugging
        with open('raw_response.html', 'wb') as f:
            f.write(html_content)
        print("Saved raw HTML to raw_response.html")
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extract product ID from query parameters if present
        product_id = None
        if '?' in url:
            query_params = url.split('?')[1].split('&')
            for param in query_params:
                if 'p=' in param or 'product=' in param or 'id=' in param:
                    product_id = param.split('=')[1]
                    break
        
        if product_id:
            print(f"Extracted product ID from URL: {product_id}")
            
        # Direct text search first for quick price identification
        raw_text = soup.get_text()
        price_patterns = [
            r'\$([\d,]+\.?\d*)',                    # $123.45 or $1,234.56
            r'([\d,]+\.?\d*)\s*USD',                # 123.45 USD
            r'price[^\$]*\$([\d,]+\.?\d*)',         # price: $123.45
            r'price[^:]*:\s*([\d,]+\.?\d*)',        # price: 123.45
            r'[\$£€]([\d,]+\.?\d*)'                 # various currency symbols
        ]
        
        # We're going to do a more systematic approach to price extraction:
        # 1. First, try to get price from structured data (most reliable)
        # 2. Then look in the main product section if we can identify it
        # 3. Finally, fall back to general price patterns if needed
        price_found = False
        
        # First try to extract structured data (JSON-LD) - this is the most reliable
        script_elements = soup.select('script[type="application/ld+json"]')
        for script in script_elements:
            try:
                json_data = json.loads(script.string)
                print(f"Found JSON-LD data, checking for product info")
                
                # Check if it's product data
                if isinstance(json_data, dict) and json_data.get('@type') == 'Product':
                    if json_data.get('offers', {}).get('price'):
                        try:
                            product_data['price'] = float(json_data['offers']['price'])
                            print(f"Found price from JSON-LD: {product_data['price']}")
                            price_found = True  # Mark that we found the price
                        except (ValueError, TypeError):
                            pass
                
                # Check if it's an array and has a Product
                elif isinstance(json_data, list):
                    for item in json_data:
                        if isinstance(item, dict) and item.get('@type') == 'Product':
                            if product_data['price'] is None and item.get('offers', {}).get('price'):
                                try:
                                    product_data['price'] = float(item['offers']['price'])
                                    print(f"Found price from JSON-LD array: {product_data['price']}")
                                    price_found = True  # Mark that we found the price
                                except (ValueError, TypeError):
                                    pass
            except json.JSONDecodeError:
                print("Failed to parse JSON-LD data")
        
        # If we haven't found the price in structured data, try meta tags
        if not price_found:
            # Check for price in meta tags
            meta_price = soup.select_one('meta[property="product:price:amount"]') or soup.select_one('meta[property="og:price:amount"]')
            if meta_price and meta_price.get('content'):
                try:
                    product_data['price'] = float(meta_price.get('content'))
                    print(f"Found price from meta tag: {product_data['price']}")
                    price_found = True
                except (ValueError, TypeError):
                    pass
        
        # Look for other script tags with inline JSON data (common in many e-commerce sites)
        if not price_found:
            all_scripts = soup.find_all('script')
            for script in all_scripts:
                if script.string and ('product' in script.string.lower() or 'price' in script.string.lower()):
                    # Try to extract JSON data from the script
                    try:
                        # Find JSON-like content
                        json_match = re.search(r'\{.*\}', script.string)
                        if json_match:
                            try:
                                data = json.loads(json_match.group(0))
                                if 'price' in data and product_data['price'] is None:
                                    try:
                                        product_data['price'] = float(data['price'])
                                        print(f"Found price in script tag: {product_data['price']}")
                                        price_found = True
                                    except (ValueError, TypeError):
                                        pass
                            except:
                                # If direct JSON loading fails, try regex for price
                                price_match = re.search(r'price["\']?\s*:\s*["\']?(\d+\.?\d*)["\']?', script.string)
                                if price_match and product_data['price'] is None:
                                    try:
                                        product_data['price'] = float(price_match.group(1))
                                        print(f"Found price using regex in script: {product_data['price']}")
                                        price_found = True
                                    except (ValueError, TypeError):
                                        pass
                    except:
                        continue
                        
        # Only continue to more general price extraction if we haven't found a price yet
        if not price_found:
            # Try to find the main product container first to limit scope
            main_product_container = None
            
            # Common product container selectors
            product_container_selectors = [
                '.product-main', 
                '.product-info',
                '.product-details',
                '.product-page',
                '[data-testid="product-detail"]',
                '.pdp-main',
                '.product-purchase',
                '.product-info-main',
                '#product-detail',
                '.product-essential',
                '[itemtype="http://schema.org/Product"]',
                '.product',
                '[data-component-type="s-product-information"]',
                '.product-content'
            ]
            
            # Try to find the main product container
            for selector in product_container_selectors:
                container = soup.select_one(selector)
                if container:
                    main_product_container = container
                    print(f"Found main product container using selector: {selector}")
                    break
            
            # If we found a container, search within it first for more precise results
            price_container = main_product_container or soup
                        
            # Extract price if not found yet - within the main container if possible
            if product_data['price'] is None:
                # Comprehensive list of selectors for prices
                price_selectors = [
                    '[data-testid="price"]',
                    '.product-price', 
                    '.price-current',
                    '.current-price',
                    '.price-value',
                    '.price--withoutTax',
                    '.price--withTax',
                    '[itemprop="price"]',
                    '.offer-price',
                    '.sale-price',
                    '#priceblock_ourprice',
                    '#priceblock_saleprice',
                    '.a-price .a-offscreen',
                    '.a-price-whole',
                    '.product-price-value',
                    '[data-price-type="finalPrice"]',
                    '.product-info-price .price',
                    '.price-box .price',
                    '.pdp-price',
                    '.product__price',
                    '.current_price',
                    '.product-page__price',
                    '.product-price__actual',
                    '.price',  # More general, use last
                ]
                
                # First try the most specific selectors
                for selector in price_selectors:
                    price_elements = price_container.select(selector)
                    if price_elements:
                        for price_element in price_elements:
                            # First try to get 'content' attribute (used by many sites for structured data)
                            price_text = price_element.get('content', '')
                            
                            # If no content attribute, use the text
                            if not price_text:
                                price_text = price_element.text.strip()
                            
                            print(f"Found potential price text: '{price_text}' using selector: {selector}")
                            
                            # Try multiple approaches to extract the price
                            # First try specific currency symbol followed by number pattern
                            price_match = re.search(r'(\$|€|£|USD|EUR|GBP)?\s*(\d+(?:[.,]\d+)?)', price_text)
                            if price_match:
                                # Clean up price value - handling both comma and dot formats
                                price_value = price_match.group(2).strip()
                                
                                # Handle European format (comma as decimal separator)
                                if ',' in price_value and '.' in price_value:
                                    # Format like 1,234.56
                                    price_value = price_value.replace(',', '')
                                elif ',' in price_value:
                                    # Format like 1234,56
                                    price_value = price_value.replace(',', '.')
                                
                                try:
                                    product_data['price'] = float(price_value)
                                    print(f"Successfully extracted price: {product_data['price']}")
                                    price_found = True
                                    break  # Stop once we found a valid price
                                except ValueError:
                                    continue
                        
                        if price_found:
                            break
        
        # Extract image URL if not found yet
        if not product_data['image_url']:
            # Comprehensive list of selectors for images
            img_selectors = [
                '.product-image img', 
                '.main-image img', 
                '[itemprop="image"]',
                '.product-img',
                'img.product',
                '#landingImage',
                '#imgTagWrapperId img',
                '.a-dynamic-image',
                '.product-image-photo',
                '.gallery-image',
                '.carousel-item img',
                '.product-photo img',
                '.pdp-image img',
                '.product-single__media img',
                '.product__image',
                '.mw-headline img', 
                'img[id*="product"]',
                'img[class*="product"]',
                '.main-product-image',
                '.product-detail-image',
                '.product-hero-image img',
                'img.primary-image',
                '.product-media img',
                '.product-gallery__image',
                '.product-images img',
                'img[data-zoom-image]',
                '.product-image-container img',
                '.product-gallery__main-image img',
                '[data-automation-id="productImage"] img',
                '.product-gallery-container img',
                '.pdp-main-image img',
                'picture source',
                '.main-image',
                '.main-product-image img',
                'img[alt*="product"]',    # Images with 'product' in alt text
                'img[alt*="item"]',       # Images with 'item' in alt text
                '.carousel img',          # Common for product carousels
                '.slider img'             # Common for product sliders
            ]
            
            # Try with image selectors
            for selector in img_selectors:
                img_elements = soup.select(selector)
                if img_elements:
                    for img in img_elements:
                        # Try different attributes where image URLs might be stored
                        for attr in ['src', 'data-src', 'data-lazy-src', 'data-srcset', 'data-lazy', 'data-image', 'srcset', 'data-srcset', 'data-img-url']:
                            img_src = img.get(attr)
                            if img_src:
                                # Handle srcset attribute (pick the first URL)
                                if attr in ['srcset', 'data-srcset'] and ' ' in img_src:
                                    img_src = img_src.split(',')[0].split(' ')[0]
                                    
                                # Handle relative URLs
                                if img_src.startswith('/'):
                                    parsed_url = urlparse(url)
                                    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                                    img_src = urljoin(base_url, img_src)
                                
                                print(f"Found image: {img_src} using selector: {selector}, attr: {attr}")
                                product_data['image_url'] = img_src
                                break
                        if product_data['image_url']:
                            break
                    if product_data['image_url']:
                        break
                        
            # If still no image found, try the first large image on the page
            if not product_data['image_url']:
                all_images = soup.find_all('img')
                large_images = [img for img in all_images if img.get('width') and int(img.get('width')) > 200]
                if large_images:
                    img_src = large_images[0].get('src')
                    if img_src:
                        # Handle relative URLs
                        if img_src.startswith('/'):
                            parsed_url = urlparse(url)
                            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                            img_src = urljoin(base_url, img_src)
                        product_data['image_url'] = img_src
                        print(f"Found image from large images: {product_data['image_url']}")
                
                # Try any image as last resort
                if not product_data['image_url'] and all_images:
                    for img in all_images:
                        if img.get('src') and len(img.get('src')) > 10:  # Basic filter for non-icon images
                            img_src = img.get('src')
                            if img_src.startswith('/'):
                                parsed_url = urlparse(url)
                                base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                                img_src = urljoin(base_url, img_src)
                            product_data['image_url'] = img_src
                            print(f"Found last resort image: {img_src}")
                            break
        
        # Extract description if not already found
        if not product_data['description']:
            # Comprehensive list of selectors for descriptions
            desc_selectors = [
                '[itemprop="description"]',
                '.product-description',
                '.description',
                '#productDescription',
                '.product-short-description',
                '.product-info-description',
                '.product__description',
                '.product-single__description',
                '#product-details',
                '.item-description',
                '.product-details-description',
                'meta[name="description"]',
                '.pdp-description',
                '.mw-parser-output p',
                '.product-description-blurb'
            ]
            
            for selector in desc_selectors:
                desc_elements = soup.select(selector)
                if desc_elements:
                    if selector == 'meta[name="description"]':
                        product_data['description'] = desc_elements[0].get('content', '')
                    else:
                        product_data['description'] = desc_elements[0].text.strip()
                    
                    print(f"Found description: '{product_data['description'][:50]}...' using selector: {selector}")
                    
                    # Ensure description is not too long
                    if len(product_data['description']) > 500:
                        product_data['description'] = product_data['description'][:497] + '...'
                    break
        
        # Debug: save HTML for debugging if extraction was incomplete
        if product_data['name'] == 'Unknown Product' or product_data['price'] is None or product_data['image_url'] is None:
            print(f"Incomplete extraction: name={product_data['name'] != 'Unknown Product'}, price={product_data['price'] is not None}, image={product_data['image_url'] is not None}")
            with open('scrape_debug.html', 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"Saved HTML for debugging to scrape_debug.html")
        
        # Enhanced special handling for Abercrombie
        if is_abercrombie and (product_data['name'] == 'Unknown Product' or product_data['price'] is None or product_data['image_url'] is None):
            print("Using enhanced fallback logic for Abercrombie & Fitch")
            
            # Try to get name from title if not already set
            if product_data['name'] == 'Unknown Product' and abercrombie_title:
                product_data['name'] = abercrombie_title
                print(f"Using title from URL for Abercrombie: {product_data['name']}")
            
            # If still no name, try to extract from page title
            if product_data['name'] == 'Unknown Product':
                title_tag = soup.find('title')
                if title_tag and '|' in title_tag.text:
                    # Format is usually "Product Name | Abercrombie & Fitch"
                    product_data['name'] = title_tag.text.split('|')[0].strip()
                    print(f"Extracted name from page title: {product_data['name']}")
                    
            # If still no price, use fallback
            if product_data['price'] is None:
                product_data['price'] = 59.95  # Common default price
                print(f"Setting fallback price for Abercrombie: {product_data['price']}")
            
            # Try to find images in multiple ways for Abercrombie
            if not product_data['image_url']:
                # 1. Look for image tags with data-src attributes (common in Abercrombie)
                data_src_images = soup.select('img[data-src]')
                for img in data_src_images:
                    if 'product' in img.get('data-src', '').lower() or abercrombie_id in img.get('data-src', ''):
                        product_data['image_url'] = img.get('data-src')
                        print(f"Found Abercrombie image with data-src: {product_data['image_url']}")
                        break
                
                # 2. Look for any large images if still nothing
                if not product_data['image_url']:
                    all_images = soup.find_all('img')
                    # Filter for larger images that might be product images
                    for img in all_images:
                        src = img.get('src', '')
                        if src and len(src) > 30 and ('jpg' in src.lower() or 'jpeg' in src.lower() or 'png' in src.lower()):
                            product_data['image_url'] = src
                            print(f"Found fallback image for Abercrombie: {product_data['image_url']}")
                            break
            
            # Last resort: generate a description if none was found
            if not product_data['description']:
                product_data['description'] = f"An item from Abercrombie & Fitch. {product_data['name']}."
                print(f"Using generated description: {product_data['description']}")
        
        # Debug output
        print(f"Final extracted product data: {product_data}")
        
        return product_data
            
    except Exception as e:
        print(f"Error scraping URL {url}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Better fallbacks for specific sites
        if is_abercrombie:
            print("Using emergency fallback for Abercrombie & Fitch")
            fallback = {
                'name': abercrombie_title or 'Abercrombie & Fitch Item',
                'description': f"Item from Abercrombie & Fitch. URL: {url}",
                'price': 59.95,
                'image_url': 'https://www.abercrombie.com/static/img/logo.svg'  # Default logo as fallback
            }
            return fallback
        
        # Return default values if scraping fails
        return {
            'name': 'Unknown Product',
            'description': f'Unable to extract product details from {url}',
            'price': None,
            'image_url': None
        }

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_csrf_token(request):
    """
    Return CSRF token for the client
    """
    return Response({
        "csrfToken": request.META.get("CSRF_COOKIE", "")
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update user profile information (username, etc.)
    """
    user = request.user
    data = request.data
    
    print(f"Update profile request for user: {user.username}")
    print(f"Request data: {data}")
    
    # Password check is no longer required
    current_password = data.get('current_password')
    
    # Update username if provided
    username = data.get('username')
    if username and username != user.username:
        print(f"Updating username from {user.username} to {username}")
        # Check if username is already taken
        if User.objects.filter(username=username).exclude(pk=user.pk).exists():
            print(f"Username {username} is already taken")
            return Response(
                {"errors": [{"param": "username", "message": "This username is already taken."}]},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.username = username
    
    user.save()
    print(f"User profile updated successfully: {user.username}")
    
    return Response({
        "status": 200,
        "data": {
            "username": user.username,
            "email": user.email,
        }
    })

def test_allauth_endpoint(request):
    """Simple endpoint to test if /_allauth routing works"""
    return JsonResponse({
        "status": "ok", 
        "message": "This is a test allauth endpoint",
        "path": request.path
    })

# Add this new view for shared wishlists
@api_view(['GET'])
@permission_classes([AllowAny])
def shared_wishlist_view(request, slug):
    """
    Public endpoint for accessing shared wishlists
    """
    print(f"Shared wishlist view accessed for slug: {slug}")
    try:
        wishlist = Wishlist.objects.get(slug=slug)
        print(f"Found wishlist with privacy '{wishlist.privacy}' owned by {wishlist.user.username}")
        
        # Only allow access if the wishlist is shared
        if wishlist.privacy != 'shared':
            print(f"Wishlist {slug} has privacy '{wishlist.privacy}', not 'shared' - access denied")
            return Response(
                {"error": "This wishlist is not shared or does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Use the detailed serializer to include all wishlist items
        # Create a context dict with request
        context = {'request': request}
        serializer = WishlistDetailSerializer(wishlist, context=context)
        
        # For debugging - log what's being returned
        response_data = serializer.data
        item_count = len(response_data.get('items', []))
        print(f"Returning shared wishlist with {item_count} items")
        
        # If no items were included, try to get them manually
        if item_count == 0:
            print("No items in serialized data, fetching manually")
            items = Item.objects.filter(wishlist=wishlist)
            items_data = [ItemSerializer(item).data for item in items]
            response_data['items'] = items_data
            print(f"Manually added {len(items_data)} items")
        
        return Response(response_data)
    except Wishlist.DoesNotExist:
        print(f"Wishlist with slug {slug} not found")
        return Response(
            {"error": "Wishlist not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_shared_wishlist(request, slug):
    """
    Debug endpoint for shared wishlists
    """
    try:
        # Try to get the wishlist
        wishlist = Wishlist.objects.get(slug=slug)
        
        # Get items manually
        items = Item.objects.filter(wishlist=wishlist)
        
        # Manual serialization of essential fields for debugging
        serialized_items = []
        for item in items:
            serialized_items.append({
                'id': item.id,
                'name': item.name,
                'description': item.description[:50] + '...' if item.description and len(item.description) > 50 else item.description,
                'price': item.price,
                'purchased': item.purchased,
                'purchased_by': item.purchased_by.username if item.purchased_by else None
            })
        
        return Response({
            'auth_status': {
                'authenticated': request.user.is_authenticated,
                'user': request.user.username if request.user.is_authenticated else 'Anonymous',
            },
            'wishlist': {
                'id': wishlist.id,
                'title': wishlist.title,
                'privacy': wishlist.privacy,
                'is_shared': wishlist.privacy == 'shared',
                'owner': wishlist.user.username,
                'item_count': items.count(),
            },
            'items': serialized_items,
        })
    except Wishlist.DoesNotExist:
        return Response(
            {"error": "Wishlist not found", 'slug': slug},
            status=status.HTTP_404_NOT_FOUND
        )

@csrf_exempt
def test_email(request):
    """
    Test endpoint to verify email configuration for authentication
    """
    try:
        send_mail(
            'Test Email from Wishlist App',
            'This is a test email from the Wishlist application to verify that authentication emails are working properly.',
            'noreply@mg.wish-list.social',
            [request.GET.get('to_email', 'test@example.com')],
            fail_silently=False,
        )
        return JsonResponse({'status': 'success', 'message': 'Test email sent successfully. Authentication emails should work properly.'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@permission_classes([AllowAny])
def test_password_reset(request):
    """
    Test function to send a password reset email
    """
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'status': 'error', 'message': 'Email parameter is required'}, status=400)
        
    try:
        user = User.objects.get(email=email)
        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = user_pk_to_url_str(user)
        
        # Simulate password reset email
        reset_url = f"/account/password/reset/key/{uid}-{token}/"
        
        # Send the email
        send_mail(
            'Password Reset for Wishlist App',
            f'Click the following link to reset your password: {reset_url}',
            'noreply@mg.wish-list.social',
            [email],
            fail_silently=False,
        )
        
        return JsonResponse({'status': 'success', 'message': 'Password reset email sent successfully'})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User with this email not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@permission_classes([AllowAny])
def test_verification_email(request):
    """
    Test function to send an email verification email
    """
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'status': 'error', 'message': 'Email parameter is required'}, status=400)
        
    try:
        user = User.objects.get(email=email)
        
        # Check if email is already verified
        email_address = EmailAddress.objects.filter(user=user, email=email).first()
        if email_address and email_address.verified:
            return JsonResponse({'status': 'info', 'message': 'Email is already verified'})
            
        # Send verification email
        if not email_address:
            email_address = EmailAddress.objects.create(user=user, email=email, primary=True)
            
        send_email_confirmation(request, user, email=email)
        
        return JsonResponse({'status': 'success', 'message': 'Verification email sent successfully'})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User with this email not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@permission_classes([AllowAny])
def debug_auth_emails(request):
    """
    Debug function to showcase authentication emails directly in the console
    """
    try:
        email = request.GET.get('email', 'test@example.com')
        
        # Create a test user if it doesn't exist
        if not User.objects.filter(email=email).exists():
            username = 'testuser' + str(os.urandom(4).hex())
            user = User.objects.create_user(username=username, email=email, password='testpassword')
        else:
            user = User.objects.get(email=email)
        
        # Send password reset email
        context = {
            'user': user,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
            'protocol': 'https' if request.is_secure() else 'http',
            'domain': request.get_host(),
        }
        
        # Render both text and HTML versions
        email_text = render_to_string('account/email/password_reset_key_message.txt', context)
        email_html = render_to_string('account/email/password_reset_key_message.html', context)
        
        # Send the email
        subject = "Password Reset E-mail"
        email_message = EmailMultiAlternatives(subject, email_text, 'noreply@mg.wish-list.social', [email])
        email_message.attach_alternative(email_html, "text/html")
        email_message.send()
        
        # Send verification email (template would be customized in production)
        subject = "Verify Your E-mail Address"
        email_text = "Please verify your email address by clicking this link: http://example.com/verify/"
        email_message = EmailMultiAlternatives(subject, email_text, 'noreply@mg.wish-list.social', [email])
        email_message.send()
        
        return JsonResponse({
            'status': 'success', 
            'message': 'Authentication emails displayed in console - please check the server logs',
            'user': {'id': user.id, 'username': user.username, 'email': user.email}
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)