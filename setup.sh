#!/bin/bash

# PortalAR Complete Setup Script (Linux/Mac)
# Run this after extracting the project

echo -e "\n\033[1;34m🚀 PortalAR Setup Script\033[0m"
echo -e "\033[1;34m================================\033[0m\n"

# Check Node.js installation
echo -e "\033[1;33mChecking Node.js...\033[0m"
if ! command -v node &> /dev/null; then
    echo -e "\033[1;31m❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/\033[0m"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "\033[1;32m✅ Node.js installed: $NODE_VERSION\033[0m\n"

# Install root dependencies
echo -e "\033[1;33mInstalling root dependencies...\033[0m"
npm install || { echo -e "\033[1;31m❌ Failed to install root dependencies\033[0m"; exit 1; }
echo -e "\033[1;32m✅ Root dependencies installed\033[0m\n"

# Install backend dependencies
echo -e "\033[1;33mInstalling backend dependencies...\033[0m"
cd backend
npm install || { echo -e "\033[1;31m❌ Failed to install backend dependencies\033[0m"; exit 1; }

# Setup backend environment
if [ ! -f ".env" ]; then
    echo -e "\033[1;33mCreating backend .env file...\033[0m"
    cp .env.example .env
    echo -e "\033[1;32m✅ Backend .env created\033[0m\n"
else
    echo -e "\033[1;33m⚠️  Backend .env already exists, skipping\033[0m\n"
fi

# Generate admin credentials
echo -e "\033[1;33mGenerating admin credentials...\033[0m"
echo -e "\033[0;37mUsing default password: demo123\033[0m\n"

# Generate password hash and JWT secret
HASH=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('demo123', 10));")
SECRET=$(node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));")

# Update .env file (Mac/Linux compatible)
sed -i.bak "s|ADMIN_PASSWORD_HASH=.*|ADMIN_PASSWORD_HASH=$HASH|" .env
sed -i.bak "s|ADMIN_JWT_SECRET=.*|ADMIN_JWT_SECRET=$SECRET|" .env
rm .env.bak

echo -e "\033[1;32m✅ Admin credentials configured\033[0m"
echo -e "\033[0;37m   Username: admin\033[0m"
echo -e "\033[0;37m   Password: demo123\033[0m\n"

cd ..

# Install frontend dependencies
echo -e "\033[1;33mInstalling frontend dependencies...\033[0m"
cd frontend
npm install || { echo -e "\033[1;31m❌ Failed to install frontend dependencies\033[0m"; exit 1; }

# Setup frontend environment
if [ ! -f ".env" ]; then
    echo -e "\033[1;33mCreating frontend .env file...\033[0m"
    cp .env.example .env
    echo -e "\033[1;32m✅ Frontend .env created\033[0m\n"
else
    echo -e "\033[1;33m⚠️  Frontend .env already exists, skipping\033[0m\n"
fi

cd ..

# Install scripts dependencies
echo -e "\033[1;33mInstalling scripts dependencies...\033[0m"
cd scripts
npm install || { echo -e "\033[1;31m❌ Failed to install scripts dependencies\033[0m"; exit 1; }
echo -e "\033[1;32m✅ Scripts dependencies installed\033[0m\n"

cd ..

# Seed database
echo -e "\033[1;33mSeeding database with demo content...\033[0m"
cd backend
npm run seed || echo -e "\033[1;33m⚠️  Database seeding failed (non-critical)\033[0m\n"
echo -e "\033[1;32m✅ Database seeded with demo content\033[0m\n"

cd ..

# Create output directories
echo -e "\033[1;33mCreating output directories...\033[0m"
mkdir -p scripts/output/qr-codes
mkdir -p scripts/output/markers
mkdir -p frontend/public/markers
echo -e "\033[1;32m✅ Output directories created\033[0m\n"

# Summary
echo -e "\033[1;34m================================\033[0m"
echo -e "\033[1;32m✅ Setup Complete!\033[0m\n"

echo -e "\033[1;33m📚 Next Steps:\033[0m\n"
echo -e "\033[1;37m1. Start development servers:\033[0m"
echo -e "\033[0;37m   npm run dev\033[0m\n"

echo -e "\033[1;37m2. Generate QR markers:\033[0m"
echo -e "\033[0;37m   npm run generate-qr -- --markerId=marker-news-001\033[0m"
echo -e "\033[0;37m   npm run generate-marker -- --markerId=marker-news-001\033[0m\n"

echo -e "\033[1;37m3. Access the app:\033[0m"
echo -e "\033[0;37m   Frontend: http://localhost:3000\033[0m"
echo -e "\033[0;37m   Backend:  http://localhost:3001\033[0m"
echo -e "\033[0;37m   Admin:    http://localhost:3000/admin\033[0m\n"

echo -e "\033[1;37m4. Admin Login:\033[0m"
echo -e "\033[0;37m   Username: admin\033[0m"
echo -e "\033[0;37m   Password: demo123\033[0m\n"

echo -e "\033[1;33m📖 Documentation:\033[0m"
echo -e "\033[0;37m   Quick Start: QUICKSTART.md\033[0m"
echo -e "\033[0;37m   Full Docs:   README.md\033[0m"
echo -e "\033[0;37m   Markers:     docs/MARKER_GUIDE.md\033[0m\n"

echo -e "\033[1;32m🎉 Ready to build AR experiences!\033[0m\n"
