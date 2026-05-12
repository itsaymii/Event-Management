"""
Test if a recently registered user's password works
Run: python test_recent_user.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import CustomUser
from api.serializers import UserLoginSerializer

print("\n" + "="*60)
print("🔍 CHECKING MOST RECENT USERS")
print("="*60)

# Get the most recent 3 users
recent_users = CustomUser.objects.all().order_by('-date_joined')[:3]
print(f"\nMost recent users:\n")

for user in recent_users:
    print(f"  Email: {user.email}")
    print(f"  Username: {user.username}")
    print(f"  First Name: {user.first_name}")
    print(f"  Role: {user.organization_role}")
    print(f"  Has password: {bool(user.password)}")
    print(f"  Password hash: {user.password[:30]}..." if user.password else "  No password hash")
    print()

if recent_users.exists():
    latest = recent_users[0]
    print("="*60)
    print("🧪 TESTING LOGIN WITH MOST RECENT USER")
    print("="*60)
    print(f"\nUser: {latest.email}")
    print("Testing different passwords:\n")
    
    # List of passwords to test
    test_passwords = [
        'Test@1234',  # strong password
        'test@1234',  # lowercase version
        'Password123!',  # common password
        'admin123',  # simple password
    ]
    
    for pwd in test_passwords:
        test_payload = {
            'email': latest.email,
            'password': pwd
        }
        serializer = UserLoginSerializer(data=test_payload)
        if serializer.is_valid():
            print(f"  ✅ Password '{pwd}' WORKS!")
            break
        else:
            print(f"  ❌ Password '{pwd}' - Invalid")
    
    print("\n" + "="*60)
