#!/bin/bash

# Ensure correct directory
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)
echo "🧹 DEEP CLEAN STARTUP..."

# 1. Kill old processes
echo "💀 Killing old servers..."
pkill -f "vite"
pkill -f "node server.js"

# 2. Clear Vite Cache (Critical for config changes)
echo "🗑️  Clearing Vite Cache..."
rm -rf node_modules/.vite

# 3. Re-install to be safe
echo "📦 Verifying dependencies..."
npm install

# 4. Start Backend
echo "🟢 Starting Backend (Port 3000)..."
nohup node server.js > backend.log 2>&1 &

# 5. Start Frontend
echo "🔵 Starting Frontend (Port 5173)..."
echo "---------------------------------------"
echo "👉 IF you see a RED BOX on screen, tell me the error!"
echo "---------------------------------------"
npx vite --force --host
