# dashboard/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone
import json

class EventApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    EVENT_TYPE_CHOICES = [
        ('Conference', 'Conference'),
        ('Workshop', 'Workshop'),
        ('Seminar', 'Seminar'),
        ('Concert', 'Concert'),
        ('Festival', 'Festival'),
        ('Exhibition', 'Exhibition'),
        ('Sports Event', 'Sports Event'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    
    # ✅ Core event fields
    event_name = models.CharField(max_length=255)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    description = models.TextField()
    
    # ✅ DATE FIELDS - event_date is primary, start_date/end_date are aliases for frontend compatibility
    event_date = models.DateField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True, help_text='Alias for event_date')
    end_date = models.DateField(null=True, blank=True)
    
    # ✅ Time fields
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    # ✅ Location/Venue
    venue = models.CharField(max_length=255, null=True, blank=True)
    
    # ✅ Content
    purpose = models.TextField(null=True, blank=True)
    
    # ✅ Equipment as JSON string (SQLite compatible)
    equipment = models.TextField(default='[]', blank=True, help_text='Store as JSON string')
    
    # ✅ Numbers & Budget
    expected_attendees = models.IntegerField(null=True, blank=True)
    estimated_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # ✅ Contact Information
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    
    # ✅ Status & Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    document = models.FileField(upload_to='applications/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'event_applications'
        verbose_name = 'Event Application'
        verbose_name_plural = 'Event Applications'

    def __str__(self):
        return f"{self.event_name} ({self.status})"
    
    def get_equipment_list(self):
        if isinstance(self.equipment, str):
            try:
                return json.loads(self.equipment)
            except (json.JSONDecodeError, TypeError):
                return []
        return self.equipment if isinstance(self.equipment, list) else []
    
    # ✅ IMPROVED SAVE LOGIC
    def save(self, *args, **kwargs):
        # Kung may event_date pero walang start_date, copy to start_date
        if self.event_date and not self.start_date:
            self.start_date = self.event_date
        
        # Kung may start_date pero walang event_date, copy to event_date
        elif self.start_date and not self.event_date:
            self.event_date = self.start_date
            
        super().save(*args, **kwargs)


# =============================================================================
# ✅ EQUIPMENT INVENTORY MODEL
# =============================================================================
class Equipment(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('borrowed', 'Borrowed'),
        ('maintenance', 'Maintenance'),
        ('damaged', 'Damaged'),
    ]

    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]

    # Equipment Details
    equipment_id = models.CharField(max_length=50, unique=True, db_index=True)  # Unique code/ID
    equipment_name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)  # e.g., Audio, Visual, Lighting
    
    # Status & Condition
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', db_index=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='excellent')
    
    # Tracking
    quantity_available = models.IntegerField(default=1)
    quantity_total = models.IntegerField(default=1)
    
    # Metadata
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['equipment_id']
        db_table = 'equipment'
        verbose_name = 'Equipment'
        verbose_name_plural = 'Equipment'

    def __str__(self):
        return f"{self.equipment_id} - {self.equipment_name}"


# =============================================================================
# ✅ EQUIPMENT BORROW RECORD MODEL (Tracking borrowed equipment)
# =============================================================================
class EquipmentBorrow(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active (Currently Borrowed)'),
        ('returned', 'Returned'),
        ('damaged_return', 'Returned - Damaged'),
    ]

    # Relationships
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='borrow_records')
    event_application = models.ForeignKey(EventApplication, on_delete=models.CASCADE, related_name='equipment_records', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='equipment_borrows')

    # Borrow Details
    quantity_borrowed = models.IntegerField(default=1)
    borrow_date = models.DateTimeField(auto_now_add=True)
    expected_return_date = models.DateField(null=True, blank=True)
    actual_return_date = models.DateField(null=True, blank=True)
    
    # Status & Condition
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    condition_on_return = models.CharField(max_length=20, choices=Equipment.CONDITION_CHOICES, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    damage_notes = models.TextField(null=True, blank=True)  # For damage reports

    class Meta:
        ordering = ['-borrow_date']
        db_table = 'equipment_borrow_records'
        verbose_name = 'Equipment Borrow Record'
        verbose_name_plural = 'Equipment Borrow Records'

    def __str__(self):
        return f"{self.equipment.equipment_name} - Borrowed by {self.user.email} ({self.status})"
    
    @property
    def is_overdue(self):
        """Check if equipment is overdue"""
        if self.status == 'active' and self.expected_return_date:
            return timezone.now().date() > self.expected_return_date
        return False