# 🎯 Equipment Management System - PELEC Admin Dashboard

## Overview
A complete equipment inventory and tracking system integrated into the PELEC admin dashboard. Monitor equipment availability, track borrowed items, manage returns, and detect overdue equipment.

---

## 📋 Features

### Equipment Inventory Management
- ✅ **Add/Edit/Delete Equipment** - Manage equipment inventory
- ✅ **Status Tracking** - Available, Borrowed, Maintenance, Damaged
- ✅ **Condition Assessment** - Excellent, Good, Fair, Poor
- ✅ **Quantity Management** - Track total and available quantities
- ✅ **Categories** - Organize equipment by type (Audio, Visual, Lighting, Accessories)
- ✅ **Search & Filter** - Find equipment quickly
- ✅ **Purchase Info** - Record purchase date and cost

### Borrow/Return Tracking
- ✅ **Borrow Records** - Track who borrowed what and when
- ✅ **Expected Return Dates** - Set borrow duration
- ✅ **Overdue Detection** - Automatic alerts for late returns
- ✅ **Return Processing** - Record condition on return
- ✅ **Damage Reporting** - Document equipment damage
- ✅ **Return History** - View all past borrow records

### Dashboard Analytics
- ✅ **Equipment Statistics** - Total, Available, Borrowed, Maintenance, Damaged counts
- ✅ **Overdue Alerts** - Visual warnings for overdue items
- ✅ **Real-time Status** - Live availability tracking

---

## 🚀 Getting Started

### 1. Access Equipment Management
In the admin dashboard sidebar, you'll see two new menu items:
- **Equipment** - Manage inventory
- **Borrowed Items** - Track active borrows and returns

### 2. Equipment Tab Features

#### View Equipment
```
Dashboard View:
- Total Equipment count
- Available count
- Borrowed count
- Maintenance count
- Damaged count
```

#### Add New Equipment
1. Click "Add Equipment" button
2. Fill in the form:
   - Equipment ID (unique code, e.g., "AUD-001")
   - Equipment Name
   - Description
   - Category
   - Status (default: Available)
   - Condition (default: Excellent)
   - Total Quantity
   - Purchase Date (optional)
   - Purchase Cost (optional)
3. Click "Add Equipment"

#### Edit Equipment
1. Click the edit icon (pencil) on any equipment row
2. Modify the information
3. Click "Update Equipment"

#### Delete Equipment
1. Click the delete icon (trash) on any equipment row
2. Confirm the deletion

#### Filter & Search
- Use the search box to find equipment by ID or name
- Use the Status filter to view equipment by status

### 3. Borrowed Items Tab Features

#### View Currently Borrowed Items
Tab: **Currently Borrowed**
Shows all active equipment loans with:
- Equipment name
- Borrower name and email
- Event name (if linked)
- Borrow date
- Due date
- Days remaining until due

#### View Overdue Items
Tab: **Overdue**
Shows all overdue equipment with:
- Equipment name
- Borrower information
- How many days overdue
- Alert highlighting

#### Record Equipment Return
1. Click "Record Return" button on any borrowed item
2. Fill in return details:
   - **Condition on Return** - Select condition (Excellent, Good, Fair, Poor)
   - **Notes** - General notes about the return
   - **Damage Notes** (if condition is Poor) - Describe any damage
3. Click "Confirm Return"
4. Equipment status automatically updates:
   - If condition is "Poor" → Equipment marked as "Damaged"
   - Otherwise → Equipment marked as "Available"

---

## 🔧 API Endpoints

### Equipment Endpoints
```
GET    /api/admin/equipment/              # List all equipment
POST   /api/admin/equipment/              # Create new equipment
GET    /api/admin/equipment/{id}/         # Get equipment details
PUT    /api/admin/equipment/{id}/         # Update equipment
DELETE /api/admin/equipment/{id}/         # Delete equipment
GET    /api/admin/equipment/stats/        # Get equipment statistics
POST   /api/admin/equipment/{id}/mark_available/   # Mark as available
POST   /api/admin/equipment/{id}/mark_maintenance/ # Mark for maintenance
```

### Borrow Record Endpoints
```
GET    /api/admin/equipment-borrow/              # List all borrow records
POST   /api/admin/equipment-borrow/              # Create borrow record
GET    /api/admin/equipment-borrow/{id}/         # Get borrow record
PUT    /api/admin/equipment-borrow/{id}/         # Update borrow record
DELETE /api/admin/equipment-borrow/{id}/         # Delete borrow record
GET    /api/admin/equipment-borrow/currently_borrowed/  # Active borrows
GET    /api/admin/equipment-borrow/overdue/             # Overdue items
POST   /api/admin/equipment-borrow/{id}/record_return/  # Record return
```

