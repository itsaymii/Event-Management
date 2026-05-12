from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from django.core.validators import MinLengthValidator
import json

User = get_user_model()
from .models import EventApplication, Equipment, EquipmentBorrow, Notification


# REGISTRATION SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[MinLengthValidator(8)],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(write_only=True, required=True)
    organization_role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        default='User',
        required=False
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'organization_role'
        ]
        extra_kwargs = {
            'username': {'required': True, 'min_length': 3},
            'email': {'required': True},
            'first_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists'})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'A user with this username already exists'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            organization_role=validated_data.get('organization_role', 'User'),
            is_active=True
        )


# PROFILE UPDATE SERIALIZER
class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
        read_only_fields = ['email']

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError('Email already in use')
        return value


# PASSWORD CHANGE SERIALIZER
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[MinLengthValidator(8)],
        style={'input_type': 'password'}
    )
    confirm_new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'New passwords do not match'})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        if not user.check_password(self.validated_data['old_password']):
            raise serializers.ValidationError({'old_password': 'Current password is incorrect'})
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


# USER SERIALIZER
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    application_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_staff', 'is_superuser', 'date_joined',
            'application_count', 'organization_role',
        ]
        read_only_fields = ['id', 'date_joined', 'application_count']

    def get_full_name(self, obj):
        full = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return full if full else obj.username

    def get_application_count(self, obj):
        return obj.applications.count() if hasattr(obj, 'applications') else 0


# SHARED HELPER
def parse_equipment_field(raw):
    """
    Accepts multiple shapes for the equipment field:
      - None / '' / '[]' / 'null'  -> []
      - JSON string:
          '["projector","pa_system"]' -> ['projector', 'pa_system']
          '[{"equipment_id": 10, "quantity": 1}]' -> [{'equipment_id': 10, 'quantity': 1}]
      - Python list:
          ['projector', 'pa_system'] -> ['projector', 'pa_system']
          [10, 12] -> ['10','12'] (stringified IDs)
          [{'equipment_id': 10, 'quantity': 1}] -> same dicts (preserved)
      - single scalar like 'projector' -> ['projector']
    Always returns a list where:
      - dict entries are preserved as dicts (so get_equipment_details can read equipment_id/quantity)
      - non-dict entries are converted to non-empty strings
    """
    if raw is None:
        return []
    if raw == '' or raw == '[]' or raw == 'null':
        return []

    if isinstance(raw, list):
        result = []
        for item in raw:
            if item is None or item == '':
                continue
            if isinstance(item, dict):
                # Preserve dicts as-is; callers handle fields inside
                result.append(item)
            else:
                s = str(item).strip()
                if s:
                    result.append(s)
        return result

    if isinstance(raw, str):
        stripped = raw.strip()
        if stripped in ('', '[]', 'null'):
            return []
        try:
            loaded = json.loads(stripped)
        except (json.JSONDecodeError, ValueError):
            return [stripped]

        if isinstance(loaded, list):
            result = []
            for item in loaded:
                if item is None or item == '':
                    continue
                if isinstance(item, dict):
                    result.append(item)
                else:
                    s = str(item).strip()
                    if s:
                        result.append(s)
            return result

        # If JSON parses into a single non-list value, keep it as a 1-item list
        if loaded is not None:
            s = str(loaded).strip()
            return [s] if s else []
        return []

    # Fallback scalar (e.g., int)
    s = str(raw).strip()
    return [s] if s else []


