from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from restaurant_app.views import (
    CategoryViewSet,
    DishViewSet,
    OrderViewSet,
    NotificationViewSet,
    BillViewSet,
    LogoutView,
    UserRegisterViewSet,
    FloorViewSet,
    TableViewSet,
    CouponViewSet,
    MenuViewSet,
    MenuItemViewSet,
    MessViewSet,
    MessTypeViewSet,
    SearchDishesAPIView  # Import the SearchDishesAPIView here
)

router = DefaultRouter()

router.register(r'register', UserRegisterViewSet, basename='register')
router.register(r'dishes', DishViewSet, basename='dishes')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'bills', BillViewSet, basename='bills')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'floors', FloorViewSet, basename='floors')
router.register(r'tables', TableViewSet, basename='tables')
router.register(r'coupons', CouponViewSet)
router.register(r'mess-types', MessTypeViewSet)
router.register(r'menus', MenuViewSet)
router.register(r'menu-items', MenuItemViewSet)
router.register(r'messes', MessViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view({'post': 'logout'}), name='logout'),
    path('api/search-dishes/', SearchDishesAPIView.as_view(), name='search_dishes'),  # Include the search API endpoint
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
