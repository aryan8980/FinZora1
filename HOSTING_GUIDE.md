# 🌐 Hosting FinZora - Network & Device Access Guide

## Problem: Works on localhost but not on other devices?

This guide fixes the common issue where your app works perfectly on your local machine but won't load on other devices (phone, another computer, etc.).

---

## ✅ What Was Fixed

### 1. Backend Configuration
**Changed:** Backend was bound to `127.0.0.1` (localhost only)
**Fixed:** Now binds to `0.0.0.0` (accepts connections from any device)

### 2. Frontend API URL
**Changed:** API URL hardcoded to `http://localhost:5000`
**Fixed:** Uses environment variable `VITE_API_URL` for flexibility

---

## 🚀 Quick Setup Guide

### Option 1: Local Network Access (Same WiFi)

#### Step 1: Find Your Computer's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**On Mac/Linux:**
```bash
ifconfig | grep inet
# or
hostname -I
```

**On Codespaces/Cloud:**
Your forwarded URL (e.g., `https://xyz-5000.app.github.dev`)

#### Step 2: Create .env File

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and set your IP:
```env
# Replace with YOUR computer's IP address
VITE_API_URL=http://192.168.1.100:5000/api

# Or for Codespaces, use your forwarded URL:
# VITE_API_URL=https://xyz-5000.app.github.dev/api
```

#### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```
Should show: `Running on http://0.0.0.0:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Should show: `Local: http://localhost:8080`

#### Step 4: Access From Other Devices

On your phone/other device, open:
```
http://192.168.1.100:8080
```
(Replace with YOUR IP address)

---

### Option 2: Cloud Hosting (Production)

#### For Codespaces/Cloud IDEs:

1. **Backend:** Already accessible via port forwarding
2. **Frontend:** Set environment variable:
   ```env
   VITE_API_URL=https://your-backend-url.app.github.dev/api
   ```

#### For VPS/Server Hosting:

1. **Backend:**
   ```bash
   # Use a production server like Gunicorn
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Frontend:**
   ```bash
   # Build for production
   npm run build
   
   # Serve with nginx or any static server
   npm install -g serve
   serve -s dist -l 8080
   ```

3. **Set environment variable:**
   ```env
   VITE_API_URL=https://yourdomain.com/api
   ```

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to backend"

**Check 1: Firewall**
```bash
# Allow ports on firewall
# Windows:
netsh advfirewall firewall add rule name="FinZora Backend" dir=in action=allow protocol=TCP localport=5000

# Linux:
sudo ufw allow 5000
sudo ufw allow 8080
```

**Check 2: Backend is running**
```bash
# Test from your computer first
curl http://localhost:5000/api/health

# Test from other device
curl http://YOUR_IP:5000/api/health
```

**Check 3: Environment variable loaded**
Open browser console (F12) and check if API calls go to correct URL

### Issue: "CORS errors"

The backend already has CORS enabled. If you still see errors:
```python
# In backend/app.py, update CORS:
CORS(app, origins=["*"])  # Allow all origins (for testing)
# Or specify your URLs:
CORS(app, origins=["http://192.168.1.100:8080", "http://localhost:8080"])
```

### Issue: "Works on WiFi but not mobile data"

- Mobile data uses different network
- Options:
  1. Use cloud hosting (Heroku, Vercel, etc.)
  2. Use ngrok for temporary public URL:
     ```bash
     ngrok http 5000
     ```

---

## 📱 Device Testing Checklist

- [ ] Find your computer's IP address
- [ ] Create `.env` file with correct `VITE_API_URL`
- [ ] Start backend (should show `0.0.0.0:5000`)
- [ ] Start frontend
- [ ] Test on same computer: `http://localhost:8080`
- [ ] Test on other device: `http://YOUR_IP:8080`
- [ ] Check firewall allows ports 5000 and 8080
- [ ] Both devices on same WiFi network

---

## 🌟 Recommended Production Setup

### Frontend: Vercel/Netlify
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variable on Vercel dashboard:
VITE_API_URL=https://your-backend.com/api
```

### Backend: Heroku/Railway/Fly.io
```bash
# Heroku example
heroku create finzora-backend
git push heroku main

# Set environment variables
heroku config:set ALPHA_VANTAGE_API_KEY=your_key
```

---

## 📝 Summary

**Backend Change:**
- `app.run(host='127.0.0.1')` → `app.run(host='0.0.0.0')`

**Frontend Change:**
- `const API_BASE_URL = 'http://localhost:5000/api'`
- → `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`

**Environment Variable:**
- Create `.env` file
- Set `VITE_API_URL=http://YOUR_IP:5000/api`

**Result:**
- ✅ Works on your computer
- ✅ Works on other devices (same network)
- ✅ Can deploy to production

---

Need help? Check which step is failing and refer to the troubleshooting section above!
