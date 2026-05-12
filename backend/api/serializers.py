from rest_framework import serializers
from .models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    username = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'password', 'confirm_password', 'organization_role']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        username = validated_data.pop('username', None)
        
        # Use the provided username, or auto-generate from email
        if not username:
            username = validated_data['email'].split('@')[0]

        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=password,  # ✅ Pass password to create_user
            username=username,  # ✅ Pass username properly
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            organization_role=validated_data.get('organization_role', 'User'),
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    # Accept either email or username
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        if not email and not username:
            raise serializers.ValidationError({'detail': 'Provide either email or username.'})

        user = None
        if email:
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError({'email': 'User not found.'})
        else:
            # IMPORTANT:
            # In this project, registration sets:
            #   username = validated_data['email']
            # So users typically must log in using their email even if the request
            # payload field is `username`.
            #
            # To make login robust, try username first, then fall back to email.
            try:
                user = CustomUser.objects.get(username=username)
            except CustomUser.DoesNotExist:
                try:
                    user = CustomUser.objects.get(email=username)
                except CustomUser.DoesNotExist:
                    raise serializers.ValidationError({'username': 'User not found.'})

        if not user.check_password(password):
            raise serializers.ValidationError({'password': 'Invalid password.'})

        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'organization_role', 'created_at']
