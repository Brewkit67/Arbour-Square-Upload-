#!/bin/bash
cd "$(dirname "$0")"

echo "🔧 REPAIRING GIT..."

# 1. Initialize (Safe to run even if already initialized)
git init

# 2. Add Remote (fail silently if exists, then set-url to be sure)
git remote add origin https://github.com/Brewkit67/Arbour-Square-Upload-.git 2>/dev/null
git remote set-url origin https://github.com/Brewkit67/Arbour-Square-Upload-.git

# 3. Ensure branch is main
git branch -M main

# 4. Add everything
echo "📦 Adding files..."
git add .

# 5. Commit
echo "💾 Committing..."
git commit -m "fix: Full project sync for Render deployment"

# 6. Push (Force overwrite because we re-initialized)
echo "🚀 Pushing (Force)..."
git push -u origin main --force
