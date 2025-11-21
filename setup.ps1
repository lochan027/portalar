# PortalAR Complete Setup Script
# Run this after extracting the project

Write-Host "`n🚀 PortalAR Setup Script`n" -ForegroundColor Blue
Write-Host "================================`n" -ForegroundColor Blue

# Check Node.js installation
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js installed: $nodeVersion`n" -ForegroundColor Green

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed`n" -ForegroundColor Green

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
cd backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Setup backend environment
if (-not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Backend .env created`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env already exists, skipping`n" -ForegroundColor Yellow
}

# Generate admin credentials
Write-Host "Generating admin credentials..." -ForegroundColor Yellow
Write-Host "Using default password: demo123`n" -ForegroundColor Gray

# Generate password hash
$password = "demo123"
$hash = node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('$password', 10));"

# Generate JWT secret
$secret = node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));"

# Update .env file
$envContent = Get-Content ".env" -Raw
$envContent = $envContent -replace "ADMIN_PASSWORD_HASH=.*", "ADMIN_PASSWORD_HASH=$hash"
$envContent = $envContent -replace "ADMIN_JWT_SECRET=.*", "ADMIN_JWT_SECRET=$secret"
Set-Content ".env" $envContent

Write-Host "✅ Admin credentials configured" -ForegroundColor Green
Write-Host "   Username: admin" -ForegroundColor Gray
Write-Host "   Password: demo123`n" -ForegroundColor Gray

cd ..

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
cd frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Setup frontend environment
if (-not (Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Frontend .env created`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env already exists, skipping`n" -ForegroundColor Yellow
}

cd ..

# Install scripts dependencies
Write-Host "Installing scripts dependencies..." -ForegroundColor Yellow
cd scripts
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install scripts dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Scripts dependencies installed`n" -ForegroundColor Green

cd ..

# Seed database
Write-Host "Seeding database with demo content..." -ForegroundColor Yellow
cd backend
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Database seeding failed (non-critical)`n" -ForegroundColor Yellow
} else {
    Write-Host "✅ Database seeded with demo content`n" -ForegroundColor Green
}

cd ..

# Create output directories
Write-Host "Creating output directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "scripts/output/qr-codes" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts/output/markers" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/public/markers" | Out-Null
Write-Host "✅ Output directories created`n" -ForegroundColor Green

# Summary
Write-Host "================================" -ForegroundColor Blue
Write-Host "✅ Setup Complete!`n" -ForegroundColor Green

Write-Host "📚 Next Steps:`n" -ForegroundColor Yellow
Write-Host "1. Start development servers:" -ForegroundColor White
Write-Host "   npm run dev`n" -ForegroundColor Gray

Write-Host "2. Generate QR markers:" -ForegroundColor White
Write-Host "   npm run generate-qr -- --markerId=marker-news-001" -ForegroundColor Gray
Write-Host "   npm run generate-marker -- --markerId=marker-news-001`n" -ForegroundColor Gray

Write-Host "3. Access the app:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Gray
Write-Host "   Admin:    http://localhost:3000/admin`n" -ForegroundColor Gray

Write-Host "4. Admin Login:" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor Gray
Write-Host "   Password: demo123`n" -ForegroundColor Gray

Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "   Quick Start: QUICKSTART.md" -ForegroundColor Gray
Write-Host "   Full Docs:   README.md" -ForegroundColor Gray
Write-Host "   Markers:     docs/MARKER_GUIDE.md`n" -ForegroundColor Gray

Write-Host "🎉 Ready to build AR experiences!`n" -ForegroundColor Green
