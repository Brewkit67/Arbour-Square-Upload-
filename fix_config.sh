#!/bin/bash
cd "$(dirname "$0")"
echo "🔧 Cleaning up old config files..."
rm -f postcss.config.js tailwind.config.js
echo "✅ Deleted .js configs."
echo "✅ Validating .cjs configs:"
ls -l *.cjs
echo "🚀 You can now run 'npx vite'"
