# PELEC_PROJECT

This repository contains a React frontend with Tailwind CSS and a Django backend.

## Frontend

Path: `frontend/`

### Install

1. Open a terminal in `frontend/`
2. Run `npm install`

### Run

- `npm run dev` to start Vite
- Open `http://localhost:5173`

## Backend

Path: `backend/`

### Create virtual environment

1. Open a terminal in `backend/`
2. Run `python -m venv .venv`
3. Activate the environment:
   - Windows: `.\.venv\Scripts\activate`
   - macOS/Linux: `source .venv/bin/activate`

### Install dependencies

- `pip install -r requirements.txt`

### Run Django

- `python manage.py migrate`
- `python manage.py runserver`

### API endpoint

- `http://127.0.0.1:8000/api/hello/`

## How it works

- React app runs on Vite on `http://localhost:5173`
- Django API runs on `http://127.0.0.1:8000`
- Frontend fetches `api/hello/` to demonstrate communication
