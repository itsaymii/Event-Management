"""
Set password for recently registered user
Run: python set_recent_password.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import CustomUser

# Get the most recent user
recent_user = CustomUser.objects.all().order_by('-date_joined').first()

if recent_user:
    print(f"\n🔍 Most recent user: {recent_user.email}")
    
    # Set a test password
    test_password = "TestPassword123!"
    recent_user.set_password(test_password)
    recent_user.save()
    
    print(f"✅ Password set to: {test_password}")
    print(f"\n📝 Try logging in with:")
    print(f"   Email: {recent_user.email}")
    print(f"   Password: {test_password}")
else:
    print("❌ No users found in database")
