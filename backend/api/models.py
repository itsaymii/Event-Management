from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid


# =============================================================================
# CUSTOM USER MANAGER (FIXED for createsuperuser)
# =============================================================================
class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier.
    Handles user creation with email instead of username.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        
        # Auto-generate username from email if not provided (for Django compatibility)
        if 'username' not in extra_fields or not extra_fields.get('username'):
            extra_fields['username'] = email.split('@')[0]
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        This fixes the createsuperuser command!
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('organization_role', 'OSAS')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        # Auto-generate username from email for Django admin compatibility
        if 'username' not in extra_fields or not extra_fields.get('username'):
            extra_fields['username'] = email.split('@')[0]
        
        # ✅ Create user with email as primary identifier
        return self.create_user(email, password, **extra_fields)


# =============================================================================
# CUSTOM USER MODEL
# =============================================================================
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('User', 'Regular User'),
        ('OSAS', 'OSAS Administrator'),
        ('Property', 'Property Manager'),
    ]
    
    # ✅ Primary Key (UUID)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # ✅ Unique Email (Login Identifier)
    email = models.EmailField(unique=True)
    
    # ✅ Make username optional but still unique for Django admin compatibility
    username = models.CharField(
        max_length=150, 
        unique=True, 
        blank=True,  # ✅ Allow blank for email-based registration
        null=True    # ✅ Allow null for email-based registration
    )
    
    # ✅ Organization Role (Indexed for faster filtering)
    organization_role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='User',
        db_index=True
    )
    
    # ✅ Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ✅ Django Auth Configuration
    USERNAME_FIELD = 'email'  # Login using email instead of username
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Fields required for createsuperuser
    
    # ✅ Use the custom manager
    objects = CustomUserManager()
    
    def __str__(self):
        return self.email
    
    # ✅ Helper properties for easy role checking
    @property
    def is_osas(self):
        return self.organization_role == 'OSAS'
    
    @property
    def is_property(self):
        return self.organization_role == 'Property'
    
    class Meta:
        db_table = 'custom_users'
        verbose_name = 'Custom User'
        verbose_name_plural = 'Custom Users'
        ordering = ['-created_at']