# EVENT APPLICATION SERIALIZER
class EventApplicationSerializer(serializers.ModelSerializer):
    submission_date = serializers.DateTimeField(source='created_at', read_only=True)
    status_display  = serializers.CharField(source='get_status_display', read_only=True)
    location        = serializers.SerializerMethodField(read_only=True)
    event_date      = serializers.SerializerMethodField(read_only=True)
    equipment_records = serializers.SerializerMethodField(read_only=True)
    equipment_details = serializers.SerializerMethodField(read_only=True)

    # Accept the equipment field as a plain string on write (multipart sends a string).
    # validate_equipment normalises it to a compact JSON array string before saving.
    # to_representation converts it back to a parsed list on read.
    equipment = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        default='[]',
    )

    class Meta:
        model  = EventApplication
        fields = '__all__'
        read_only_fields = ['id', 'status', 'user', 'created_at', 'updated_at']

    def get_equipment_records(self, obj):
        """Get all borrowed equipment for this application"""
        from .models import EquipmentBorrow
        borrow_records = obj.equipment_records.all()
        serializer = EquipmentBorrowSerializer(borrow_records, many=True)
        return serializer.data

    def get_equipment_details(self, obj):
        """
        Resolve equipment IDs to full equipment objects with names and details.
        Handles both plain IDs and dicts with equipment_id and quantity.
        """
        equipment_list = parse_equipment_field(obj.equipment)
        result = []
        for item in equipment_list:
            try:
                if isinstance(item, dict):
                    equipment_id = item.get('equipment_id')
                    quantity = item.get('quantity', 1)
                else:
                    # Try to parse as integer ID
                    try:
                        equipment_id = int(item)
                        quantity = 1
                    except (ValueError, TypeError):
                        continue

                equipment = Equipment.objects.get(id=equipment_id)
                result.append({
                    'equipment_id': equipment.id,
                    'equipment_code': equipment.equipment_id,
                    'equipment_name': equipment.equipment_name,
                    'quantity': quantity,
                    'category': equipment.category,
                })
            except Equipment.DoesNotExist:
                # Skip if equipment doesn't exist
                pass
        return result

    # ── WRITE: normalise incoming value to a JSON array string ───────────────
    def validate_equipment(self, value):
        """
        Whatever arrives (string, list, None) gets stored as '["id1","id2"]'.
        This is the critical step that was missing before — without it the raw
        string from multipart/form-data was saved without any normalisation,
        and sometimes not saved at all because SerializerMethodField is read-only.
        """
        ids = parse_equipment_field(value)
        return json.dumps(ids)

    def get_event_date(self, obj):
        return obj.event_date or obj.start_date

    def get_location(self, obj):
        return getattr(obj, 'venue', None) or getattr(obj, 'location', None) or ''

    def validate(self, data):
        if not data.get('event_name'):
            raise serializers.ValidationError({'event_name': 'Event name is required'})
        if not data.get('event_date') and not data.get('start_date'):
            raise serializers.ValidationError({'event_date': 'Event date is required'})
        if not data.get('venue'):
            raise serializers.ValidationError({'venue': 'Venue is required'})
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['user'] = request.user
        return super().create(validated_data)

    # ── READ: replace the stored JSON string with a parsed list ─────────────
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['equipment'] = parse_equipment_field(instance.equipment)
        return rep

# ADMIN APPLICATION SERIALIZER
class AdminApplicationSerializer(serializers.ModelSerializer):
    user_email             = serializers.EmailField(source='user.email', read_only=True)
    user_username          = serializers.CharField(source='user.username', read_only=True)
    user_full_name         = serializers.SerializerMethodField(read_only=True)
    user_organization_role = serializers.CharField(source='user.organization_role', read_only=True)
    submission_date        = serializers.DateTimeField(source='created_at', read_only=True)
    status_display         = serializers.CharField(source='get_status_display', read_only=True)
    location               = serializers.SerializerMethodField(read_only=True)
    equipment_records      = serializers.SerializerMethodField(read_only=True)
    equipment_details      = serializers.SerializerMethodField(read_only=True)

    equipment = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        default='[]',
    )

    class Meta:
        model  = EventApplication
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_equipment_records(self, obj):
        """Get all borrowed equipment for this application"""
        from .models import EquipmentBorrow
        borrow_records = obj.equipment_records.all()
        serializer = EquipmentBorrowSerializer(borrow_records, many=True)
        return serializer.data

    def get_equipment_details(self, obj):
        """
        Resolve equipment IDs to full equipment objects with names and details.
        Handles both plain IDs and dicts with equipment_id and quantity.
        """
        equipment_list = parse_equipment_field(obj.equipment)
        result = []
        for item in equipment_list:
            try:
                if isinstance(item, dict):
                    equipment_id = item.get('equipment_id')
                    quantity = item.get('quantity', 1)
                else:
                    # Try to parse as integer ID
                    try:
                        equipment_id = int(item)
                        quantity = 1
                    except (ValueError, TypeError):
                        continue

                equipment = Equipment.objects.get(id=equipment_id)
                result.append({
                    'equipment_id': equipment.id,
                    'equipment_code': equipment.equipment_id,
                    'equipment_name': equipment.equipment_name,
                    'quantity': quantity,
                    'category': equipment.category,
                })
            except Equipment.DoesNotExist:
                # Skip if equipment doesn't exist
                pass
        return result

    def validate_equipment(self, value):
        ids = parse_equipment_field(value)
        return json.dumps(ids)

    def get_user_full_name(self, obj):
        if obj.user:
            full = f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip()
            return full if full else obj.user.username
        return None

    def get_location(self, obj):
        return getattr(obj, 'venue', None) or getattr(obj, 'location', None) or ''

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['equipment'] = parse_equipment_field(instance.equipment)
        return rep


# APPLICATION LIST SERIALIZER (Lightweight)
class ApplicationListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    location       = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = EventApplication
        fields = [
            'id', 'event_name', 'event_type',
            'event_date', 'start_date', 'venue', 'location',
            'status', 'status_display', 'created_at',
            'expected_attendees', 'estimated_budget'
        ]

    def get_location(self, obj):
        return getattr(obj, 'venue', None) or getattr(obj, 'location', None) or ''


# APPLICATION REVIEW SERIALIZER
class ApplicationReviewSerializer(serializers.Serializer):
    action      = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    reason      = serializers.CharField(required=False, allow_blank=True, max_length=500)
    notify_user = serializers.BooleanField(default=True)

    def validate(self, attrs):
        if attrs.get('action') == 'reject' and not attrs.get('reason'):
            raise serializers.ValidationError({'reason': 'A reason is required when rejecting an application'})
        return attrs


