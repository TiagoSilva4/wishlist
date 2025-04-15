from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from .models import Category, Wishlist, Item
from .serializers import (
    CategorySerializer, WishlistSerializer, WishlistDetailSerializer,
    ItemSerializer
)

# Custom permission for wishlist access
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a wishlist to edit it.
    Others can view if the wishlist is public or shared.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            # Check if the wishlist is public or shared
            if obj.privacy == 'public':
                return True
            elif obj.privacy == 'shared' and 'slug' in request.parser_context['kwargs']:
                # Allow access if using the shared slug link
                return True
            # Otherwise, only the owner can view
            return obj.user == request.user
        
        # Write permissions are only allowed to the owner
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
        
        # If user is authenticated, show their wishlists and public ones
        if user.is_authenticated:
            # Get user's own wishlists
            user_wishlists = Wishlist.objects.filter(user=user)
            
            # Get public wishlists that aren't user's
            public_wishlists = Wishlist.objects.filter(privacy='public').exclude(user=user)
            
            # Combine the querysets
            return (user_wishlists | public_wishlists).distinct()
        
        # For unauthenticated users, only show public wishlists
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
            
            # Combine the querysets
            return (user_items | public_items).distinct()
        
        # Unauthenticated users can only see items from public wishlists
        return Item.objects.filter(wishlist__privacy='public')
    
    def perform_create(self, serializer):
        """
        When creating an item, check if user has permission for the wishlist
        """
        wishlist_id = serializer.validated_data.get('wishlist').id
        wishlist = Wishlist.objects.get(pk=wishlist_id)
        
        # Check if user is the owner of the wishlist
        if wishlist.user != self.request.user:
            raise permissions.PermissionDenied("You can only add items to your own wishlists.")
        
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def mark_purchased(self, request, pk=None):
        """
        Mark an item as purchased
        """
        item = self.get_object()
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
        
        # Only the purchaser or wishlist owner can mark as unpurchased
        if item.purchased_by != request.user and item.wishlist.user != request.user:
            return Response(
                {"error": "Only the purchaser or wishlist owner can mark this item as unpurchased"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        item.purchased = False
        item.purchased_by = None
        item.purchased_date = None
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)