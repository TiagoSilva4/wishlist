from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Category(models.Model):
    """
    Category model to organize wishlists
    """
    CATEGORY_CHOICES = (
        ('wedding', 'Wedding'),
        ('anniversary', 'Anniversary'),
        ('birthday', 'Birthday'),
        ('graduation', 'Graduation'),
        ('christmas', 'Christmas'),
        ('other', 'Other'),
    )
    
    name = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Wishlist(models.Model):
    """
    Wishlist model representing a collection of items
    """
    PRIVACY_CHOICES = (
        ('private', 'Private - Only you can see'),
        ('shared', 'Shared - Only people with the link can see'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='wishlists')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='private')
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    occasion_date = models.DateField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = base_slug
            n = 0
            # Check for duplicate slugs and add a number if needed
            while Wishlist.objects.filter(slug=self.slug).exists():
                n += 1
                self.slug = f"{base_slug}-{n}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"

class Item(models.Model):
    """
    Item model representing a product in a wishlist
    """
    PRIORITY_CHOICES = (
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Must Have')
    )
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    url = models.URLField(max_length=2000, blank=True)
    image_url = models.URLField(max_length=2000, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    purchased = models.BooleanField(default=False)
    purchased_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchased_items')
    purchased_date = models.DateTimeField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return self.name