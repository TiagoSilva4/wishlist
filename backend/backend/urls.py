from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework.routers import DefaultRouter
from . import views
from django.http import JsonResponse

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'wishlists', views.WishlistViewSet)
router.register(r'items', views.ItemViewSet)

def health_check(request):
    return JsonResponse({"status": "ok", "service": "backend"})

def debug_view(request):
    """Debug view to check routing"""
    return JsonResponse({
        "status": "ok",
        "path": request.path,
        "method": request.method,
        "headers": dict(request.headers)
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("_allauth/", include("allauth.headless.urls")),
    
    # API endpoints should all be under /api/
    path("api/", include([
        path('', include(router.urls)),
        path('wishlists/mine/', views.MyWishlistsView.as_view(), name='my-wishlists'),
        path('test/', views.test_endpoint, name='test_endpoint'),
        path('debug-wishlists/', views.debug_wishlists, name='debug-wishlists'),
        path('wishlist-items/add-from-url/', views.add_item_from_url, name='add-item-from-url'),
        path('auth/account/profile/', views.update_profile, name='update-profile'),
        path('csrf/', views.get_csrf_token, name='get-csrf-token'),
        path('shared-wishlists/<slug:slug>/', views.shared_wishlist_view, name='shared-wishlist'),
        path('debug-shared-wishlist/<slug:slug>/', views.debug_shared_wishlist, name='debug-shared-wishlist'),
        path('test-email/', views.test_email, name='test-email'),
        path('test-password-reset/', views.test_password_reset, name='test-password-reset'),
        path('test-verification-email/', views.test_verification_email, name='test-verification-email'),
        path('debug-auth-emails/', views.debug_auth_emails, name='debug-auth-emails'),
    ])),
    
    path('api-auth/', include('rest_framework.urls')),
    path("api/health/", health_check, name="health_check"),
    path("_allauth/test/", views.test_allauth_endpoint, name="test_allauth_endpoint"),
    
    # Add debug routes
    path("_allauth/debug/", debug_view, name="allauth_debug"),
    path("api/debug/", debug_view, name="api_debug"),
    
    # Catch-all pattern for debugging (add at the end)
    re_path(r"^.*$", debug_view, name="catch_all"),
]