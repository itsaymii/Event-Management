# CORS Error Fix - Render Configuration

## Problem
Frontend at `https://event-management-six-chi.vercel.app` cannot connect to backend at `https://event-management-cddz.onrender.com` due to CORS policy.

## Solution

### Step 1: Update Render Environment Variables

Go to your Render dashboard:
1. Select your backend service: `pelec-backend`
2. Go to **Environment** section
3. Update or add this environment variable:

```
FRONTEND_URLS=https://event-management-six-chi.vercel.app
```

### Step 2: Redeploy Backend

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for deployment to complete (~2-3 minutes)
3. Check logs to verify deployment succeeded

### Step 3: Test CORS

Once redeployed, try logging in from the frontend again. The CORS error should be gone.

---

## How It Works

The backend now:
1. Reads `FRONTEND_URLS` from environment variables
2. Automatically adds `https://` prefix if missing
3. Removes trailing slashes to normalize URLs
4. Adds to `CORS_ALLOWED_ORIGINS` list

This way you can change the frontend URL without modifying code.

---

## For Future Deployments

When deploying a new frontend URL, just update the `FRONTEND_URLS` environment variable on Render. No code changes needed!

Example with multiple frontend URLs:
```
FRONTEND_URLS=https://event-management-six-chi.vercel.app,https://another-frontend.vercel.app
```
