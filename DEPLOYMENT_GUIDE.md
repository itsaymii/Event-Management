# PELEC Project Deployment Guide

## Deployment Overview

This project uses:
- **Backend:** Django + Render (render.com)
- **Frontend:** React/Vite + Vercel (vercel.com)
- **Database:** PostgreSQL (via Render)

---

## Backend Deployment (Render)

### Step 1: Create Render Account & PostgreSQL Database

1. Go to [render.com](https://render.com)
2. Create a new PostgreSQL database:
   - Name: `pelec-db` (or your choice)
   - Region: Choose closest to you
   - PostgreSQL version: 14 or higher
3. Save the database connection string (will look like: `postgresql://user:pass@host:port/dbname`)

### Step 2: Deploy Backend Service on Render

1. Create new Web Service
2. Connect your GitHub repository
3. Configure as follows:

   **Build Command:**
   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
   ```

   **Start Command:**
   ```bash
   gunicorn backend.wsgi
   ```

4. Set Environment Variables in Render dashboard:

   ```
   SECRET_KEY=<generate-a-secure-key>
   DEBUG=False
   DATABASE_URL=<your-postgresql-connection-string>
   ALLOWED_HOSTS=yourdomain.onrender.com,www.yourdomain.onrender.com
   FRONTEND_URLS=https://your-frontend-domain.vercel.app
   ```

5. Click "Deploy"

### Step 3: Verify Backend is Running

Once deployed, test:
```bash
https://yourdomain.onrender.com/api/auth/token/
```

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub

### Step 2: Import Project

1. Click "New Project"
2. Import your GitHub repository
3. Configure:

   **Root Directory:** `frontend`
   
   **Build Command:** `npm run build`
   
   **Output Directory:** `dist`

4. Add Environment Variable:

   ```
   VITE_API_URL=https://yourdomain.onrender.com/api
   ```

   (Update with your actual Render backend URL)

5. Click "Deploy"

### Step 3: Test Frontend

Once deployed, visit your Vercel URL and verify:
- Login page loads
- API calls work (check browser console)
- No CORS errors

---

## Environment Variables Reference

### Backend (.env in `backend/` folder)

```
SECRET_KEY=<random-secure-key-with-django-secret-key-generator>
DEBUG=False
DATABASE_URL=postgresql://user:password@host:5432/dbname
ALLOWED_HOSTS=yourdomain.onrender.com,www.yourdomain.onrender.com
FRONTEND_URLS=https://your-frontend.vercel.app
```

### Frontend (.env.production in `frontend/` folder)

```
VITE_API_URL=https://yourdomain.onrender.com/api
```

---

## Generate Secure SECRET_KEY

Use this Python command to generate a secure key:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Or use an online generator: https://djecrety.ir/

---

## Troubleshooting

### "CORS Error" on Frontend

**Solution:** Make sure `FRONTEND_URLS` environment variable on Render backend includes your Vercel domain.

### "Database connection failed"

**Solution:** Verify `DATABASE_URL` is set correctly in Render environment variables.

### "Static files not loading"

**Solution:** Ensure `python manage.py collectstatic --noinput` runs in build command.

### "Build fails with missing dependencies"

**Solution:** Update `backend/requirements.txt` and commit to GitHub.

---

## Post-Deployment Checklist

- [ ] Backend URL responds to `/api/auth/token/`
- [ ] Frontend loads without errors
- [ ] Login works (no CORS errors)
- [ ] Applications can be created
- [ ] Admin dashboard accessible to OSAS users
- [ ] Static files load (CSS/images)

---

## Redeploy After Changes

### Backend
1. Commit changes to `backend/` folder
2. Push to GitHub
3. Render auto-redeploys (or manually trigger in dashboard)

### Frontend
1. Commit changes to `frontend/` folder
2. Push to GitHub
3. Vercel auto-redeploys (or manually trigger in dashboard)

---

## Local Development (Before Deploying)

### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Database Migrations

Migrations run automatically during build:
```bash
python manage.py migrate
```

If you need to create a new migration locally:
```bash
python manage.py makemigrations
python manage.py migrate
```

Then commit the migration files to GitHub.
