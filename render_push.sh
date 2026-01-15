#!/bin/bash
cd "$(dirname "$0")"

echo "📦 git adding changes..."
git add server.js src/components/UploadButton.tsx package.json

echo "💾 Committing deployment changes..."
git commit -m "chore: Prepare for Render Deployment (Port, CORS, API URL)"

echo "🚀 Pushing to GitHub..."
git push origin main
