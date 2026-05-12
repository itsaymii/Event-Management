# urls.py - COMPLETE FIXED VERSION
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

# ✅ Import Views from views.py
from .views import (
    # JWT Auth Views
    CustomTokenObtainPairView,    # ← Custom login view (from views.py)
    CustomTokenRefreshView,       # ← Optional: custom refresh view
    
    # Auth Function Views
    register_user,                # Registration endpoint (function-based)
    update_profile,               # Profile update endpoint
    change_password,              # Password change endpoint
    
    # Notification Views
    list_notifications,
    mark_notifications_read,
    
    # ViewSets
    EventApplicationViewSet,
    AdminApplicationViewSet,
    AdminUserViewSet,
    AdminEquipmentViewSet,
    AdminEquipmentBorrowViewSet,
    
    # Debug/Utility Views
    debug_equipment,
)

User = get_user_model()


# =============================================================================
# ✅ HELPER ENDPOINTS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """
    Return current user profile info with organization_role for frontend routing.
    """
    return Response({
        'id': str(request.user.id),
        'username': request.user.username,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'organization_role': getattr(request.user, 'organization_role', 'User').upper(),
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser,
        'date_joined': request.user.date_joined.isoformat() if request.user.date_joined else None,
        'full_name': f"{request.user.first_name or ''} {request.user.last_name or ''}".strip() or request.user.username,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_equipment(request):
    """
    Return list of available equipment for users to select in applications.
    Only requires authentication (not admin role).
    """
    from .models import Equipment
    from .serializers import EquipmentSerializer
    
    equipment = Equipment.objects.filter(status='available')
    serializer = EquipmentSerializer(equipment, many=True)
    return Response(serializer.data)


# =============================================================================
# ✅ ROUTER SETUP
# =============================================================================

# 🔹 Regular User Router - Base: /api/
user_router = DefaultRouter()
user_router.register(r'applications', EventApplicationViewSet, basename='application')

# 🔹 Admin Router - Base: /api/admin/
admin_router = DefaultRouter()
admin_router.register(r'applications', AdminApplicationViewSet, basename='admin-application')
admin_router.register(r'users', AdminUserViewSet, basename='admin-user')
admin_router.register(r'equipment', AdminEquipmentViewSet, basename='admin-equipment')
admin_router.register(r'equipment-borrow', AdminEquipmentBorrowViewSet, basename='admin-equipment-borrow')


# =============================================================================
# ✅ URL PATTERNS
# =============================================================================
urlpatterns = [
    # ─────────────────────────────────────────────────────────────────────
    # 🔐 AUTHENTICATION ENDPOINTS (/api/auth/)
    # ─────────────────────────────────────────────────────────────────────
    
    # ✅ Login - returns JWT tokens + user data (supports email OR username)
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # ✅ Refresh expired access token
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    
    # ✅ Register new user account (function-based view)
    path('auth/register/', register_user, name='register'),
    
    # ✅ Get current user profile (includes organization_role for frontend)
    path('auth/user/', get_user_info, name='user_info'),
    
    # ✅ Update user profile (first_name, last_name, email)
    path('auth/user/profile/', update_profile, name='update_profile'),
    
    # ✅ Change user password
    path('auth/user/password/', change_password, name='change_password'),
    
    
    # ─────────────────────────────────────────────────────────────────────
    # 📦 EQUIPMENT ENDPOINTS (Public for authenticated users)
    # ─────────────────────────────────────────────────────────────────────
    
    # ✅ Get available equipment for application forms
    path('equipment/available/', get_available_equipment, name='available_equipment'),
    
    
    # ─────────────────────────────────────────────────────────────────────
    # 🔔 NOTIFICATION ENDPOINTS
    # ─────────────────────────────────────────────────────────────────────
    
    # ✅ Get notifications for current user
    path('notifications/', list_notifications, name='notifications_list'),
    
    # ✅ Mark notifications as read
    path('notifications/mark_read/', mark_notifications_read, name='notifications_mark_read'),
    
    
    # ─────────────────────────────────────────────────────────────────────
    # 👤 REGULAR USER ENDPOINTS (/api/applications/)
    # Managed by EventApplicationViewSet via router
    # ─────────────────────────────────────────────────────────────────────
    
    path('', include(user_router.urls)),
    
    
    # ─────────────────────────────────────────────────────────────────────
    # 👮 ADMIN ENDPOINTS (/api/admin/)
    # Managed by Admin ViewSets via router
    # ─────────────────────────────────────────────────────────────────────
    
    path('admin/', include(admin_router.urls)),
    
    
    # ─────────────────────────────────────────────────────────────────────
    # 🐛 DEBUG ENDPOINTS (Remove in production)
    # ─────────────────────────────────────────────────────────────────────
    
    # ✅ Debug equipment field storage (temporary troubleshooting)
    path('applications/debug-equipment/<int:pk>/', debug_equipment, name='debug_equipment'),
]


# =============================================================================
# ✅ OPTIONAL: API Root View (for browsable API)
# =============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_root(request):
    """API root endpoint listing available endpoints"""
    user_role = getattr(request.user, 'organization_role', 'User').upper()
    is_osas = user_role == 'OSAS'
    
    endpoints = {
        'auth': {
            'login': '/api/auth/login/',
            'refresh': '/api/auth/token/refresh/',
            'register': '/api/auth/register/',
            'profile': '/api/auth/user/',
        },
        'user': {
            'applications': '/api/applications/',
            'my_schedule': '/api/applications/schedule/',
            'my_stats': '/api/applications/stats/',
        },
        'equipment': {
            'available': '/api/equipment/available/',
        },
        'notifications': {
            'list': '/api/notifications/',
            'mark_read': '/api/notifications/mark_read/',
        },
    }
    
    if is_osas:
        endpoints['admin'] = {
            'applications': '/api/admin/applications/',
            'users': '/api/admin/users/',
            'equipment': '/api/admin/equipment/',
            'borrowed': '/api/admin/equipment-borrow/',
            'stats': '/api/admin/applications/stats/',
            'export': '/api/admin/applications/export/',
        }
    
    return Response({
        'message': 'Event Management API',
        'user_role': user_role,
        'endpoints': endpoints,
    })

# Add to urlpatterns if you want a root endpoint:
# urlpatterns.insert(0, path('', api_root, name='api-root'))