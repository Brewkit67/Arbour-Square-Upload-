#!/bin/bash

# Define the exact path
TARGET_DIR="/Users/terrybrewer/Documents/01. Buildintel Local Apps /01. Apps - 1st Fix Plumbing & Heating Ltd /Buildintel Arbour upload page"

echo "🔧 Starting Clean Setup..."

# 1. Kill any existing node/vite processes to free ports
echo "🛑 Stopping old servers..."
pkill -f "vite"
pkill -f "server.js"
pkill -f "node server.js"

# 2. Check Directories (Handle trailing space ambiguity)
if [ -d "$TARGET_DIR " ]; then
    echo "⚠️  Found directory with trailing space. Moving content..."
    mv "$TARGET_DIR "/* "$TARGET_DIR/" 2>/dev/null
    rmdir "$TARGET_DIR "
fi

# 3. Create Target Directory if missing
mkdir -p "$TARGET_DIR"

# 4. Navigate
cd "$TARGET_DIR"
echo "📂 Working in: $(pwd)"

# 5. Fix Credentials Name
if [ -f "credentials.json.json" ]; then
    mv "credentials.json.json" "credentials.json"
    echo "✅ Fixed credentials filename"
fi

# 6. Install Dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing specific dependencies..."
    npm install express multer googleapis cors
fi

# 7. Start Backend (in background)
echo "🟢 Starting Backend on Port 3000..."
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# 8. Start Frontend (Vite)
echo "🔵 Starting Frontend..."
# Using --host to ensure it binds correctly
npx vite --host

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
