from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

# ✅ Import ViewSets from views.py
from .views import (
    EventApplicationViewSet,          # Regular user: manage own applications
    AdminApplicationViewSet,          # Admin: manage ALL applications
    AdminUserViewSet,                 # Admin: manage user accounts (optional)
    AdminEquipmentViewSet,            # Admin: manage equipment inventory
    AdminEquipmentBorrowViewSet,      # Admin: track equipment borrow records
    register_user,                    # Registration endpoint
    update_profile,                   # ✅ NEW: Profile update endpoint
    change_password,                  # ✅ NEW: Password change endpoint
)

# ✅ Import Serializers
from .serializers import CustomTokenObtainPairSerializer

User = get_user_model()


# =============================================================================
# ✅ CUSTOM JWT VIEW
# Supports login with email (USERNAME_FIELD = 'email')
# =============================================================================
class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that accepts email for authentication"""
    serializer_class = CustomTokenObtainPairSerializer


# =============================================================================
# ✅ GET USER INFO (Enhanced with organization_role)
# =============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """
    Return current user profile info.
    Includes organization_role for frontend role-based routing.
    """
    return Response({
        'id': str(request.user.id),  # ✅ Return UUID as string for frontend
        'username': request.user.username,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'organization_role': getattr(request.user, 'organization_role', 'User'),  # ✅ Critical for role routing
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser,
        'date_joined': request.user.date_joined,
        'full_name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
    })


# =============================================================================
# ✅ PUBLIC: GET AVAILABLE EQUIPMENT (For users submitting applications)
# =============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_equipment(request):
    """
    Return list of available equipment for users to select when submitting applications.
    This is a public endpoint (only requires authentication, not admin role).
    """
    from .models import Equipment
    from .serializers import EquipmentSerializer
    
    equipment = Equipment.objects.filter(status='available')
    serializer = EquipmentSerializer(equipment, many=True)
    return Response(serializer.data)


# =============================================================================
# ✅ ROUTER SETUP
# =============================================================================

# 🔹 Regular User Router
# Base URL: /api/
# Endpoints: /api/applications/, /api/applications/{id}/, etc.
user_router = DefaultRouter()
user_router.register(
    r'applications',
    EventApplicationViewSet,
    basename='application'
)

# 🔹 Admin Router
# Base URL: /api/admin/
# Endpoints: /api/admin/applications/, /api/admin/users/, etc.
admin_router = DefaultRouter()
admin_router.register(
    r'applications',
    AdminApplicationViewSet,
    basename='admin-application'
)
admin_router.register(
    r'users',
    AdminUserViewSet,
    basename='admin-user'
)
admin_router.register(
    r'equipment',
    AdminEquipmentViewSet,
    basename='admin-equipment'
)
admin_router.register(
    r'equipment-borrow',
    AdminEquipmentBorrowViewSet,
    basename='admin-equipment-borrow'
)


# =============================================================================
# ✅ URL PATTERNS
# =============================================================================
urlpatterns = [
    # 🔐 AUTHENTICATION ENDPOINTS (/api/auth/)
    
    # Login with email → returns JWT tokens + user info
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Refresh expired access token
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ✅ Register new user account
    path('auth/register/', register_user, name='register'),
    
    # ✅ Get current user profile (includes organization_role)
    path('auth/user/', get_user_info, name='user_info'),
    
    # ✅ Update user profile (first_name, last_name)
    path('auth/user/profile/', update_profile, name='update_profile'),
    
    # ✅ Change user password
    path('auth/user/password/', change_password, name='change_password'),
    
    # ✅ Get available equipment for applications
    path('equipment/available/', get_available_equipment, name='available_equipment'),
    
    # 👥 REGULAR USER ENDPOINTS (/api/applications/)
    # Managed by EventApplicationViewSet via router
    path('', include(user_router.urls)),
    
    # 🔐 ADMIN ENDPOINTS (/api/admin/)
    # Managed by AdminApplicationViewSet & AdminUserViewSet via router
    path('admin/', include(admin_router.urls)),
]