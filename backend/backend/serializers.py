from rest_framework import serializers
from .models import Category, Wishlist, Item
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['id', 'username', 'email']

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item model"""
    purchased_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'wishlist', 'price', 
            'url', 'image_url', 'added_at', 'updated_at', 
            'priority', 'purchased', 'purchased_by', 
            'purchased_date', 'quantity'
        ]
        read_only_fields = ['added_at', 'updated_at', 'purchased_by', 'purchased_date']

class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for Wishlist model"""
    user = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        write_only=True,
        required=False,
        allow_null=True
    )
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Wishlist
        fields = [
            'id', 'title', 'description', 'user', 'category', 'category_id',
            'created_at', 'updated_at', 'privacy', 'slug', 
            'occasion_date', 'items_count'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'slug']
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def create(self, validated_data):
        # Set the user to the current request user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class WishlistDetailSerializer(WishlistSerializer):
    """Detailed Wishlist serializer that includes items"""
    items = ItemSerializer(many=True, read_only=True, source='items.all')
    
    class Meta(WishlistSerializer.Meta):
        fields = WishlistSerializer.Meta.fields + ['items']
        
    def to_representation(self, instance):
        """Override to ensure items are included for shared wishlists"""
        data = super().to_representation(instance)
        
        # If this is a shared wishlist, explicitly include items
        if instance.privacy == 'shared':
            # Ensure items are available in the data
            if 'items' not in data or not data['items']:
                print(f"Adding items to shared wishlist {instance.slug}")
                items = Item.objects.filter(wishlist=instance)
                data['items'] = [ItemSerializer(item).data for item in items]
                
        return data