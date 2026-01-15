#!/bin/bash
cd "$(dirname "$0")"

echo "📦 Adding ALL changes..."
git add .

echo "💾 Committing..."
git commit -m "chore: Final sync of all files for production"

echo "🚀 Pushing to GitHub..."
git push origin main
