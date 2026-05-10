
from django.contrib import admin
from .models import EventApplication, Equipment, EquipmentBorrow

# ✅ Register EventApplication
@admin.register(EventApplication)
class EventApplicationAdmin(admin.ModelAdmin):
    list_display = ['event_name', 'event_type', 'user', 'status', 'event_date', 'venue', 'created_at']
    list_filter = ['status', 'event_type', 'created_at']
    search_fields = ['event_name', 'description', 'user__email', 'contact_person']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Event Details', {'fields': ('user', 'event_name', 'event_type', 'description', 'purpose')}),
        ('Date & Time', {'fields': ('event_date', 'start_date', 'end_date', 'start_time', 'end_time')}),
        ('Location', {'fields': ('venue',)}),
        ('Resources', {'fields': ('equipment', 'expected_attendees', 'estimated_budget')}),
        ('Contact', {'fields': ('contact_person', 'contact_email', 'contact_phone')}),
        ('Status', {'fields': ('status', 'document')}),
    )


# ✅ Register Equipment
@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['equipment_id', 'equipment_name', 'category', 'status', 'condition', 'quantity_total', 'created_at']
    list_filter = ['status', 'condition', 'category', 'created_at']
    search_fields = ['equipment_id', 'equipment_name', 'category']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Equipment Info', {'fields': ('equipment_id', 'equipment_name', 'category', 'description')}),
        ('Status & Condition', {'fields': ('status', 'condition')}),
        ('Quantity', {'fields': ('quantity_total', 'quantity_available')}),
        ('Purchase Info', {'fields': ('purchase_date', 'purchase_cost')}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )


# ✅ Register EquipmentBorrow
@admin.register(EquipmentBorrow)
class EquipmentBorrowAdmin(admin.ModelAdmin):
    list_display = ['equipment', 'user', 'borrow_date', 'expected_return_date', 'status', 'is_overdue']
    list_filter = ['status', 'borrow_date', 'expected_return_date']
    search_fields = ['equipment__equipment_name', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['borrow_date']
    
    fieldsets = (
        ('Borrow Details', {'fields': ('equipment', 'event_application', 'user', 'quantity_borrowed')}),
        ('Dates', {'fields': ('borrow_date', 'expected_return_date', 'actual_return_date')}),
        ('Return Info', {'fields': ('status', 'condition_on_return', 'notes', 'damage_notes')}),
    )
