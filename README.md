# PortalAR - QR-Based Marker WebAR Platform

**Production-ready WebAR platform where printed QR codes act as AR markers** to display dynamic content (video ads, live news, 3D models, interactive elements) anchored to physical prints. Perfect for expos, marketing campaigns, interactive posters, and dynamic print media.

---

## 🎯 Core Features

- **QR-as-Marker Technology**: Printed QR codes double as image markers for AR content anchoring
- **Dynamic Backend-Driven Content**: Update AR experiences without reprinting QR codes
- **Multiple Content Types**: Video ads, news articles, 3D models, interactive elements
- **Real-time Analytics**: Track scans, view duration, engagement metrics
- **Perplexity AI Integration**: Auto-generate summaries and headlines from article URLs
- **Mobile-First WebAR**: No app install required - works in mobile browsers
- **Admin Dashboard**: Easy content management with authentication
- **Expo-Ready**: Local demo mode + ngrok instructions for offline presentations

---

## 📁 Project Structure

```
PortalAR/
├── frontend/              # React + A-Frame + AR.js web app
│   ├── public/
│   │   ├── markers/      # AR marker patterns and training data
│   │   └── assets/       # 3D models, videos, demo content
│   └── src/
│       ├── components/   # AROverlay, ScanPage, Controls, etc.
│       ├── services/     # API client, analytics tracker
│       └── utils/        # AR helpers, device detection
├── backend/              # Node.js + Express API server
│   ├── routes/          # API endpoints
│   ├── services/        # Perplexity integration, analytics
│   ├── database/        # Firebase/SQLite implementations
│   └── middleware/      # Auth, CORS, error handling
├── admin/               # Admin dashboard UI
├── scripts/             # QR/marker generation utilities
│   ├── generate-qr.js
│   ├── generate-marker.js
│   └── optimize-assets.js
└── docs/                # Additional documentation
    ├── MARKER_GUIDE.md
    ├── DEPLOYMENT.md
    └── EXPO_DEMO.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern browser (Chrome, Safari iOS 11.3+)
- Camera-enabled device for testing
- (Optional) Firebase/Supabase account OR PostgreSQL/SQLite for production

### Installation

```bash
# Clone or extract the project
cd PortalAR

# Install all dependencies (frontend + backend + scripts)
npm run install-all

# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Environment Configuration

**Backend `.env`:**
```env
# Server
PORT=3001
NODE_ENV=development

# Database (choose one)
DATABASE_TYPE=sqlite  # Options: sqlite, firebase, postgres
SQLITE_PATH=./database/portalAR.db

# Firebase (if using)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com

# Perplexity AI (get key from https://www.perplexity.ai/settings/api)
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxx

# Admin Authentication
ADMIN_PASSWORD_HASH=$2b$10$... # Generated via bcrypt
ADMIN_JWT_SECRET=your-secret-key-min-32-chars

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-production-domain.com
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DEMO_MODE=false  # Set true for offline demo
```

### Generate Admin Password Hash

```bash
cd backend
npm run generate-password
# Enter your desired admin password when prompted
# Copy the hash to .env ADMIN_PASSWORD_HASH
```

### Run Development Environment

```bash
# Start both frontend and backend concurrently
npm run dev

# Or separately:
npm run dev:backend  # Backend on :3001
npm run dev:frontend # Frontend on :3000
```

Visit `http://localhost:3000` to see the app.

---

## 📱 Expo/Demo Setup

### Option 1: Local Network Demo (WiFi)

1. **Find your local IP:**
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. **Update environment variables:**
   ```env
   # frontend/.env
   REACT_APP_API_URL=http://192.168.1.100:3001
   ```

3. **Start servers:**
   ```bash
   npm run dev
   ```

4. **Generate QR codes:**
   ```bash
   npm run generate-qr -- --markerId=marker-news-001 --baseUrl=http://192.168.1.100:3000
   ```

5. **Print QR codes** from `scripts/output/qr-codes/` folder

6. **Test:** Open phone camera → Scan QR → Allow camera permission → Point at printed QR

### Option 2: ngrok Tunnel (Internet Access)

