# Equipment Management API - Quick Reference

## Authentication
All requests require the `Authorization: Bearer <access_token>` header.

Get token:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

## Equipment Endpoints Examples

### Get Equipment Statistics
```bash
curl -X GET http://localhost:8000/api/admin/equipment/stats/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "total_equipment": 12,
  "available": 10,
  "borrowed": 1,
  "maintenance": 1,
  "damaged": 0
}
```

### List All Equipment
```bash
curl -X GET http://localhost:8000/api/admin/equipment/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter Equipment by Status
```bash
curl -X GET "http://localhost:8000/api/admin/equipment/?status=available" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Equipment
```bash
curl -X GET "http://localhost:8000/api/admin/equipment/?search=microphone" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create New Equipment
```bash
curl -X POST http://localhost:8000/api/admin/equipment/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "PRJ-001",
    "equipment_name": "Projector",
    "description": "4K Projector",
    "category": "Visual",
    "status": "available",
    "condition": "excellent",
    "quantity_total": 1
  }'
```

### Update Equipment
```bash
curl -X PUT http://localhost:8000/api/admin/equipment/1/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "maintenance",
    "condition": "fair"
  }'
```

### Mark Equipment as Available
```bash
curl -X POST http://localhost:8000/api/admin/equipment/1/mark_available/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark Equipment for Maintenance
```bash
curl -X POST http://localhost:8000/api/admin/equipment/1/mark_maintenance/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Equipment
```bash
curl -X DELETE http://localhost:8000/api/admin/equipment/1/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Borrow Record Endpoints Examples

### Get All Borrow Records
```bash
curl -X GET http://localhost:8000/api/admin/equipment-borrow/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Currently Borrowed Items
```bash
curl -X GET http://localhost:8000/api/admin/equipment-borrow/currently_borrowed/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Overdue Items
```bash
curl -X GET http://localhost:8000/api/admin/equipment-borrow/overdue/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 5,
      "equipment": 1,
      "equipment_name": "Microphone (Shure SM7B)",
      "equipment_id": "AUD-001",
      "event_application": 2,
      "event_name": "Annual Conference 2026",
      "user": "user-uuid",
      "user_email": "user@example.com",
      "user_full_name": "John Doe",
      "quantity_borrowed": 1,
      "borrow_date": "2026-04-20T10:30:00Z",
      "expected_return_date": "2026-04-22",
      "actual_return_date": null,
      "status": "active",
      "condition_on_return": null,
      "notes": null,
      "damage_notes": null,
      "is_overdue": true
    }
  ]
}
```

### Create Borrow Record
```bash
curl -X POST http://localhost:8000/api/admin/equipment-borrow/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipment": 1,
    "event_application": 2,
    "user": "user-uuid",
    "quantity_borrowed": 1,
    "expected_return_date": "2026-04-22"
  }'
```

### Record Equipment Return
```bash
curl -X POST http://localhost:8000/api/admin/equipment-borrow/5/record_return/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "condition_on_return": "good",
    "notes": "Equipment returned in good condition",
    "damage_notes": ""
  }'
```

**Response:**
```json
{
  "message": "Equipment return recorded successfully",
  "data": {
    "id": 5,
    "equipment": 1,
    "equipment_name": "Microphone (Shure SM7B)",
    "status": "returned",
    "actual_return_date": "2026-05-09",
    "condition_on_return": "good",
    "notes": "Equipment returned in good condition"
  }
}
```

### Record Damaged Equipment Return
```bash
curl -X POST http://localhost:8000/api/admin/equipment-borrow/5/record_return/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "condition_on_return": "poor",
    "notes": "Found damage on return",
    "damage_notes": "Speaker cone is torn, needs replacement"
  }'
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (OSAS role required) |
| 404 | Not Found |
| 500 | Server Error |

---

## Filtering & Pagination

### Filter by Status
```
/api/admin/equipment/?status=available
/api/admin/equipment/?status=borrowed
/api/admin/equipment/?status=maintenance
/api/admin/equipment/?status=damaged
```

### Filter by Category
```
/api/admin/equipment/?category=Audio
/api/admin/equipment/?category=Visual
/api/admin/equipment/?category=Lighting
```

### Search
```
/api/admin/equipment/?search=microphone
/api/admin/equipment-borrow/?search=user@email.com
```

### Ordering
```
/api/admin/equipment/?ordering=equipment_id
/api/admin/equipment/?ordering=-created_at
```

### Pagination
```
/api/admin/equipment/?page=1&page_size=10
```

---

## Sample cURL Script

Save this as `test_equipment_api.sh`:

```bash
#!/bin/bash

TOKEN="your_access_token_here"
BASE_URL="http://localhost:8000/api"
HEADERS=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")

echo "Getting Equipment Stats..."
curl -s "${HEADERS[@]}" "$BASE_URL/admin/equipment/stats/" | jq .

echo "\nListing Currently Borrowed Items..."
curl -s "${HEADERS[@]}" "$BASE_URL/admin/equipment-borrow/currently_borrowed/" | jq .

echo "\nListing Overdue Items..."
curl -s "${HEADERS[@]}" "$BASE_URL/admin/equipment-borrow/overdue/" | jq .
```

Run it:
```bash
chmod +x test_equipment_api.sh
./test_equipment_api.sh
```

---

**API Documentation Version:** 1.0  
**Last Updated:** May 9, 2026
