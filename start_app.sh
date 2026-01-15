#!/bin/bash

# Ensure we are in the script's directory (The REAL project folder)
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)
echo "🚀 Launching BuildIntel Smartsort from: $PROJECT_DIR"

# Check for credentials
if [ ! -f "credentials.json" ]; then
    echo "⚠️  WARNING: credentials.json not found!"
    if [ -f "credentials.json.json" ]; then
        echo "🔧 Fixing double extension..."
        mv "credentials.json.json" "credentials.json"
    fi
fi

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing modules..."
    npm install express multer googleapis cors
fi

# Kill likely conflicting ports (3001 and 5173) just in case
# (Skipped to avoid permission errors, but good to know)

echo "🟢 Starting Backend Server..."
# Run backend in background
node server.cjs &
BACKEND_PID=$!

echo "🔵 Starting Frontend (Vite)..."
# Run frontend
npx vite

# When vite exits, kill backend
kill $BACKEND_PID
