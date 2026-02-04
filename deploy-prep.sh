#!/bin/bash

# FinZora Deployment Preparation Script
# This script prepares your project for deployment

echo "=================================="
echo "FinZora Deployment Preparation"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Initializing..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "⚠️  No git remote found!"
    echo "Please create a GitHub repository and run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/FinZora1.git"
    echo "  git push -u origin main"
    echo ""
else
    echo "✅ Git remote configured"
    git remote -v
fi

# Check for .env file
if [ -f ".env" ]; then
    echo "⚠️  Warning: .env file found"
    echo "   Make sure it's in .gitignore!"
    if ! grep -q ".env" .gitignore 2>/dev/null; then
        echo ".env" >> .gitignore
        echo "✅ Added .env to .gitignore"
    fi
else
    echo "✅ No .env file (good - use environment variables in production)"
fi

# Check if changes are committed
if [[ -n $(git status -s) ]]; then
    echo ""
    echo "📝 Uncommitted changes found. Committing..."
    git add .
    git commit -m "Prepare for deployment"
    echo "✅ Changes committed"
else
    echo "✅ All changes committed"
fi

echo ""
echo "=================================="
echo "🚀 Ready for Deployment!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Deploy Backend (Render):"
echo "   - Visit: https://render.com"
echo "   - Sign up with GitHub"
echo "   - Create new Web Service"
echo "   - Select this repository"
echo "   - Root: backend"
echo "   - Build: pip install -r requirements.txt"
echo "   - Start: gunicorn app:app"
echo "   - Add environment variables"
echo ""
echo "3. Deploy Frontend (Vercel):"
echo "   - Visit: https://vercel.com"
echo "   - Sign up with GitHub"
echo "   - Import this repository"
echo "   - Set VITE_API_URL to your Render backend URL"
echo ""
echo "📖 Full guide: See PRODUCTION_DEPLOYMENT.md"
echo ""
