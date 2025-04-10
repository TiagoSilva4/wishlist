from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'wishlists', views.WishlistViewSet)
router.register(r'items', views.ItemViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("_allauth/", include("allauth.headless.urls")),
    path("api/", include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]