# DASHBOARD STATS SERIALIZER
class DashboardStatsSerializer(serializers.Serializer):
    total_applications        = serializers.IntegerField()
    total_applications_change = serializers.FloatField()
    approved_events           = serializers.IntegerField()
    pending_review            = serializers.IntegerField()
    rejected_applications     = serializers.IntegerField()
    upcoming_events           = serializers.IntegerField()
    recent_submissions        = serializers.IntegerField()
    period_start              = serializers.DateField(read_only=True)
    period_end                = serializers.DateField(read_only=True)
    by_event_type             = serializers.DictField(child=serializers.IntegerField(), read_only=True, required=False)
    status_trend              = serializers.ListField(child=serializers.DictField(), read_only=True, required=False)


# BULK ACTION SERIALIZER
class BulkApplicationActionSerializer(serializers.Serializer):
    application_ids = serializers.ListField(child=serializers.IntegerField(), required=True, min_length=1)
    action          = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    reason          = serializers.CharField(required=False, allow_blank=True, max_length=500)
    notify_users    = serializers.BooleanField(default=True)

    def validate(self, attrs):
        if attrs.get('action') == 'reject' and not attrs.get('reason'):
            raise serializers.ValidationError({'reason': 'A reason is required when rejecting applications'})
        return attrs


# CUSTOM JWT SERIALIZER
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email    = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email']             = user.email
        token['username']          = user.username
        token['user_id']           = str(user.id)
        token['organization_role'] = getattr(user, 'organization_role', 'User')
        token['is_staff']          = user.is_staff
        token['is_superuser']      = user.is_superuser
        token['first_name']        = user.first_name
        token['last_name']         = user.last_name
        return token

    def validate(self, attrs):
        # NOTE: Avoid relying on Django's `authenticate()` because it can differ by
        # auth backend / USERNAME_FIELD handling across environments.
        email    = (attrs.get('email') or '').strip()
        username = (attrs.get('username') or '').strip()
        password = (attrs.get('password') or '').strip()

        if not password:
            raise serializers.ValidationError({'password': 'Password is required'})
        if not email and not username:
            raise serializers.ValidationError({'detail': 'Email or username is required'})

        if email:
            # Be tolerant of casing differences between local & deployed DBs
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                user = None
        else:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = None

        if not user or not user.check_password(password):
            raise serializers.ValidationError({'detail': 'Invalid credentials'})
        if not user.is_active:
            raise serializers.ValidationError({'detail': 'User account is disabled'})

        refresh = self.get_token(user)
        return {
            'refresh':           str(refresh),
            'access':            str(refresh.access_token),
            'user_id':           str(user.id),
            'email':             user.email,
            'username':          user.username,
            'organization_role': getattr(user, 'organization_role', 'User'),
            'is_staff':          user.is_staff,
            'is_superuser':      user.is_superuser,
            'first_name':        user.first_name,
            'last_name':         user.last_name,
            'full_name':         f"{user.first_name} {user.last_name}".strip() or user.username,
        }


# EQUIPMENT SERIALIZERS
class EquipmentSerializer(serializers.ModelSerializer):
    available_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = [
            'id', 'equipment_id', 'equipment_name', 'description', 'category',
            'status', 'condition', 'quantity_available', 'quantity_total',
            'purchase_date', 'purchase_cost', 'created_at', 'updated_at', 'available_quantity'
        ]
        read_only_fields = ['created_at', 'updated_at', 'available_quantity']

    def get_available_quantity(self, obj):
        """Calculate available quantity by checking borrow records"""
        borrowed = obj.borrow_records.filter(status='active').aggregate(
            total=serializers.models.Sum('quantity_borrowed')
        )['total'] or 0
        return max(0, obj.quantity_total - borrowed)


class EquipmentBorrowSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.equipment_name', read_only=True)
    equipment_id = serializers.CharField(source='equipment.equipment_id', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    event_name = serializers.CharField(source='event_application.event_name', read_only=True, allow_null=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = EquipmentBorrow
        fields = [
            'id', 'equipment', 'equipment_name', 'equipment_id', 'event_application', 'event_name',
            'user', 'user_email', 'user_full_name', 'quantity_borrowed',
            'borrow_date', 'expected_return_date', 'actual_return_date',
            'status', 'condition_on_return', 'notes', 'damage_notes', 'is_overdue'
        ]
        read_only_fields = ['id', 'borrow_date', 'equipment_name', 'equipment_id', 'user_email', 'event_name']

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email

    def get_is_overdue(self, obj):
        return obj.is_overdue


# NOTIFICATION SERIALIZER
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'notif_type',
            'title',
            'message',
            'is_read',
            'created_at',
            'payload',
        ]
        read_only_fields = ['id', 'user', 'created_at']
