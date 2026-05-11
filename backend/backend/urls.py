# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings  # ADD THIS
from django.conf.urls.static import static  # ADD THIS

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('dashboard.urls')),  # ← Prefix must be 'api/'  # JWT auth endpoints
    path('', include('dashboard.urls')),  # Dashboard app endpoints
]

# Serve media files during development ONLY
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
