from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import CustomUser


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'user': user_data,
                'token': token.key,
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': user_data,
                'token': token.key,
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Login failed',
            'errors': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        try:
            request.user.auth_token.delete()
        except:
            pass
        return Response({
            'success': True,
            'message': 'Logout successful',
        }, status=status.HTTP_200_OK)


def hello(request):
    return JsonResponse({'message': 'Hello from Django backend!'})