Perfect for demos where phones can't access local network:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # Or download from https://ngrok.com/
   ```

2. **Start your servers:**
   ```bash
   npm run dev
   ```

3. **Create tunnels (in separate terminals):**
   ```bash
   # Terminal 1: Backend tunnel
   ngrok http 3001
   # Note the https URL: https://abc123.ngrok.io

   # Terminal 2: Frontend tunnel
   ngrok http 3000
   # Note the https URL: https://def456.ngrok.io
   ```

4. **Update frontend .env:**
   ```env
   REACT_APP_API_URL=https://abc123.ngrok.io
   ```

5. **Rebuild frontend:**
   ```bash
   npm run build:frontend
   npm run serve:frontend  # Serve production build
   ```

6. **Generate QR codes with ngrok URL:**
   ```bash
   npm run generate-qr -- --markerId=marker-news-001 --baseUrl=https://def456.ngrok.io
   ```

7. **Print and test!**

### Option 3: Offline Demo Mode

For demos with no internet connection:

1. **Enable demo mode:**
   ```env
   # frontend/.env
   REACT_APP_DEMO_MODE=true
   ```

2. **Build and serve:**
   ```bash
   npm run build:frontend
   npm run serve:frontend
   ```

3. **Use pre-generated QR codes** in `frontend/public/demo-qr/` folder

4. **Demo data** is embedded in frontend (no backend needed)

---

## 🎨 Creating AR Markers

### Understanding QR-as-Marker

Standard QR codes can be used but have limitations for AR tracking:
- High-frequency patterns cause tracking jitter
- Black/white ratio varies with encoded data
- Small QR codes have poor tracking at distance

**Solution:** We provide two approaches:

#### Approach 1: QR + Companion Marker (Recommended)

Generate a high-contrast AR marker alongside the QR:

```bash
npm run generate-marker -- --markerId=marker-ad-001 --method=companion
```

This creates:
- `qr-marker-ad-001.png` - Standard QR code
- `ar-marker-ad-001.png` - AR-optimized pattern image
- `marker-ad-001.patt` - AR.js pattern file
- `printable-marker-ad-001.pdf` - Combined print layout (QR + AR marker side-by-side)

**Print the PDF** and instruct users:
1. Scan QR with native camera → Opens web app
2. Point phone at AR marker (the pattern image) → AR content appears

#### Approach 2: Enhanced QR Marker

Embed AR-friendly patterns into QR error correction areas:

```bash
npm run generate-marker -- --markerId=marker-news-001 --method=enhanced-qr
```

Creates a hybrid QR that both:
- Scans as normal QR (opens web app)
- Tracks as AR marker (anchors content)

**Trade-off:** Slightly reduced QR reliability, but single image for both functions.

### Printing Guidelines

**Critical for AR tracking quality:**

- **Size:** Minimum 4×4 inches (10×10 cm) for reliable detection
- **Paper:** Matte white cardstock (glossy causes glare)
- **Resolution:** 300 DPI minimum
- **Lamination:** Recommended for durability but use matte lamination
- **Distance:** Optimal 8-20 inches from camera
- **Lighting:** Bright, even light (avoid harsh shadows)
- **Angle:** Works 0-45° viewing angles

**What to avoid:**
- Colored paper (white background only)
- Crumpled or bent prints
- Small sizes (<3 inches) for QR-based markers
- Low contrast printers

### Testing Markers

```bash
# Test marker detection quality
npm run test-marker -- --file=./scripts/output/markers/ar-marker-ad-001.png
```

Returns a detection quality score (aim for >0.7 for reliable tracking).

---

## 🔧 Admin Dashboard

Access at `http://localhost:3000/admin`

**Default credentials** (change in production!):
- **Username:** `admin`
- **Password:** `demo123` (set via `npm run generate-password`)

### Features

1. **Content Management**
   - Create/edit AR content for each marker
   - Choose content type: Video, News, 3D Model
   - Set expiration dates for time-limited campaigns

2. **Perplexity Integration**
   - Paste article URL → Click "Summarize"
   - Auto-generates headline + 2-3 sentence summary
   - One-click publish to marker

3. **Analytics Dashboard**
   - Total scans per marker
   - Average view duration
   - Click-through rates
   - Geographic heat map (if IP geolocation enabled)
   - Export to CSV

4. **Marker Management**
   - Generate new markers with QR codes
   - Download printable PDFs
   - Test marker detection quality

---

## 📊 API Reference

### Content Management

**Get marker content:**
```http
GET /api/content/:markerId
```

Response:
```json
{
  "markerId": "marker-news-001",
  "type": "news",
  "title": "AI Revolutionizes Healthcare",
  "summary": "New AI models detect diseases earlier...",
  "url": "https://example.com/article",
  "style": {
    "backgroundColor": "#1a1a1a",
    "textColor": "#ffffff",
    "accentColor": "#00ff88"
  },
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Update marker content (Admin):**
```http
POST /api/content/:markerId
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "type": "video",
  "title": "New Product Launch",
  "videoUrl": "https://cdn.example.com/video.mp4",
  "posterUrl": "https://cdn.example.com/poster.jpg",
  "ctaText": "Learn More",
  "ctaUrl": "https://example.com/product"
}
```

### Analytics

**Track event:**
```http
POST /api/analytics
Content-Type: application/json

