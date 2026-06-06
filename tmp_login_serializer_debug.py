import os
import sys
import json

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "backend")

# Ensure both repo root and backend root are on sys.path so "api" is importable
for p in (PROJECT_ROOT, BACKEND_ROOT):
    if p not in sys.path:
        sys.path.insert(0, p)

# Use the same settings module Django reports on runserver: backend.settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django
django.setup()

from api.serializers import UserLoginSerializer

payload = {"email": "testuser", "username": "testuser", "password": "test"}
ser = UserLoginSerializer(data=payload)

print("IS_VALID:", ser.is_valid())
if not ser.is_valid():
    print("ERRORS:", json.dumps(ser.errors, default=str, indent=2))
else:
    user = ser.validated_data["user"]
    print(
        "USER:",
        {
            "email": getattr(user, "email", None),
            "username": getattr(user, "username", None),
            "role": getattr(user, "organization_role", None),
        },
    )
