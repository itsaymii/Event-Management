# Deployment Checklist - PELEC Project

## Pre-Deployment

### Backend Setup
- [ ] Update `backend/.env.example` with your environment variables
- [ ] Generate a secure `SECRET_KEY` using: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- [ ] Test locally with `DEBUG=False` to ensure it works
- [ ] Verify all migrations are created and committed: `git status`
- [ ] Ensure `requirements.txt` is up to date
- [ ] Test static files locally: `python manage.py collectstatic --noinput`

### Frontend Setup
- [ ] Update `frontend/.env.production` with actual backend URL
- [ ] Test production build locally: `npm run build && npm run preview`
- [ ] Verify no hardcoded localhost URLs in code

### Database Preparation
- [ ] Create PostgreSQL database on Render (or your chosen provider)
- [ ] Save the connection string (DATABASE_URL)
- [ ] Note: Use `postgresql://` protocol, not `postgres://`

---

## Render Deployment (Backend)

### Option A: Using Dashboard (Recommended for First Time)

1. Create Web Service on render.com
2. Connect GitHub repository
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
5. Set **Start Command**: `gunicorn backend.wsgi`
6. Add Environment Variables:

   ```
   SECRET_KEY=<your-generated-key>
   DEBUG=False
   DATABASE_URL=<postgresql-connection-string>
   ALLOWED_HOSTS=<yourdomain>.onrender.com,www.<yourdomain>.onrender.com
   FRONTEND_URLS=https://<your-vercel-domain>.vercel.app
   ```

7. Click "Deploy" and wait ~5 minutes

### Option B: Using render.yaml

1. Update `backend/render.yaml` with your domain and environment
2. Commit and push to GitHub
3. On render.com, click "New +" > "Blueprint"
4. Select your repository and branch
5. Render auto-configures from render.yaml

### Verify Backend is Running

After deployment completes, test the API:

```bash
# Should return 401 (auth required) - this is good!
curl https://<yourdomain>.onrender.com/api/auth/token/
```

Or open in browser - you should see a 401 error page with DRF UI.

---

## Vercel Deployment (Frontend)

### Prerequisites
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Frontend `.env.production` updated with backend URL

### Deployment Steps

1. Go to vercel.com and click "Add New..." > "Project"
2. Import your GitHub repository
3. Select `frontend` as the root directory
4. Vercel auto-detects Vite configuration
5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://<yourdomain>.onrender.com/api`
6. Click "Deploy"

### Verify Frontend is Running

Once deployed:
1. Visit your Vercel URL
2. Open browser DevTools Console (F12)
3. Should load without CORS errors
4. Try logging in - it should call your Render backend

---

## Post-Deployment Verification

### Backend Tests
- [ ] API responds: `curl https://<backend-url>/api/auth/token/`
- [ ] Login works: `POST /api/auth/token/` with credentials
- [ ] Database connected: Check Render logs for DB connection success
- [ ] Migrations ran: Check Render logs for "Running migrations" message
- [ ] Static files collected: Check logs for "Collecting static files" message

### Frontend Tests
- [ ] App loads without console errors
- [ ] Login page displays
- [ ] Login succeeds (no CORS errors)
- [ ] Dashboard loads after login
- [ ] Can navigate between pages

### Integration Tests
- [ ] Submit application from frontend
- [ ] Application appears in admin dashboard
- [ ] Admin can approve/reject
- [ ] Equipment tracking works
- [ ] Notifications display properly

---

## Troubleshooting

### CORS Error on Frontend
**Error:** `Access to XMLHttpRequest at '...' blocked by CORS policy`
**Fix:** 
1. Verify `FRONTEND_URLS` env var on Render backend includes your Vercel domain
2. Trigger redeploy on Render
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### 502 Bad Gateway on Render
**Error:** "502 Bad Gateway"
**Fix:**
1. Check Render logs for errors
2. Verify `gunicorn backend.wsgi` command is correct
3. Ensure database connection string is valid
4. Check Python dependencies in logs

### Build Fails on Render
**Error:** Deployment fails during build
**Fix:**
1. Check logs for specific error
2. Ensure `requirements.txt` has all dependencies
3. Verify Python version compatibility
4. Run migrations locally to test

### "Module not found" Error
**Error:** `ModuleNotFoundError: No module named 'xxx'`
**Fix:**
1. Verify package is in `requirements.txt`
2. Commit `requirements.txt` and push to GitHub
3. Trigger manual redeploy on Render

### Frontend Shows Old Version
**Error:** New code not reflected
**Fix:**
1. Clear Vercel cache: Settings > Git > Clear Cache
2. Redeploy on Vercel
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Database Connection Failed
**Error:** `psycopg2.OperationalError`
**Fix:**
1. Verify `DATABASE_URL` is set correctly in Render env vars
2. Check PostgreSQL database is running on Render
3. Ensure connection string uses `postgresql://`, not `postgres://`

---

## Redeployment After Code Changes

### For Backend Changes
```bash
git add backend/
git commit -m "Update backend code"
git push
# Render auto-redeploys (or manually trigger in dashboard)
```

### For Frontend Changes
```bash
git add frontend/
git commit -m "Update frontend code"
git push
# Vercel auto-redeploys (or manually trigger in dashboard)
```

### For New Migrations
```bash
cd backend
python manage.py makemigrations
git add backend/*/migrations/
git commit -m "Add migration"
git push
# Render will run migration on redeploy
```

---

## Security Checklist (Before Going Live)

- [ ] `DEBUG=False` on production
- [ ] `SECRET_KEY` is randomly generated and unique
- [ ] `ALLOWED_HOSTS` includes only your domains
- [ ] `FRONTEND_URLS` set correctly (no localhost)
- [ ] Database uses strong password
- [ ] `.env` files are NOT committed to git (check .gitignore)
- [ ] CORS is restricted (not `CORS_ALLOW_ALL_ORIGINS`)
- [ ] HTTPS is enabled (Vercel/Render handle this automatically)

---

## Monitoring & Logs

### Render Logs
- Go to Service Dashboard
- Logs tab shows real-time output
- Useful for debugging deployment issues

### Vercel Logs
- Go to Project Settings
- Function Logs tab
- Can view specific deployment logs

### Checking for Errors
```bash
# In Render logs, watch for:
- "ERROR" - any errors
- "WARNING" - deprecation warnings
- Database connection messages

# In Vercel logs, watch for:
- Build errors
- Function errors
- API connection issues
```

---

## Rollback Plan

If deployment goes wrong:

1. **Revert Code**: `git revert <commit-hash> && git push`
2. **Render**: Auto-redeploys from latest commit
3. **Vercel**: Auto-redeploys from latest commit
4. Monitor logs to confirm rollback completed successfully

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/stable/howto/deployment/
- **Gunicorn Docs**: https://gunicorn.org/
- **PostgreSQL Connection Strings**: https://www.postgresql.org/docs/current/libpq-connect.html