{
  "markerId": "marker-ad-001",
  "eventType": "scan",
  "sessionId": "uuid-v4",
  "timestamp": "2025-11-20T10:30:00Z",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "duration": 15.5
  }
}
```

Event types: `scan`, `viewDuration`, `click`, `share`

**Get analytics (Admin):**
```http
GET /api/analytics/:markerId?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer <admin-jwt-token>
```

### Perplexity Integration

**Generate summary:**
```http
POST /api/perplexity/summary
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "url": "https://example.com/article",
  "maxLength": 200
}
```

Response:
```json
{
  "headline": "AI Breakthrough in Medical Diagnosis",
  "summary": "Researchers at MIT have developed...",
  "keywords": ["AI", "healthcare", "diagnosis"],
  "readTime": "5 min"
}
```

---

## 🎥 Content Types & Assets

### Video Ads

**Recommended formats:**
- MP4 (H.264, AAC) for iOS compatibility
- WebM (VP9, Opus) for Android fallback
- Max resolution: 1920×1080 (mobile optimization)
- Bitrate: 2-5 Mbps
- Duration: 15-60 seconds

**Optimization:**
```bash
npm run optimize-video -- --input=./path/to/video.mp4 --output=./frontend/public/assets/videos/
```

**Usage in API:**
```json
{
  "type": "video",
  "videoUrl": "https://cdn.example.com/video.mp4",
  "posterUrl": "https://cdn.example.com/poster.jpg",
  "autoplay": true,
  "loop": true
}
```

### 3D Models

**Recommended formats:**
- **GLB** (binary GLTF) - preferred
- Max file size: 5MB (mobile optimization)
- Polygon count: <50k triangles
- Textures: 1024×1024 or 2048×2048

**Sample model included:**
- `frontend/public/assets/models/sample-product.glb`

**Free 3D model sources:**
- [Sketchfab](https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount)
- [Google Poly Archive](https://poly.pizza/)
- [Smithsonian 3D](https://3d.si.edu/)

**Optimization:**
```bash
npm run optimize-model -- --input=./model.glb --output=./frontend/public/assets/models/
```

### News Articles

**Auto-generated with Perplexity:**
- Headline (max 60 chars)
- Summary (2-3 sentences, max 200 chars)
- Featured image (optional)
- Read More link

**Manual creation:**
```json
{
  "type": "news",
  "title": "Breaking: New Discovery",
  "summary": "Scientists have found...",
  "imageUrl": "https://example.com/image.jpg",
  "url": "https://example.com/full-article"
}
```

---

## 🔐 Security Best Practices

### API Keys

**Never expose keys client-side:**
- ✅ Store in backend `.env` file
- ✅ Access via server-side API routes
- ❌ Never commit to Git (use `.env.example` templates)
- ❌ Never hardcode in frontend

**Key rotation:**
```bash
# Generate new admin JWT secret
npm run generate-secret

# Update .env and restart backend
```

### Authentication

**Production recommendations:**
1. **Replace simple JWT with OAuth 2.0** (Google, Microsoft)
2. **Use HTTPS everywhere** (Let's Encrypt free certificates)
3. **Implement rate limiting:**
   ```bash
   npm install express-rate-limit
   # Already configured in backend/middleware/rateLimiter.js
   ```
4. **Enable CORS whitelist** (configured in backend/.env)
5. **Use bcrypt for passwords** (already implemented)

### Content Security

- **Validate URLs** before fetching (prevent SSRF)
- **Sanitize user inputs** (XSS protection)
- **Limit file uploads** (if adding asset upload feature)
- **Implement CSP headers** (already in backend/middleware/security.js)

---

## 🌐 Deployment

### Frontend (Vercel - Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Set environment variables in Vercel dashboard
# REACT_APP_API_URL=https://your-backend.herokuapp.com
```

### Backend (Render/Heroku/Railway)

**Render (recommended):**
1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com/)
3. Connect repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables from `.env.example`
7. Deploy

**Heroku:**
```bash
# Install Heroku CLI
# Create new app
heroku create portal-ar-backend

# Set environment variables
heroku config:set PERPLEXITY_API_KEY=your-key

# Deploy
git subtree push --prefix backend heroku main

# Or use the provided Procfile
# (Already included in backend/Procfile)
```

**Database setup:**
- **Development:** SQLite (included, no setup needed)
- **Production:** PostgreSQL (Heroku Postgres, Render Postgres, Supabase)

```bash
# Migration command (run after first deploy)
npm run migrate:production
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Includes:
# - Frontend on :3000
# - Backend on :3001
# - PostgreSQL database
# - Nginx reverse proxy
```

---

## 🧪 Testing Checklist

### Device Compatibility

- [ ] **iOS Safari** 11.3+ (primary WebAR platform)
- [ ] **Android Chrome** 81+ (AR.js support)
- [ ] **Desktop browsers** (fallback mode)

### AR Testing

- [ ] Camera permission granted smoothly
- [ ] Marker detection works in various lighting
- [ ] Content anchors stably to marker
- [ ] Content hides when marker not visible
- [ ] Multiple markers can be tracked (if multi-marker mode)

