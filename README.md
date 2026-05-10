# PELEC_PROJECT (Event Management System)

This repository contains a React frontend (Vite + React Router + Tailwind CSS) and a Django backend (Django + Django REST Framework + SimpleJWT) for an event management system with an OSAS admin dashboard.

---

## 1) Repository structure

- **Frontend:** `frontend/`
- **Backend:** `backend/`
  - **Django project:** `backend/backend/`
  - **Apps:**
    - `backend/api/` (custom user + auth endpoints)
    - `backend/dashboard/` (event applications + equipment + borrow tracking)
- **Documentation (existing):**
  - `API_REFERENCE.md` (API quick reference examples)
  - `EQUIPMENT_MANAGEMENT_GUIDE.md` (admin equipment workflow & endpoints)
  - `IMPLEMENTATION_CHECKLIST.md` (feature implementation checklist)

---

## 2) Local development

### Prerequisites
- Node.js (for frontend)
- Python 3.x (for backend)
- Git

---

## 3) Frontend (React)

### Install
```bash
cd frontend
npm install
```

### Run (dev)
```bash
npm run dev
```

Frontend will be served by Vite at:
- `http://localhost:5173`

---

## 4) Backend (Django + DRF)

### Create a virtual environment
```bash
cd backend
python -m venv .venv
```

Activate:
- **Windows:** `.\.venv\Scripts\activate`
- **macOS/Linux:** `source .venv/bin/activate`

### Install dependencies
```bash
pip install -r requirements.txt
```

### Run migrations
```bash
python manage.py migrate
```

### Start server
```bash
python manage.py runserver
```

Backend will be served at:
- `http://127.0.0.1:8000`

During development (when `DEBUG=True`), uploaded media is served under:
- `http://127.0.0.1:8000/media/`

---

## 5) Environment / configuration notes

Backend CORS is configured in:
- `backend/backend/settings.py`

CORS allows:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

The backend uses SQLite by default:
- `backend/backend/settings.py` → `db.sqlite3`

> **Security note:** `SECRET_KEY` in settings is a placeholder (`change-this-secret-key`). Replace it for production deployments.

---

## 6) Authentication & Authorization (JWT)

### Authentication model
- Custom user model: `backend/api/models.py` → `CustomUser`
- Login uses **email** as the `USERNAME_FIELD`.

### Tokens
- SimpleJWT is enabled in `backend/backend/settings.py`
- JWT header format:
  - `Authorization: Bearer <access_token>`

