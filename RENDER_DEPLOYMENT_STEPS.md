# PELEC Project - Render Deployment Guide

**STATUS**: ✅ Backend and Frontend are ready for Render deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Backend Setup Complete
- [x] `settings.py` configured for production
- [x] `requirements.txt` up-to-date with all dependencies
- [x] `render.yaml` created with environment variables template
- [x] `.env.example` with comprehensive documentation
- [x] All migrations created and tested
- [x] `build.sh` configured for Render deployment
- [x] `Procfile` configured for Gunicorn
- [x] CORS configuration supports production URLs
- [x] Static files configuration for WhiteNoise

### ✅ Frontend Setup Complete
- [x] `.env.local` for local development
- [x] `.env.production` for production deployment
- [x] `.env.example` with documentation
- [x] `vite.config.js` properly configured
- [x] `vercel.json` for Vercel deployment
- [x] AuthContext uses environment variables (NO hardcoded URLs)
- [x] API calls use `VITE_API_URL` environment variable
- [x] Build script ready: `npm run build`

---

## 🚀 Step-by-Step Deployment

### STEP 1: Prepare GitHub Repository

1. Commit all changes to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. Verify repository structure:
   ```
   PELEC_PROJECT/
   ├── backend/
   │   ├── manage.py
   │   ├── requirements.txt
   │   ├── render.yaml
   │   ├── .env.example
   │   └── ...
   ├── frontend/
   │   ├── package.json
   │   ├── .env.production
   │   ├── .env.example
   │   └── ...
   └── ...
   ```

---

### STEP 2: Create Backend on Render

#### 2A: Create PostgreSQL Database

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `pelec-db`
   - **Database**: `pelec`
   - **User**: `pelec_user`
   - **Region**: `Oregon` (or closest to you)
   - **PostgreSQL Version**: `15`