### Content Testing

- [ ] Video loads and autoplays (muted)
- [ ] 3D model loads and is interactive
- [ ] News cards are readable and responsive
- [ ] CTA buttons open correct links
- [ ] Animations play smoothly (60 FPS target)

### Analytics Testing

- [ ] Scan events recorded
- [ ] View duration tracked accurately
- [ ] Click events captured
- [ ] Admin dashboard displays correct metrics

### Performance Testing

- [ ] Initial load <3 seconds on 4G
- [ ] Video starts within 2 seconds
- [ ] 3D model loads progressively
- [ ] No frame drops during AR tracking
- [ ] Battery usage reasonable (<5% per minute)

### UX Testing

- [ ] Instructions clear for first-time users
- [ ] Fallback works when AR not available
- [ ] Offline mode functions correctly
- [ ] Error messages helpful and actionable
- [ ] Accessible (screen reader compatible)

---

## 🐛 Troubleshooting

### "Camera not working"

**iOS:**
- Settings → Safari → Camera → Allow
- Settings → Screen Time → Content & Privacy → Camera → Allow

**Android:**
- Settings → Apps → Chrome → Permissions → Camera → Allow
- Check that site is served over HTTPS (required for camera access)

**Local development:**
- Use `localhost` or `127.0.0.1` (HTTP allowed)
- Or use ngrok (provides HTTPS)

### "Marker not detecting"

1. **Check marker quality:**
   ```bash
   npm run test-marker -- --file=path/to/marker.png
   ```

2. **Improve conditions:**
   - Add more light (avoid shadows)
   - Hold phone 8-12 inches from marker
   - Keep marker flat and still
   - Ensure marker not wrinkled or glossy

3. **Regenerate marker:**
   ```bash
   npm run generate-marker -- --markerId=your-id --method=companion --high-contrast
   ```

### "Content not loading"

1. **Check API connectivity:**
   ```bash
   curl http://localhost:3001/api/content/marker-news-001
   ```

2. **Check CORS settings:**
   - Ensure frontend origin in `backend/.env` ALLOWED_ORIGINS
   - Check browser console for CORS errors

3. **Check content URL:**
   - Video URLs must be direct MP4/WebM links
   - 3D model URLs must be GLB format
   - Ensure URLs are publicly accessible

### "Admin login fails"

1. **Regenerate password hash:**
   ```bash
   cd backend
   npm run generate-password
   ```

2. **Check JWT secret:**
   - Must be at least 32 characters
   - Use `npm run generate-secret` if needed

3. **Clear browser cache/cookies**

### "Perplexity API errors"

1. **Check API key:**
   ```bash
   # Test key
   curl -X POST https://api.perplexity.ai/chat/completions \
     -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model": "llama-3.1-sonar-small-128k-online", "messages": [{"role": "user", "content": "test"}]}'
   ```

2. **Check rate limits:**
   - Free tier: 50 requests/day
   - Paid tier: Higher limits

3. **Use mock mode:**
   ```env
   PERPLEXITY_MOCK_MODE=true
   ```

---

## 📚 Additional Resources

### Documentation

- **Full API Docs:** `docs/API.md`
- **Marker Creation Guide:** `docs/MARKER_GUIDE.md`
- **Deployment Guide:** `docs/DEPLOYMENT.md`
- **Expo Demo Guide:** `docs/EXPO_DEMO.md`

### AR.js Resources

- [AR.js Documentation](https://ar-js-org.github.io/AR.js-Docs/)
- [A-Frame Documentation](https://aframe.io/docs/)
- [Marker Training Tutorial](https://ar-js-org.github.io/AR.js-Docs/marker-based/)

### Community

- **Discord:** [Join our community](https://discord.gg/portal-ar)
- **GitHub Issues:** Report bugs and request features
- **Twitter:** [@PortalAR](https://twitter.com/portal-ar)

---

## 📝 License

MIT License - feel free to use in commercial projects.

---

## 🙏 Credits

- **AR.js** - WebAR image tracking
- **A-Frame** - WebXR framework
- **Perplexity AI** - Content summarization
- **QRCode.js** - QR code generation
- Sample 3D models from Smithsonian Open Access

---

## 🚦 Roadmap

- [ ] Multi-marker tracking (track 2+ markers simultaneously)
- [ ] AR filters and effects
- [ ] Social sharing with AR preview
- [ ] WebRTC live streaming to AR overlay
- [ ] Geolocation-based AR (GPS + marker hybrid)
- [ ] Analytics export to Google Analytics/Mixpanel
- [ ] White-label customization
- [ ] React Native mobile app version

---

**Ready to launch your AR experience? Start with `npm run dev` and follow the Quick Start guide above!** 🚀

For questions or support, open an issue or contact the development team.