### Auth endpoints (mounted under `/api/auth/`)
These are registered in `backend/api/urls.py` and connected in `backend/dashboard/urls.py`:

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/auth/register/`
- `POST /api/auth/logout/`
- `GET /api/auth/user/`
- `PUT/PATCH /api/auth/user/profile/`
- `POST /api/auth/user/password/`

### Frontend token storage
Frontend stores the JWT token and user in `localStorage` via `AuthContext` (see `frontend/src/context/AuthContext.jsx`).

---

## 7) Roles & permissions

`CustomUser.organization_role` values:
- **User**
- **OSAS** (Admin)
- **Property**

Backend role checks live primarily in:
- `backend/dashboard/views.py`
  - `IsOSASRole`
  - `IsOSASOrPropertyRole`
  - `IsOwnerOrAdmin`

Frontend role-based routing lives in:
- `frontend/src/App.jsx` (`ProtectedRoute`)

### What each role can do
- **OSAS**
  - Admin dashboard routes: `/admin/*`
  - Can manage:
    - event application review/approval/rejection
    - all users (admin user endpoint)
    - equipment inventory
    - equipment borrow/return tracking
- **User**
  - Regular routes: `/dashboard`, `/applications`, `/schedule`, `/submit-application`
  - Can manage **their own** event applications
- **Property**
  - Frontend routing supports the role, but backend enforcement depends on endpoint permissions

---

## 8) Core domain concepts

### EventApplication
Model: `backend/dashboard/models.py` → `EventApplication`

Key fields:
- `event_name`, `event_type`
- `event_date` (and aliases `start_date`, `end_date`)
- `venue`
- `purpose`, `description`
- `status`: `pending | approved | rejected`
- `equipment`: stored as a JSON string in SQLite-safe text field

### Equipment
Model: `backend/dashboard/models.py` → `Equipment`

Key fields:
- `equipment_id` (unique code like `AUD-001`)
- `equipment_name`, `description`, `category`
- `status`: `available | borrowed | maintenance | damaged`
- `condition`: `excellent | good | fair | poor`
- `quantity_total`, `quantity_available`

### EquipmentBorrow
Model: `backend/dashboard/models.py` → `EquipmentBorrow`

Key fields:
- `equipment` (FK)
- `event_application` (FK, optional)
- `user` (FK)
- `quantity_borrowed`
- `borrow_date`, `expected_return_date`, `actual_return_date`
- `status`: `active | returned | damaged_return`
- `condition_on_return`, `notes`, `damage_notes`
- `is_overdue` (property)

---

## 9) Frontend pages / routes

### Public landing
- `/` → `frontend/src/pages/LandingPage.jsx`

### Authentication pages
- `/login` → `frontend/src/pages/LoginPage.jsx`
- `/signup` → `frontend/src/pages/SignUpPage.jsx`

### User dashboard
- `/dashboard` → `frontend/src/pages/DashboardOverview.jsx`
- `/applications` → `frontend/src/pages/Application.jsx`
- `/schedule` → `frontend/src/pages/SchedulePage.jsx`
- `/submit-application` → `frontend/src/pages/SubmitApplication.jsx`

### OSAS admin dashboard
- `/admin` → `frontend/src/pages/admin/AdminDashboard.jsx`
  - nested routes handled inside that component:
    - `/admin/review` → `ReviewQueue.jsx`
    - `/admin/schedule` → `AdminSchedule.jsx`
    - `/admin/equipment` → `AdminEquipmentManagement.jsx`
    - `/admin/borrowed` → `BorrowedEquipmentTracking.jsx`

---

## 10) API endpoints

Base path is:
- **`/api/`**

### Quick reference
Use:
- `API_REFERENCE.md` (examples + cURL)
- `EQUIPMENT_MANAGEMENT_GUIDE.md` (equipment workflow + endpoints)

### Equipment APIs (admin)
From `backend/dashboard/views.py`:
- List equipment: `GET /api/admin/equipment/`
- Create equipment: `POST /api/admin/equipment/`
- Equipment detail + update/delete:
  - `GET /api/admin/equipment/{id}/`
  - `PUT /api/admin/equipment/{id}/`
  - `DELETE /api/admin/equipment/{id}/`
- Stats: `GET /api/admin/equipment/stats/`
- Status actions:
  - `POST /api/admin/equipment/{id}/mark_available/`
  - `POST /api/admin/equipment/{id}/mark_maintenance/`

### Equipment borrow/return APIs (admin)
From `backend/dashboard/views.py`:
- List borrow records: `GET /api/admin/equipment-borrow/`
- Create borrow record: `POST /api/admin/equipment-borrow/`
- Record return action:
  - `POST /api/admin/equipment-borrow/{id}/record_return/`
- Specialized endpoints:
  - `GET /api/admin/equipment-borrow/currently_borrowed/`
  - `GET /api/admin/equipment-borrow/overdue/`

### Applications APIs
User and admin application APIs are routed by routers in:
- `backend/dashboard/urls.py`

---

## 11) Database & migrations

Migrations are stored under:
- `backend/api/migrations/`
- `backend/dashboard/migrations/`

The equipment/borrow feature includes:
- `backend/dashboard/migrations/0006_equipment_equipmentborrow.py`

To apply all migrations locally:
```bash
cd backend
python manage.py migrate
```

To insert sample equipment data (admin tooling):
```bash
python manage.py populate_equipment
```

(See the command under `backend/dashboard/management/commands/populate_equipment.py`.)

---

## 12) Troubleshooting

### CORS / frontend cannot call backend
- Ensure backend is running on port `8000`
- Ensure Vite is running on `5173`
- Verify CORS config in `backend/backend/settings.py`

### JWT errors
- Confirm the `Authorization` header exists:
  - `Bearer <access_token>`
- Confirm token is being stored by the frontend login flow.

### Equipment endpoints return 403
- OSAS role is required for equipment endpoints via `IsOSASRole`.
- Confirm `organization_role` is `OSAS` for that account.

---

## 13) Production notes (high-level)

- Replace `SECRET_KEY` with a real secret value
- Configure allowed hosts and CORS for your production domains
- Use a production DB (PostgreSQL/MySQL) instead of SQLite
- Serve static/media via a proper web server/CDN
- Consider securing file uploads & adding email notifications if required

---

## 14) Key documentation files

- **API examples:** `API_REFERENCE.md`
- **Equipment workflow:** `EQUIPMENT_MANAGEMENT_GUIDE.md`
- **Implementation checklist:** `IMPLEMENTATION_CHECKLIST.md`

---
