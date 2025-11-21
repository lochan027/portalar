# PortalAR - Quick Start Guide

## Installation

1. **Install dependencies:**
```bash
npm run install-all
```

2. **Set up environment variables:**

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
- Set `ADMIN_PASSWORD_HASH` (run `npm run generate-password`)
- Set `ADMIN_JWT_SECRET` (run `npm run generate-secret`)
- (Optional) Set `PERPLEXITY_API_KEY` for AI summarization

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

Default settings work for local development.

3. **Seed database:**
```bash
cd backend
npm run seed
```

4. **Start development servers:**
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## Generate QR Markers

```bash
# Generate QR code
npm run generate-qr -- --markerId=marker-news-001

# Generate AR marker pattern
npm run generate-marker -- --markerId=marker-news-001 --method=companion

# Copy .patt file to frontend
cp scripts/output/markers/marker-news-001.patt frontend/public/markers/

# Print QR codes from scripts/output/qr-codes/
```

## Testing

1. Open http://localhost:3000
2. Click "AI Healthcare News" demo button
3. Allow camera access
4. Point at printed marker or use webcam with marker on screen

## Deployment

### Frontend (Vercel):
```bash
cd frontend
vercel --prod
```

### Backend (Render/Heroku):
```bash
# Push to Git
git push origin main

# Deploy via Render dashboard or:
heroku create
git push heroku main
```

## Expo Demo (with ngrok)

```bash
# Terminal 1: Start servers
npm run dev

# Terminal 2: Tunnel backend
ngrok http 3001

# Terminal 3: Tunnel frontend
ngrok http 3000

# Update frontend .env with backend ngrok URL
# Generate QR with frontend ngrok URL
# Print and scan!
```

## Troubleshooting

**Camera not working?**
- Use HTTPS or localhost
- Check browser permissions
- iOS: Settings → Safari → Camera → Allow

**Marker not detecting?**
- Print minimum 4×4 inches
- Use matte paper (no gloss)
- Bright, even lighting
- Distance: 8-20 inches

**API errors?**
- Check backend is running on :3001
- Verify CORS settings in backend/.env
- Check browser console for errors

## Documentation

Full documentation: [README.md](./README.md)
API Reference: [backend/README.md](./backend/README.md)
Marker Guide: [docs/MARKER_GUIDE.md](./docs/MARKER_GUIDE.md)

## Support

- GitHub Issues: https://github.com/yourusername/portal-ar/issues
- Documentation: https://github.com/yourusername/portal-ar