### Query Parameters
```
/api/admin/equipment/?status=borrowed        # Filter by status
/api/admin/equipment/?category=Audio         # Filter by category
/api/admin/equipment/?search=microphone      # Search equipment
/api/admin/equipment-borrow/?status=active   # Filter active borrows
/api/admin/equipment-borrow/?overdue=true    # Get overdue items
```

---

## 📊 Database Schema

### Equipment Model
```python
- id (Primary Key)
- equipment_id (Unique, e.g., "AUD-001")
- equipment_name
- description
- category
- status (available, borrowed, maintenance, damaged)
- condition (excellent, good, fair, poor)
- quantity_total
- quantity_available
- purchase_date
- purchase_cost
- created_at
- updated_at
```

### EquipmentBorrow Model
```python
- id (Primary Key)
- equipment (Foreign Key to Equipment)
- event_application (Foreign Key to EventApplication)
- user (Foreign Key to CustomUser)
- quantity_borrowed
- borrow_date
- expected_return_date
- actual_return_date
- status (active, returned, damaged_return)
- condition_on_return
- notes
- damage_notes
- is_overdue (Property)
```

---

## 📱 Frontend Components

### AdminEquipmentManagement.jsx
Main equipment inventory management interface
- Location: `/admin/equipment`
- Features:
  - Equipment listing with sorting/filtering
  - Add/Edit/Delete forms
  - Status badges with color coding
  - Statistics dashboard
  - Search functionality

### BorrowedEquipmentTracking.jsx
Borrow record management and return processing
- Location: `/admin/borrowed`
- Features:
  - Currently borrowed items view
  - Overdue items detection
  - Equipment return form
  - Days overdue/remaining calculation
  - Damage assessment

---

## 🛠️ Administrative Tasks

### Sample Data
To populate sample equipment for testing:
```bash
python backend/manage.py populate_equipment
```

This loads 12 sample equipment items across categories:
- Audio Equipment (Microphones, Speakers, Mixer)
- Visual Equipment (Projectors, Screens, Camera)
- Lighting Equipment (LED Panels, Stage Lights, Stands)
- Accessories (Cables, Stands)

### Django Admin Access
Equipment can also be managed via Django admin:
```
/admin/dashboard/equipment/
/admin/dashboard/equipmentborrow/
```

---

## 🔒 Permissions
- **OSAS Role Required** - Only OSAS administrators can access equipment management
- **Automatic Equipment Updates** - Equipment status and availability update automatically on return
- **Audit Trail** - All borrow/return records are timestamped

---

## 💡 Usage Tips

### Best Practices
1. **Unique IDs** - Use consistent equipment ID format (e.g., CAT-001, CAT-002)
2. **Categories** - Organize by type for easier searching
3. **Condition Tracking** - Always assess condition on return
4. **Return Promptly** - Process returns immediately to update availability
5. **Regular Audits** - Check for overdue items regularly

### Scenarios

**Scenario 1: Equipment is borrowed for an event**
1. Event application is approved
2. Borrow record created when equipment is given out
3. Expected return date set
4. Staff checks "Borrowed Items" tab regularly
5. When returned, staff clicks "Record Return"

**Scenario 2: Equipment has damage**
1. On return, select condition "Poor"
2. Enter damage details in "Damage Notes"
3. Equipment marked as "Damaged" automatically
4. Later, mark as "Maintenance" when sent for repair
5. Mark as "Available" when repair is complete

**Scenario 3: Equipment is overdue**
1. Overdue tab shows items past due date
2. Admin contacts borrower
3. When returned, process normally
4. Alert clears automatically

---

## 🐛 Troubleshooting

### Equipment Not Showing
- Check if equipment status filter is applied
- Try searching by equipment ID
- Verify equipment was added successfully in Django admin

### Borrow Records Not Updating
- Refresh the page manually
- Check if equipment quantity is set correctly
- Verify user has OSAS role

### Return Form Not Submitting
- Ensure all required fields are filled
- Check browser console for errors
- Verify API endpoint is accessible

---

## 📞 Support
For issues or questions, contact the development team or check the system logs.

---

**Last Updated:** May 9, 2026
**System Version:** 1.0
**Status:** ✅ Production Ready
