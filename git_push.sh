#!/bin/bash
cd "$(dirname "$0")"

echo "🐙 Initializing Git..."
git init

echo "📦 Adding files..."
git add .

echo "💾 Committing..."
git commit -m "feat: Initial commit of BuildIntel Arbour Square App
- Cinematic Glow Design
- Shared Drive Support
- Batch Upload Logic
- Glassmorphism UI"

echo "🔗 configuring remote..."
git branch -M main
# Remove origin if it exists to be safe
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Brewkit67/Arbour-Square-Upload-.git

echo "🚀 Pushing to GitHub..."
git push -u origin main
