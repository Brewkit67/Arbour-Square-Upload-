#!/bin/bash

echo "🔧 Fixing BuildIntel Smartsort Project..."

# 1. Fix Directory Path (Move to current script directory)
cd "$(dirname "$0")"
echo "📂 Working in: $(pwd)"

# 2. Fix Credentials File Name
if [ -f "credentials.json.json" ]; then
    echo "📄 Renaming credentials.json.json -> credentials.json"
    mv "credentials.json.json" "credentials.json"
fi

# 3. Install Dependencies
echo "📦 Installing Dependencies..."
npm install express multer googleapis cors

# 4. Check for server.cjs
if [ -f "server.cjs" ]; then
    echo "✅ server.cjs found."
else
    echo "❌ server.cjs NOT found!"
fi

echo "✨ Fix Complete!"
echo "----------------------------------------"
echo "1. Run Backend:  node server.cjs"
echo "2. Run Frontend: npx vite"
echo "----------------------------------------"
