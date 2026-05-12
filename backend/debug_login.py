"""
Quick debug script to check users and test login serializer
Run: python debug_login.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import CustomUser
from api.serializers import UserLoginSerializer

print("\n" + "="*60)
print("🔍 CHECKING USERS IN DATABASE")
print("="*60)

users = CustomUser.objects.all()
print(f"\nTotal users: {users.count()}\n")

for user in users:
    print(f"  Email: {user.email}")
    print(f"  Username: {user.username}")
    print(f"  First Name: {user.first_name}")
    print(f"  Role: {user.organization_role}")
    print(f"  Is Active: {user.is_active}")
    print(f"  Is Staff: {user.is_staff}")
    print()

print("="*60)
print("🧪 TESTING LOGIN SERIALIZER")
print("="*60)

# Test with email
test_payload = {
    'email': 'admin1@email.com',
    'password': 'Admin101'
}

print(f"\nTesting with payload: {test_payload}\n")
serializer = UserLoginSerializer(data=test_payload)

if serializer.is_valid():
    print("✅ VALID - Login should work!")
    print(f"   User: {serializer.validated_data['user']}")
else:
    print("❌ INVALID - Serializer errors:")
    print(f"   {serializer.errors}")

print("\n" + "="*60)
