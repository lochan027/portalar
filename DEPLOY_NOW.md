# PortalAR - Render Deployment Quick Start

## ✅ What's Done

Your code is now:
- ✅ Git repository initialized
- ✅ All files committed
- ✅ `.gitignore` configured (excludes node_modules, .env, etc.)
- ✅ `render.yaml` blueprint created for automated deployment
- ✅ Environment variable templates ready

## 🚀 Next Steps to Deploy

### 1. Push to GitHub

```powershell
# Create a new repo on GitHub first at: https://github.com/new
# Then run these commands (replace YOUR-USERNAME and REPO-NAME):

git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git
git push -u origin main
```

### 2. Deploy on Render

**Option A: Blueprint (Recommended - Automated)**

1. Go to https://render.com/dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub account
4. Select your repository
5. Render automatically reads `render.yaml` and creates:
   - Backend web service (`portalar-api`)
   - Frontend static site (`portalar-web`)

**Option B: Manual Setup**

See `DEPLOYMENT.md` for detailed step-by-step instructions.

### 3. Configure Environment Variables

After Render creates your services, set these:

**Backend Service (`portalar-api`):**

Go to service → Environment tab:

```env
NODE_ENV=production
PORT=3001
DATABASE_TYPE=sqlite
ADMIN_PASSWORD_HASH=<generate with: node backend/scripts/generate-password.js demo123>
ADMIN_JWT_SECRET=<generate with: node backend/scripts/generate-secret.js>
FRONTEND_URL=https://portalar-web.onrender.com
ALLOWED_ORIGINS=https://portalar-web.onrender.com
PERPLEXITY_API_KEY=<optional - leave empty for mock mode>
```

**Frontend Static Site (`portalar-web`):**

```env
REACT_APP_API_URL=https://portalar-api.onrender.com
```

### 4. Manual Redeploy

After setting environment variables:
- Go to each service
- Click "Manual Deploy" → "Deploy latest commit"

### 5. Seed Database (One Time)

After backend deploys successfully:
1. Go to backend service → "Shell" tab
2. Run: `npm run seed`
3. This creates demo content for 4 markers

### 6. Test Your Deployment

**Check Backend:**
```
https://portalar-api.onrender.com/health
```

**Access App:**
```
https://portalar-web.onrender.com
```

**Login to Admin:**
```
https://portalar-web.onrender.com/admin
Username: admin
Password: demo123
```

### 7. Generate QR Codes for TechXpo

From your local machine:

```powershell
cd scripts
node generate-qr.js --url "https://portalar-web.onrender.com" --label "PortalAR TechXpo"
```

The QR code PDF will be in: `scripts/output/qr-codes/`

Print and display it at your booth!

---

## 📱 Using at TechXpo

1. **Display the QR code** prominently at your booth
2. **Attendees scan** with their phone cameras
3. **Browser opens** the AR experience (no app install needed)
4. **Camera activates** for marker scanning
5. **AR content appears** when they point at markers

---

## 🔧 Updating Your App

Whenever you make changes:

```powershell
git add .
git commit -m "Your update message"
git push origin main
```

Render automatically rebuilds and redeploys!

---

## 💡 Tips

- **Free Tier Sleeping:** Render free services sleep after 15 min inactivity
  - First load takes ~30 seconds to wake up
  - Keep browser open 10 min before TechXpo starts
  
- **Custom Domain:** You can add `ar.yourdomain.com` in Render settings
  
- **HTTPS Required:** Camera access only works on HTTPS (Render provides this)

- **Monitor Logs:** Check "Logs" tab in Render for any errors

---

## 📚 Documentation

- Full deployment guide: `DEPLOYMENT.md`
- Quick start: `QUICKSTART.md`
- Main README: `README.md`
- Marker creation: `docs/MARKER_GUIDE.md`

---

## 🆘 Troubleshooting

**"Can't connect to backend"**
- Verify `REACT_APP_API_URL` matches your actual backend URL
- Check `ALLOWED_ORIGINS` includes your frontend URL

**"Admin login fails"**
- Regenerate hash: `node backend/scripts/generate-password.js yourpassword`
- Copy output to Render backend env var `ADMIN_PASSWORD_HASH`

**"Camera not working"**
- Must use HTTPS (Render provides automatically)
- Test on actual phone, not desktop

---

## 🎉 You're Ready!

Your PortalAR project is configured and ready to deploy to Render.

**Next Command:**
```powershell
# After creating GitHub repo, push your code:
git remote add origin https://github.com/YOUR-USERNAME/portalar.git
git push -u origin main
```

Then follow steps 2-7 above!
