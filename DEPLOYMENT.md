# Render Deployment Guide

## Quick Deploy to Render

### Option A: Blueprint (Automated)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com/dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will read `render.yaml` and create both services automatically

3. **Configure Environment Variables:**
   - After blueprint creates services, go to each service settings:
   
   **Backend (portalar-api):**
   - `FRONTEND_URL` → Your frontend URL (will be like `https://portalar-web.onrender.com`)
   - `CORS_ORIGIN` → Same as FRONTEND_URL
   - `ADMIN_PASSWORD_HASH` → Generate with: `node backend/scripts/generate-password.js demo123`
   - `ADMIN_JWT_SECRET` → Auto-generated or use: `node backend/scripts/generate-secret.js`
   - `PERPLEXITY_API_KEY` → (optional) Your API key or leave empty for mock mode
   
   **Frontend (portalar-web):**
   - `REACT_APP_API_BASE_URL` → Your backend URL (will be like `https://portalar-api.onrender.com`)

4. **Redeploy both services** after setting env vars.

---

### Option B: Manual (Step-by-Step)

#### 1. Deploy Backend

1. On Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name:** `portalar-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. Add Environment Variables (see list above in Option A)

5. Click "Create Web Service"

6. Note the backend URL: `https://portalar-api.onrender.com`

#### 2. Deploy Frontend

1. On Render Dashboard → "New +" → "Static Site"
2. Connect same repo
3. Configure:
   - **Name:** `portalar-web`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. Add Environment Variable:
   - `REACT_APP_API_BASE_URL` → `https://portalar-api.onrender.com`

5. Click "Create Static Site"

6. Note the frontend URL: `https://portalar-web.onrender.com`

#### 3. Update Backend CORS

Go back to backend service settings and update:
- `FRONTEND_URL` → `https://portalar-web.onrender.com`
- `CORS_ORIGIN` → `https://portalar-web.onrender.com`

Redeploy the backend.

---

## Database Setup

### SQLite (Default - Included)

Free tier works with SQLite. Data persists in Render's disk storage.

To seed data after first deploy:
- Go to backend service → Shell tab
- Run: `npm run seed`

### PostgreSQL (Recommended for Production)

1. On Render: "New +" → "PostgreSQL"
2. Create free database
3. Copy the "Internal Database URL"
4. In backend service environment:
   - Set `DB_TYPE=postgres`
   - Set `DATABASE_URL=<internal-url>`
5. Redeploy backend

---

## Post-Deployment

### Test Your Deployment

1. **Check Backend Health:**
   ```
   https://portalar-api.onrender.com/health
   ```

2. **Access Frontend:**
   ```
   https://portalar-web.onrender.com
   ```

3. **Login to Admin:**
   ```
   https://portalar-web.onrender.com/admin
   Username: admin
   Password: demo123 (or your custom password)
   ```

### Generate QR Codes

From your local machine:

```powershell
cd scripts
node generate-qr.js --url "https://portalar-web.onrender.com" --label "PortalAR TechXpo"
```

Print the PDF from `scripts/output/qr-codes/`

---

## Custom Domain (Optional)

1. In Render service settings → "Custom Domain"
2. Add your domain (e.g., `ar.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate is automatic

Then update:
- Backend `FRONTEND_URL` and `CORS_ORIGIN` to your custom domain
- Frontend `REACT_APP_API_BASE_URL` to your custom backend domain

---

## Troubleshooting

### Frontend can't reach backend
- Check `REACT_APP_API_BASE_URL` is correct
- Verify backend `CORS_ORIGIN` matches frontend URL
- Check backend is running: visit `/health`

### Admin login fails
- Verify `ADMIN_PASSWORD_HASH` is set correctly
- Regenerate: `node backend/scripts/generate-password.js yourpassword`

### Camera not working
- Ensure you're using HTTPS (Render provides this automatically)
- Test on a real phone, not emulator

### Free tier sleeping
- Render free tier sleeps after 15 min of inactivity
- First request takes ~30 seconds to wake up
- Upgrade to paid tier for always-on service

---

## Updating Your App

```bash
git add .
git commit -m "Update features"
git push origin main
```

Render auto-deploys on every push to main branch.

---

## Cost Estimate

- **Free Tier:** $0/month
  - Backend + Frontend + PostgreSQL all have free tiers
  - Sufficient for demos and low traffic

- **Starter Tier:** ~$14/month
  - Always-on backend (no sleeping)
  - Better for production use

---

## Support

- Render Docs: https://render.com/docs
- PortalAR Issues: [Your GitHub repo]/issues