4. Click **"Create Database"**
5. **⚠️ IMPORTANT**: Save the connection string (you'll need it in Step 2B)
   - Format: `postgresql://user:password@host:port/database`
   - Example: `postgresql://pelec_user:xxxx@oregon-postgres.render.com:5432/pelec`

---

#### 2B: Create Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. Select **"Deploy an existing repository"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `pelec-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: (will auto-detect from render.yaml)
   - **Start Command**: (will auto-detect from render.yaml)
   - **Plan**: `Free` (or paid based on needs)

5. Click **"Advanced"** and add Environment Variables:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11` |
| `SECRET_KEY` | **Generate using**: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `False` |
| `DATABASE_URL` | `postgresql://pelec_user:password@oregon-postgres.render.com:5432/pelec` |
| `ALLOWED_HOSTS` | `pelec-backend.onrender.com,www.pelec-backend.onrender.com` |
| `FRONTEND_URLS` | `https://pelec-frontend.vercel.app` |

6. Click **"Create Web Service"**
7. Wait ~5-10 minutes for deployment
8. Once deployed, note your backend URL: `https://pelec-backend.onrender.com`

#### Verify Backend is Running

```bash
# Should return a 401 (auth required) - this is good!
curl https://pelec-backend.onrender.com/api/auth/token/

# Check logs in Render dashboard - look for:
# - Database migration success
# - Static files collection success
# - Gunicorn started successfully
```

---

### STEP 3: Create Frontend on Vercel

#### 3A: Push Frontend Environment Variables to GitHub

Update `.env.production` in frontend folder:

```env
# Replace with your actual Render backend URL
VITE_API_URL=https://pelec-backend.onrender.com/api
```

Commit and push:
```bash
git add frontend/.env.production
git commit -m "Update frontend API URL for production"
git push origin main
```

#### 3B: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://pelec-backend.onrender.com/api` |

6. Click **"Deploy"**
7. Wait for deployment (usually 2-3 minutes)
8. Note your frontend URL: `https://pelec-frontend.vercel.app`

---

### STEP 4: Update Cross-Origin URLs

#### 4A: Update Backend FRONTEND_URLS (if using Blueprint)

1. Go to Render dashboard
2. Select your `pelec-backend` service
3. Go to **"Environment"**
4. Update `FRONTEND_URLS`:
   ```
   https://pelec-frontend.vercel.app
   ```
5. Click **"Save"** (this will redeploy)

#### 4B: Verify CORS is Working

Test from frontend in browser console:
```javascript
fetch('https://pelec-backend.onrender.com/api/auth/token/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Should see a 401 error (auth required), not a CORS error.

---

## 🧪 Testing the Deployment

### Test 1: Backend API is Accessible

```bash
# Test token endpoint (should return 401)
curl https://pelec-backend.onrender.com/api/auth/token/
```

### Test 2: Database Connection Works

Check Render backend logs:
```
Render Dashboard → pelec-backend → "Logs"
```

Look for:
- ✅ "Database connection successful"
- ✅ "Running migrations..."
- ✅ "Migration 0001_initial"
- ✅ "Migration complete"

### Test 3: Login from Frontend

1. Visit `https://pelec-frontend.vercel.app`
2. Go to Login page
3. Try to login with test credentials
4. Check browser Console (F12) for API calls
5. Should see: `POST https://pelec-backend.onrender.com/api/auth/login/`

### Test 4: Create Admin User (if needed)

From Render dashboard, go to `pelec-backend` service and click **"Shell"**:

```bash
python manage.py createsuperuser --email admin@example.com
# Follow prompts for password
```

Then access: `https://pelec-backend.onrender.com/admin/`

---

## 🔑 Important Environment Variables

### Backend (Render)

```env
# Security
SECRET_KEY=<generate-a-secure-key>          # REQUIRED - Change this!
DEBUG=False                                  # MUST be False in production

# Database
DATABASE_URL=postgresql://...               # From Render PostgreSQL

# Access Control
ALLOWED_HOSTS=yourdomain.onrender.com       # Your Render domain
FRONTEND_URLS=https://your-frontend.vercel.app  # Frontend URL
```

### Frontend (Vercel)

```env
# API URL - Must match your Render backend
VITE_API_URL=https://yourdomain.onrender.com/api
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "ALLOWED_HOSTS violation"
**Solution**: Update `ALLOWED_HOSTS` in Render environment variables to include your domain

### Issue 2: "CORS error" when frontend calls backend
**Solution**: Update `FRONTEND_URLS` in backend environment variables to match frontend URL

### Issue 3: "Migrations not found"
**Solution**: Check Render logs. Migrations must be in `backend/api/migrations/` and `backend/dashboard/migrations/`

### Issue 4: "Database connection refused"
**Solution**: 
1. Verify `DATABASE_URL` is correct
2. Check PostgreSQL database is running on Render
3. Verify firewall allows connections

### Issue 5: Frontend can't reach backend
**Solution**:
1. Verify `VITE_API_URL` in `.env.production` is correct
2. Check browser Console for CORS errors
3. Verify FRONTEND_URLS in backend matches frontend URL

---

## 📊 Monitoring & Maintenance

### View Logs
- Backend: Render Dashboard → `pelec-backend` → "Logs"
- Frontend: Vercel Dashboard → `pelec-frontend` → "Analytics" / "Deployments"

### Monitor Database
- Render Dashboard → `pelec-db` → "Database Backups" / "Monitoring"

### Scale Backend (if needed)
- Render Dashboard → `pelec-backend` → "Plan" → Select higher tier

---

## ✅ Deployment Verification Checklist

- [ ] Backend deployed on Render
- [ ] PostgreSQL database created on Render
- [ ] Frontend deployed on Vercel
- [ ] Backend API responds at `https://your-backend.onrender.com/api/`
- [ ] Frontend loads at `https://your-frontend.vercel.app`
- [ ] Login works from frontend
- [ ] No CORS errors in browser console
- [ ] Database migrations completed successfully
- [ ] Admin dashboard accessible
- [ ] Equipment data loaded successfully
- [ ] User can submit applications
- [ ] Admin can review applications

---

## 🎉 Deployment Complete!

Your PELEC application is now live on:
- **Backend**: `https://your-backend.onrender.com`
- **Frontend**: `https://your-frontend.vercel.app`

**Next Steps**:
1. Test all features thoroughly
2. Set up monitoring/alerts
3. Configure custom domain (optional)
4. Set up automated backups for database
5. Monitor performance and logs regularly
