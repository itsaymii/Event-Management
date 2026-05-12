# views.py - COMPLETE FIXED VERSION
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.utils import timezone
from django.db.models import Count, Q, Sum
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import csv
import io
import json

from .models import EventApplication, Equipment, EquipmentBorrow, Notification
from .serializers import (
    EventApplicationSerializer,
    AdminApplicationSerializer,
    ApplicationListSerializer,
    ApplicationReviewSerializer,
    DashboardStatsSerializer,
    BulkApplicationActionSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,  # ✅ Our fixed JWT serializer
    RegisterSerializer,
    ProfileUpdateSerializer,
    PasswordChangeSerializer,
    EquipmentSerializer,
    EquipmentBorrowSerializer,
    parse_equipment_field,
    NotificationSerializer,
)

User = get_user_model()


# =============================================================================
# ✅ CUSTOM JWT VIEWS (LOGIN & TOKEN REFRESH)
# =============================================================================
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT login view that supports email OR username authentication.
    Uses CustomTokenObtainPairSerializer for flexible credential handling.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = []  # Optional: add throttling if needed


class CustomTokenRefreshView(TokenRefreshView):
    """Custom token refresh view with consistent response format"""
    permission_classes = [permissions.AllowAny]


# =============================================================================
# NOTIFICATION HELPERS
# =============================================================================
def _create_notification(user, notif_type, title, message='', payload=None):
    """Create an in-app notification for the given user."""
    if not user:
        return
    try:
        Notification.objects.create(
            user=user,
            notif_type=notif_type,
            title=title,
            message=message or '',
            payload=payload or None,
        )
    except Exception as e:
        print(f'Notification error: {e}')


# =============================================================================
# NOTIFICATIONS
# =============================================================================
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_notifications(request):
    """Returns notifications for the current logged-in user."""
    qs = Notification.objects.filter(user=request.user).order_by('-created_at')[:50]
    serializer = NotificationSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notifications_read(request):
    """Marks notifications as read."""
    all_flag = str(request.data.get('all', 'false')).lower() == 'true'
    qs = Notification.objects.filter(user=request.user)
    if all_flag:
        qs.update(is_read=True)
    else:
        qs.filter(is_read=False).update(is_read=True)

    qs = Notification.objects.filter(user=request.user).order_by('-created_at')[:50]
    serializer = NotificationSerializer(qs, many=True)
    return Response({'message': 'Notifications marked as read', 'notifications': serializer.data})


# =============================================================================
# CUSTOM PERMISSION CLASSES
# =============================================================================
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'organization_role', None)
        if user_role and str(user_role).upper() == 'OSAS':
            return True
        return obj.user == request.user


class IsOSASRole(permissions.BasePermission):
    message = 'Access denied. OSAS role required.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_role = getattr(request.user, 'organization_role', None)
        return user_role is not None and str(user_role).upper() == 'OSAS'

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsOSASOrPropertyRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'organization_role', None) in ['OSAS', 'Property']

    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'organization_role', None)
        if user_role == 'OSAS':
            return True
        if user_role == 'Property':
            return hasattr(obj, 'property') and obj.property == getattr(request.user, 'property', None)
        return False


# =============================================================================
# CUSTOM PAGINATION
# =============================================================================
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


