"""
Reset password for admin1@email.com
Run: python reset_password.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import CustomUser

email = 'admin1@email.com'
new_password = 'Admin101'

try:
    user = CustomUser.objects.get(email=email)
    user.set_password(new_password)
    user.save()
    print(f"✅ Password reset successful for {email}")
    print(f"   New password: {new_password}")
except CustomUser.DoesNotExist:
    print(f"❌ User not found: {email}")
