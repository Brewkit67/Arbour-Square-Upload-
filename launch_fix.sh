#!/bin/bash

# Define the paths
DIR_WITH_SPACE="/Users/terrybrewer/Documents/01. Buildintel Local Apps /01. Apps - 1st Fix Plumbing & Heating Ltd /Buildintel Arbour upload page "
DIR_NO_SPACE="/Users/terrybrewer/Documents/01. Buildintel Local Apps /01. Apps - 1st Fix Plumbing & Heating Ltd /Buildintel Arbour upload page"

echo "🧹 Cleaning up Duplicate Folders..."

# 1. Kill duplicate servers
pkill -f "vite"
pkill -f "node server.js"

# 2. Check content of NO_SPACE directory
if [ -d "$DIR_NO_SPACE" ]; then
    echo "✅ Found valid project directory."
    cd "$DIR_NO_SPACE"
    
    # Move anything valuable from the "Space" directory if it exists
    if [ -d "$DIR_WITH_SPACE" ]; then
        echo "⚠️  Found duplicate directory with space. checking for files..."
        # Try to move files, ignore errors if empty or duplicate
        mv "$DIR_WITH_SPACE"/* . 2>/dev/null
        # Remove the confusing directory
        rmdir "$DIR_WITH_SPACE"
        echo "🗑️  Removed duplicate directory."
    fi
else
    # If NO_SPACE doesn't exist, maybe everything is in WITH_SPACE?
    if [ -d "$DIR_WITH_SPACE" ]; then
        echo "⚠️  Project is in the 'Space' directory. Renaming..."
        mv "$DIR_WITH_SPACE" "$DIR_NO_SPACE"
        cd "$DIR_NO_SPACE"
    else
        echo "❌ CRITICAL: Could not find project folder!"
        exit 1
    fi
fi

# 3. Final Check & Launch
echo "📂 Working in: $(pwd)"

if [ -f "credentials.json.json" ]; then
    mv "credentials.json.json" "credentials.json"
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing..."
    npm install express multer googleapis cors
fi

echo "🚀 Starting App..."
nohup node server.js > backend.log 2>&1 & # Port 3000
npx vite --host # Port 5173