# =============================================================================
# AUTH VIEWS (REGISTER, PROFILE, PASSWORD)
# =============================================================================
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """User registration endpoint"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully. Please login with your credentials.',
            'user_id': str(user.id),
            'username': user.username,
            'email': user.email,
            'organization_role': user.organization_role,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """Update current user profile"""
    serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': UserSerializer(request.user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Password changed successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# DEBUG VIEW (Temporary - for equipment troubleshooting)
# =============================================================================
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_equipment(request, pk):
    """Temporary endpoint to inspect equipment field storage."""
    try:
        app = EventApplication.objects.get(pk=pk)
        user_role = getattr(request.user, 'organization_role', None)
        if app.user != request.user and user_role != 'OSAS':
            return Response({'error': 'Forbidden'}, status=403)

        return Response({
            'id': app.id,
            'event_name': app.event_name,
            'equipment_raw': app.equipment,
            'equipment_type': type(app.equipment).__name__,
            'equipment_parsed': parse_equipment_field(app.equipment),
            'model_helper': app.get_equipment_list(),
        })
    except EventApplication.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


# =============================================================================
# USER APPLICATION VIEWSET
# =============================================================================
class EventApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for regular users to manage their own event applications."""
    serializer_class = EventApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    pagination_class = StandardResultsSetPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['event_name', 'description', 'event_type', 'venue']
    ordering_fields = ['created_at', 'event_date', 'start_date', 'status', 'event_name']
    ordering = ['-created_at']

    def get_queryset(self):
        user_role = getattr(self.request.user, 'organization_role', None)
        if user_role == 'OSAS':
            return EventApplication.objects.all().select_related('user')
        return EventApplication.objects.filter(user=self.request.user).select_related('user')

    def get_serializer_class(self):
        if self.action == 'list':
            return ApplicationListSerializer
        return EventApplicationSerializer

    def perform_create(self, serializer):
        """Save application and notify OSAS admins."""
        serializer.save(user=self.request.user)
        saved_instance = getattr(serializer, "instance", None)
        if not saved_instance:
            print("[NOTIF][NEW APP] No saved_instance found in perform_create()")
            return

        admins_qs = User.objects.filter(organization_role__iexact='OSAS', is_active=True)
        print(f"[NOTIF][NEW APP] perform_create for app_id={saved_instance.id} admins_count={admins_qs.count()}")

        created = 0
        for admin_user in admins_qs:
            try:
                _create_notification(
                    admin_user,
                    notif_type='review',
                    title='New Application Submitted',
                    message=f'Application "{saved_instance.event_name}" was submitted by {saved_instance.user.username}.',
                    payload={'route': '/admin/review', 'application_id': saved_instance.id}
                )
                created += 1
            except Exception as e:
                print(f"[NOTIF][NEW APP] create_notification failed for user_id={admin_user.id}: {e}")

        print(f"[NOTIF][NEW APP] notifications created={created} for app_id={saved_instance.id}")

    def create(self, request, *args, **kwargs):
        """Override create for equipment debugging logs."""
        raw_equipment = request.data.get('equipment', '<NOT SENT>')
        print(f"\n{'='*60}\n[CREATE] equipment from request: {raw_equipment!r}\n{'='*60}\n")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        normalised = serializer.validated_data.get('equipment', '<MISSING>')
        print(f"\n{'='*60}\n[CREATE] equipment validated: {normalised!r}\n{'='*60}\n")

        self.perform_create(serializer)

        saved_instance = serializer.instance
        if saved_instance:
            print(f"\n{'='*60}\n[CREATE] saved to DB: {saved_instance.equipment!r}\n{'='*60}\n")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'], url_path='schedule')
    def schedule(self, request):
        user_role = getattr(request.user, 'organization_role', None)
        if user_role == 'OSAS':
            queryset = EventApplication.objects.filter(status='approved')
        else:
            queryset = EventApplication.objects.filter(user=request.user, status='approved')

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(event_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(event_date__lte=end_date)

        queryset = queryset.order_by('event_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user_role = getattr(request.user, 'organization_role', None)
        if user_role == 'OSAS':
            queryset = EventApplication.objects.all()
        else:
            queryset = EventApplication.objects.filter(user=request.user)

        now = timezone.now()
        today = now.date()
        current_month_start = today.replace(day=1)
        last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

        total_current = queryset.filter(created_at__date__gte=current_month_start).count()
        total_previous = queryset.filter(
            created_at__date__gte=last_month_start,
            created_at__date__lt=current_month_start
        ).count()

        return Response({
            'totalApplications': total_current,
            'totalApplicationsChange': self._calc_change(total_current, total_previous),
            'approvedEvents': queryset.filter(status='approved').count(),
            'pendingReview': queryset.filter(status='pending').count(),
            'rejectedApplications': queryset.filter(status='rejected').count(),
            'upcomingEvents': queryset.filter(status='approved', event_date__gte=today).count(),
        })

    def _calc_change(self, current, previous):
        if previous == 0:
            return 100 if current > 0 else 0
        return round(((current - previous) / previous) * 100)


# =============================================================================
# ADMIN APPLICATION VIEWSET (OSAS Role Only)
# =============================================================================
class AdminApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = AdminApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOSASRole]
    pagination_class = StandardResultsSetPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['event_name', 'description', 'event_type', 'user__username', 'user__email']
    ordering_fields = ['created_at', 'start_date', 'status', 'event_name', 'user__username']
    ordering = ['-created_at']

    def _get_equipment_from_request_value(self, equipment_value):
        """Resolve equipment by DB id OR equipment code."""
        if equipment_value is None:
            raise ValueError("equipment_id is required")
        value_str = str(equipment_value).strip()
        try:
            value_int = int(value_str)
            return Equipment.objects.get(id=value_int)
        except (ValueError, TypeError, Equipment.DoesNotExist):
            pass
        return Equipment.objects.get(equipment_id=value_str)

    def get_queryset(self):
        queryset = EventApplication.objects.all().select_related('user')
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return AdminApplicationSerializer
        if self.action in ('review', 'approve', 'reject'):
            return ApplicationReviewSerializer
        if self.action == 'stats':
            return DashboardStatsSerializer
        if self.action == 'bulk_action':
            return BulkApplicationActionSerializer
        return AdminApplicationSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        now = timezone.now()
        today = now.date()
        current_month_start = today.replace(day=1)
        last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

        total_current = EventApplication.objects.filter(created_at__date__gte=current_month_start).count()
        total_previous = EventApplication.objects.filter(
            created_at__date__gte=last_month_start,
            created_at__date__lt=current_month_start
        ).count()

        approved = EventApplication.objects.filter(status='approved').count()
        pending = EventApplication.objects.filter(status='pending').count()
        rejected = EventApplication.objects.filter(status='rejected').count()
        upcoming = EventApplication.objects.filter(status='approved', start_date__gte=today).count()
        recent = EventApplication.objects.filter(created_at__gte=now - timedelta(days=7)).count()

        by_event_type = dict(
            EventApplication.objects.values_list('event_type')
            .annotate(count=Count('id')).order_by('-count')
        )

        status_trend = []
        for i in range(7):
            date = today - timedelta(days=6 - i)
            day_stats = EventApplication.objects.filter(created_at__date=date).values('status').annotate(count=Count('id'))
            entry = {'date': date.isoformat(), 'approved': 0, 'pending': 0, 'rejected': 0}
            for item in day_stats:
                entry[item['status']] = item['count']
            status_trend.append(entry)

        top_applicants = User.objects.filter(applications__isnull=False).annotate(
            app_count=Count('applications')
        ).order_by('-app_count')[:5]

        stats_data = {
            'total_applications': total_current,
            'total_applications_change': self._calc_change(total_current, total_previous),
            'approved_events': approved,
            'pending_review': pending,
            'rejected_applications': rejected,
            'upcoming_events': upcoming,
            'recent_submissions': recent,
            'period_start': current_month_start.isoformat(),
            'period_end': today.isoformat(),
            'by_event_type': by_event_type,
            'status_trend': status_trend,
            'top_applicants': [
                {'username': u.username, 'email': u.email, 'application_count': u.app_count}
                for u in top_applicants
            ],
        }
        return Response(DashboardStatsSerializer(stats_data).data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        pending = self.get_queryset().filter(status='pending').order_by('created_at')
        page = self.paginate_queryset(pending)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(pending, many=True).data)

    @action(detail=True, methods=['post'], serializer_class=ApplicationReviewSerializer)
    def review(self, request, pk=None):
        application = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_type = serializer.validated_data['action']
        reason = serializer.validated_data.get('reason', '')
        notify_user = serializer.validated_data.get('notify_user', True)
        old_status = application.status

        application.status = 'approved' if action_type == 'approve' else 'rejected'
        application.save()

        if notify_user:
            self._send_status_notification(application, action_type, reason)
            _create_notification(
                application.user,
                notif_type='review',
                title=f'Application {action_type}d',
                message=f'Your event application "{application.event_name}" has been {action_type}d.',
                payload={'route': '/applications', 'application_id': application.id}
            )

        return Response({
            'status': application.status,
            'previous_status': old_status,
            'message': f'Application {action_type}d successfully',
            'reason': reason if action_type == 'reject' else None,
        })

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve application and create EquipmentBorrow records."""
        application = self.get_object()
        application.status = 'approved'
        application.save()

        equipment_list = application.get_equipment_list()
        if equipment_list:
            try:
                for equipment_item in equipment_list:
                    if isinstance(equipment_item, dict):
                        equipment_value = equipment_item.get('equipment_id')
                        quantity_borrowed = int(equipment_item.get('quantity', 1))
                    else:
                        equipment_value = equipment_item
                        quantity_borrowed = 1

                    equipment = self._get_equipment_from_request_value(equipment_value)
                    borrowed = equipment.borrow_records.filter(status='active').aggregate(
                        total=Sum('quantity_borrowed')
                    )['total'] or 0
                    available = max(0, equipment.quantity_total - borrowed)

                    if quantity_borrowed <= available:
                        EquipmentBorrow.objects.create(
                            equipment=equipment,
                            user=application.user,
                            event_application=application,
                            quantity_borrowed=quantity_borrowed,
                            expected_return_date=application.event_date,
                            status='active'
                        )
                        if available - quantity_borrowed == 0:
                            equipment.status = 'borrowed'
                            equipment.save()
            except Exception as e:
                print(f"Error creating equipment borrow records: {str(e)}")

        _create_notification(
            application.user,
            notif_type='review',
            title='Application Approved',
            message=f'Your event application "{application.event_name}" has been approved.',
            payload={'route': '/applications', 'application_id': application.id}
        )

        return Response({'status': 'approved', 'message': 'Approved', 'application_id': application.id})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        application = self.get_object()
        reason = request.data.get('reason', '')
        application.status = 'rejected'
        application.save()

        _create_notification(
            application.user,
            notif_type='review',
            title='Application Rejected',
            message=f'Your event application "{application.event_name}" has been rejected.'
                    + (f' Reason: {reason}' if reason else ''),
            payload={'route': '/applications', 'application_id': application.id}
        )

        return Response({
            'status': 'rejected',
            'message': 'Rejected',
            'reason': reason,
            'application_id': application.id,
        })

    @action(detail=False, methods=['post'], serializer_class=BulkApplicationActionSerializer)
    def bulk_action(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        app_ids = serializer.validated_data['application_ids']
        action_type = serializer.validated_data['action']
        reason = serializer.validated_data.get('reason', '')
        new_status = 'approved' if action_type == 'approve' else 'rejected'

        qs = self.get_queryset().filter(id__in=app_ids).select_related('user')
        apps = list(qs)
        updated = qs.update(status=new_status)

        for app in apps:
            if app.user:
                _create_notification(
                    app.user,
                    notif_type='review',
                    title='Application Approved' if new_status == 'approved' else 'Application Rejected',
                    message=(
                        f'Your event application "{app.event_name}" has been {new_status}.'
                        + (f' Reason: {reason}' if new_status == 'rejected' and reason else '')
                    ),
                    payload={'route': '/applications', 'application_id': app.id}
                )

        return Response({
            'processed': updated,
            'action': action_type,
            'new_status': new_status,
            'message': f'{updated} applications {action_type}d',
        })

    @action(detail=False, methods=['get'])
    def schedule(self, request):
        approved = EventApplication.objects.filter(status='approved').select_related('user').order_by('start_date')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            approved = approved.filter(start_date__gte=start_date)
        if end_date:
            approved = approved.filter(end_date__lte=end_date)
        event_type = request.query_params.get('event_type')
        if event_type:
            approved = approved.filter(event_type__iexact=event_type)
        return Response(self.get_serializer(approved, many=True).data)

    @action(detail=False, methods=['get'])
    def users(self, request):
        users = User.objects.filter(applications__isnull=False).distinct()
        search = request.query_params.get('search')
        if search:
            users = users.filter(
                Q(username__icontains=search) | Q(email__icontains=search) |
                Q(first_name__icontains=search) | Q(last_name__icontains=search)
            )
        page = self.paginate_queryset(users)
        if page is not None:
            return self.get_paginated_response(UserSerializer(page, many=True).data)
        return Response(UserSerializer(users, many=True).data)

    @action(detail=False, methods=['get'], url_path='export')
    def export_applications(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(['ID', 'Event Name', 'Type', 'Venue', 'Start', 'End', 'Status', 'User', 'Email', 'Created', 'Budget'])
        for app in queryset:
            writer.writerow([
                app.id, app.event_name, app.event_type,
                app.venue or '', app.event_date, app.end_date, app.status,
                app.user.username, app.user.email,
                app.created_at.strftime('%Y-%m-%d %H:%M'),
                app.estimated_budget or '',
            ])
        buffer.seek(0)
        from django.http import HttpResponse
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="applications_{timezone.now().date()}.csv"'
        return response

    def _calc_change(self, current, previous):
        if previous == 0:
            return 100 if current > 0 else 0
        return round(((current - previous) / previous) * 100)

    def _send_status_notification(self, application, action, reason=None):
        if not application.contact_email:
            return
        subject = f'Application "{application.event_name}" has been {action}d'
        message = f'Dear {application.contact_person},\n\nYour event application "{application.event_name}" has been {action}d.'
        if reason and action == 'rejected':
            message += f'\n\nReason: {reason}'
        message += '\n\nIf you have questions, contact our support team.\n\nBest regards,\nOSAS Team'
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [application.contact_email], fail_silently=True)
        except Exception as e:
            print(f'Email error: {e}')


# =============================================================================
# ADMIN USER VIEWSET (OSAS Role Only)
# =============================================================================
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOSASRole]
    pagination_class = StandardResultsSetPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'organization_role']
    ordering_fields = ['date_joined', 'username', 'email', 'organization_role']
    ordering = ['-date_joined']

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role and role in ['User', 'OSAS', 'Property']:
            queryset = queryset.filter(organization_role=role)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) | Q(email__icontains=search) |
                Q(first_name__icontains=search) | Q(last_name__icontains=search)
            )
        return queryset.order_by('-date_joined')

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'user_id': str(user.id),
            'is_active': user.is_active,
            'message': f'User account {"activated" if user.is_active else "deactivated"}',
        })

    @action(detail=True, methods=['post'])
    def update_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get('organization_role')
        valid = ['User', 'OSAS', 'Property']
        if new_role not in valid:
            return Response(
                {'organization_role': f'Must be one of: {", ".join(valid)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if hasattr(user, 'organization_role'):
            user.organization_role = new_role
            user.save()
            return Response({
                'user_id': str(user.id),
                'organization_role': new_role,
                'message': f'User role updated to {new_role}',
            })
        return Response(
            {'error': 'User model does not support organization_role field'},
            status=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# EQUIPMENT MANAGEMENT VIEWSETS
# =============================================================================
class AdminEquipmentViewSet(viewsets.ModelViewSet):
    """ViewSet for OSAS admin to manage equipment inventory."""
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsOSASRole]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['equipment_id', 'equipment_name', 'category']
    ordering_fields = ['equipment_id', 'status', 'created_at']
    ordering = ['equipment_id']

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get equipment statistics"""
        return Response({
            'total_equipment': Equipment.objects.count(),
            'available': Equipment.objects.filter(status='available').count(),
            'borrowed': Equipment.objects.filter(status='borrowed').count(),
            'maintenance': Equipment.objects.filter(status='maintenance').count(),
            'damaged': Equipment.objects.filter(status='damaged').count(),
        })

    @action(detail=True, methods=['post'])
    def mark_available(self, request, pk=None):
        equipment = self.get_object()
        equipment.status = 'available'
        equipment.save()
        _create_notification(
            request.user,
            notif_type='equipment_status',
            title='Equipment status updated',
            message=f'{equipment.equipment_name} is now available.',
            payload={'route': '/admin/equipment', 'equipment_id': equipment.id}
        )
        return Response({'status': 'Equipment marked as available'})

    @action(detail=True, methods=['post'])
    def mark_maintenance(self, request, pk=None):
        equipment = self.get_object()
        equipment.status = 'maintenance'
        equipment.save()
        _create_notification(
            request.user,
            notif_type='equipment_status',
            title='Equipment status updated',
            message=f'{equipment.equipment_name} is now under maintenance.',
            payload={'route': '/admin/equipment', 'equipment_id': equipment.id}
        )
        return Response({'status': 'Equipment marked as maintenance'})


class AdminEquipmentBorrowViewSet(viewsets.ModelViewSet):
    """ViewSet for tracking equipment borrow/return records."""
    queryset = EquipmentBorrow.objects.all()
    serializer_class = EquipmentBorrowSerializer
    permission_classes = [IsOSASRole]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['equipment__equipment_name', 'user__email', 'user__first_name']
    ordering_fields = ['borrow_date', 'expected_return_date', 'status']
    ordering = ['-borrow_date']

    def _get_equipment_from_request_value(self, equipment_value):
        """Resolve equipment by DB id OR equipment code."""
        if equipment_value is None:
            raise ValueError("equipment_id is required")
        value_str = str(equipment_value).strip()
        try:
            value_int = int(value_str)
            return Equipment.objects.get(id=value_int)
        except (ValueError, TypeError, Equipment.DoesNotExist):
            pass
        return Equipment.objects.get(equipment_id=value_str)

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        overdue_filter = self.request.query_params.get('overdue')
        if overdue_filter == 'true':
            queryset = queryset.filter(
                status='active',
                expected_return_date__lt=timezone.now().date()
            )
        return queryset

    @action(detail=False, methods=['get'])
    def currently_borrowed(self, request):
        borrowed_records = self.get_queryset().filter(status='active')
        page = self.paginate_queryset(borrowed_records)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(borrowed_records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        overdue_records = self.get_queryset().filter(
            status='active',
            expected_return_date__lt=timezone.now().date()
        )
        page = self.paginate_queryset(overdue_records)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(overdue_records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def record_return(self, request, pk=None):
        """Record equipment return"""
        borrow_record = self.get_object()
        borrow_record.actual_return_date = timezone.now().date()
        borrow_record.status = 'returned'
        borrow_record.condition_on_return = request.data.get('condition_on_return', 'good')
        borrow_record.notes = request.data.get('notes', '')
        borrow_record.damage_notes = request.data.get('damage_notes', '')

        equipment = borrow_record.equipment
        if borrow_record.condition_on_return == 'poor':
            equipment.status = 'damaged'
            borrow_record.status = 'damaged_return'
        else:
            equipment.status = 'available'

        _create_notification(
            borrow_record.user,
            notif_type='return',
            title='Equipment returned',
            message=f'Your borrowed equipment has been returned.',
            payload={'route': '/admin/borrowed', 'borrow_id': borrow_record.id, 'equipment_id': equipment.id}
        )

        borrow_record.save()
        equipment.save()
        serializer = self.get_serializer(borrow_record)
        return Response({
            'message': 'Equipment return recorded successfully',
            'data': serializer.data
        })

    @action(detail=False, methods=['post'])
    def borrow_equipment(self, request):
        """Create a new equipment borrow record."""
        try:
            equipment_id = request.data.get('equipment_id')
            quantity_borrowed = int(request.data.get('quantity_borrowed', 1))
            expected_return_date = request.data.get('expected_return_date')
            user_id = request.data.get('user_id')
            event_application_id = request.data.get('event_application_id')
            notes = request.data.get('notes', '')

            equipment = self._get_equipment_from_request_value(equipment_id)
            borrowed = equipment.borrow_records.filter(status='active').aggregate(
                total=Sum('quantity_borrowed')
            )['total'] or 0
            available = max(0, equipment.quantity_total - borrowed)

            if quantity_borrowed > available:
                return Response({
                    'error': f'Not enough equipment available. Available: {available}, Requested: {quantity_borrowed}'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.get(id=user_id) if user_id else request.user
            event_application = EventApplication.objects.get(id=event_application_id) if event_application_id else None

            borrow_record = EquipmentBorrow.objects.create(
                equipment=equipment,
                user=user,
                event_application=event_application,
                quantity_borrowed=quantity_borrowed,
                expected_return_date=expected_return_date,
                notes=notes,
                status='active'
            )

            _create_notification(
                user,
                notif_type='borrow',
                title='Equipment borrowed',
                message=f'You borrowed {equipment.equipment_name}. Expected return: {expected_return_date}.',
                payload={'route': '/admin/borrowed', 'borrow_id': borrow_record.id, 'equipment_id': equipment.id}
            )

            if available == quantity_borrowed:
                equipment.status = 'borrowed'
                equipment.save()

            serializer = self.get_serializer(borrow_record)
            return Response({
                'message': 'Equipment borrowed successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Equipment.DoesNotExist:
            return Response({'error': 'Equipment not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except EventApplication.DoesNotExist:
            return Response({'error': 'Event application not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)