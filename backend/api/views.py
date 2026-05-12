from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import CustomUser


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            print(f"📥 Registration request data: {request.data}")
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                user_data = UserSerializer(user).data
                print(f"✅ User created successfully: {user.email}")
                return Response({
                    'success': True,
                    'message': 'User registered successfully',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user_id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'organization_role': user.organization_role,
                }, status=status.HTTP_201_CREATED)
            
            print(f"❌ Registration validation failed: {serializer.errors}")
            return Response({
                'success': False,
                'message': 'Registration failed',
                'errors': serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"❌ Registration exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': 'Registration server error',
                'detail': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                refresh = RefreshToken.for_user(user)
                user_data = UserSerializer(user).data
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user_id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'organization_role': user.organization_role,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                }, status=status.HTTP_200_OK)

            # 🔴 DEBUG: Log validation errors
            print(f"❌ Login validation failed: {serializer.errors}")
            print(f"❌ Request data: {request.data}")
            return Response({
                'success': False,
                'message': 'Login failed',
                'detail': 'Invalid credentials',
                'errors': serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"❌ Login exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {
                    'success': False,
                    'message': 'Login server error',
                    'detail': str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
