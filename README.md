# PELEC Event Management System

A web-based Event Management System designed to simplify the process of submitting, reviewing, approving, and managing campus events. The system also provides equipment inventory and borrowing management for the OSAS Office through an organized and user-friendly dashboard.

---

# Table of Contents

- Overview
- System Features
- User Roles
- How to Use the System
- User Workflow
- Administrator Workflow
- Equipment Management
- Application Status
- Local Setup
- Running the System
- Technologies Used

---

# Overview

The PELEC Event Management System allows students and organizations to submit event applications online while enabling the OSAS Office to efficiently review, approve, schedule, and manage events and equipment.

The system eliminates manual paperwork by providing a centralized platform for event management.

---

# System Features

## User Module

- User Registration
- User Login
- Dashboard
- Submit Event Application
- View Submitted Applications
- View Event Schedule
- Profile Management

---

## OSAS Administrator Module

- Admin Dashboard
- Review Event Applications
- Approve Applications
- Reject Applications
- Equipment Management
- Borrowed Equipment Tracking
- Event Scheduling

---

# User Roles

## Regular User

A regular user can:

- Register an account
- Login to the system
- Submit event applications
- View submitted applications
- Check application status
- View approved schedules

Regular users cannot:

- Access the admin dashboard
- Approve or reject applications
- Manage equipment

---

## OSAS Administrator

An administrator can:

- Review applications
- Approve applications
- Reject applications
- Manage equipment inventory
- Track borrowed equipment
- View dashboard statistics
- Manage event schedules

---

# How to Use the System

## Step 1: Open the System

Open the application using your web browser.

Example:

Frontend:

```
http://localhost:5173
```

Backend:

```
http://127.0.0.1:8000
```

---

## Step 2: Register

If you do not have an account:

1. Click **Sign Up**
2. Enter:

- Full Name
- Email Address
- Password

3. Submit the registration form.

---

## Step 3: Login

Enter:

- Email
- Password

Click **Login**.

After successful login, the system redirects you to your dashboard based on your account role.

---

# User Workflow

## Dashboard

After logging in, users can view:

- Dashboard summary
- Application history
- Event schedule
- Notifications

---

## Submit Event Application

Navigate to:

```
Submit Application
```

Fill in:

- Event Name
- Event Type
- Event Date
- Venue
- Purpose
- Description

If equipment is needed, select the requested equipment.

Click:

```
Submit
```

The application will automatically be marked as:

```
Pending
```

until reviewed by the administrator.

---

## View Applications

Navigate to:

```
Applications
```

Users can monitor all submitted applications.

Possible statuses:

- Pending
- Approved
- Rejected

---

## View Schedule

Navigate to:

```
Schedule
```

All approved events will be displayed here.

---

# Administrator Workflow

## Login

Login using an administrator account.

---

## Dashboard

The dashboard displays:

- Total Applications
- Pending Applications
- Approved Applications
- Rejected Applications
- Equipment Statistics
- Borrowed Equipment Records

---

## Review Applications

Navigate to:

```
Review Queue
```

Select an application.

Review all submitted information.

Choose one of the following:

```
Approve
```

or

```
Reject
```

The status will automatically update.

---

## Equipment Management

Navigate to:

```
Equipment Management
```

Administrator can:

- Add equipment
- Edit equipment
- Delete equipment
- Update equipment availability
- Mark equipment under maintenance

---

## Borrowed Equipment Tracking

Navigate to:

```
Borrowed Equipment
```

Administrator can:

- View borrowed equipment
- Record returned equipment
- Check overdue equipment
- Update equipment condition

---

# Equipment Borrowing Process

```
User requests equipment
            │
            ▼
Application submitted
            │
            ▼
Administrator reviews
            │
            ▼
Application approved
            │
            ▼
Equipment borrowed
            │
            ▼
Equipment returned
            │
            ▼
Administrator records return
```

---

# Event Application Process

```
User Registration
        │
        ▼
Login
        │
        ▼
Submit Event Application
        │
        ▼
Pending Status
        │
        ▼
Administrator Review
     ┌───────────────┐
     │               │
     ▼               ▼
Approved         Rejected
     │
     ▼
Added to Schedule
```

---

# Application Status

| Status | Description |
|---------|-------------|
| Pending | Waiting for administrator review |
| Approved | Application has been approved |
| Rejected | Application has been rejected |

---

# Best Practices

- Fill out all required information correctly.
- Submit applications before the intended event date.
- Regularly monitor application status.
- Return borrowed equipment on or before the due date.
- Contact the administrator for corrections if necessary.

---

# Local Development Setup

## Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Run:

```bash
npm run dev
```

---

## Backend

Create virtual environment:

```bash
cd backend
python -m venv .venv
```

Activate environment:

### Windows

```bash
.\.venv\Scripts\activate
```

### macOS/Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start the backend server:

```bash
python manage.py runserver
```

---

# Default URLs

Frontend

```
http://localhost:5173
```

Backend

```
http://127.0.0.1:8000
```

API

```
http://127.0.0.1:8000/api/
```

---

# Technologies Used

## Frontend

- React
- Vite
- React Router
- Tailwind CSS

## Backend

- Django
- Django REST Framework
- SimpleJWT

## Database

- SQLite (Development)

## Programming Languages

- JavaScript
- Python
- HTML
- CSS

---

# Summary

The PELEC Event Management System provides a centralized platform for managing campus events and equipment. It simplifies the submission and approval process, improves organization, and enhances the efficiency of event and equipment management for both users and OSAS administrators.