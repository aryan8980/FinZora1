# 🚀 FinZora - Production Deployment Guide

Deploy your FinZora app to the cloud so **anyone can access it from anywhere** - no network restrictions!

---

## 📋 Deployment Overview

We'll deploy:
- **Backend (Flask)** → Render.com (Free tier)
- **Frontend (React)** → Vercel (Free tier)

Total Cost: **$0/month** ✅

---

## 🎯 Part 1: Deploy Backend (Render.com)

### Step 1: Prepare Your Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Backend

1. **Click "New +" → "Web Service"**

2. **Connect your repository:**
   - Select `FinZora1` repository
   - Click "Connect"

3. **Configure the service:**
   ```
   Name: finzora-backend
   Region: Choose closest to you (e.g., Oregon)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   Instance Type: Free
   ```

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable":
   ```
   ALPHA_VANTAGE_API_KEY=your_actual_api_key
   GROQ_API_KEY=your_groq_key (optional)
   FLASK_ENV=production
   ```

5. **Click "Create Web Service"**

6. **Wait for deployment** (5-10 minutes)
   - You'll get a URL like: `https://finzora-backend.onrender.com`
   - **Copy this URL!** You'll need it for frontend.

### Step 4: Test Backend

Visit: `https://finzora-backend.onrender.com/api/health`

Should return: `{"status": "healthy"}`

---

## 🎨 Part 2: Deploy Frontend (Vercel)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel

### Step 2: Deploy Frontend

1. **Click "Add New..." → "Project"**

2. **Import your repository:**
   - Select `FinZora1`
   - Click "Import"

3. **Configure project:**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable:**
   Click "Environment Variables":
   ```
   Key: VITE_API_URL
   Value: https://finzora-backend.onrender.com/api
   ```
   (Use YOUR Render backend URL from Part 1!)

5. **Click "Deploy"**

6. **Wait for deployment** (2-3 minutes)
   - You'll get a URL like: `https://finzora-abc123.vercel.app`

### Step 3: Test Your App

1. Visit your Vercel URL
2. Try adding transactions, checking stocks, etc.
3. Everything should work!

---

## 🔥 Important Notes

### Backend Free Tier Limitations (Render):
- ⚠️ **Spins down after 15 minutes of inactivity**
- First request after sleep takes ~30-60 seconds
- To keep it active:
  - Upgrade to paid plan ($7/month)
  - Or use a cron job to ping it every 10 minutes

### Alternative: Keep Backend Active
Create a free cron job to ping your backend:

1. Go to [cron-job.org](https://cron-job.org)
2. Create account
3. Add new job:
   - URL: `https://finzora-backend.onrender.com/api/health`
   - Interval: Every 10 minutes
   - Save

---

## 🔧 Update After Deployment

### Update Backend:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render auto-deploys in ~5 minutes.

### Update Frontend:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel auto-deploys in ~2 minutes.

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `finzora.com`)
3. Update DNS records as instructed
4. SSL certificate auto-generated!

### Add Custom Domain to Render:
1. Go to your service → Settings → Custom Domain
2. Add domain (e.g., `api.finzora.com`)
3. Update DNS records
4. Update `VITE_API_URL` in Vercel to new domain

---

## 📱 Alternative Hosting Options

### Backend Alternatives:
1. **Railway.app** - Similar to Render, $5/month
2. **Fly.io** - 3 small VMs free forever
3. **PythonAnywhere** - Free tier available
4. **Heroku** - No free tier anymore
5. **AWS/GCP/Azure** - More complex, but powerful

### Frontend Alternatives:
1. **Netlify** - Similar to Vercel, free tier
2. **Cloudflare Pages** - Free, very fast
3. **GitHub Pages** - Free, but limited
4. **Firebase Hosting** - Free tier available

---

## 🐛 Troubleshooting

### Backend Not Working:

**Check logs on Render:**
1. Go to your service dashboard
2. Click "Logs" tab
3. Look for errors

**Common issues:**
- Missing environment variables
- Missing `requirements.txt` dependencies
- Port binding issues (should use `$PORT`)

### Frontend Not Connecting:

**Check browser console (F12):**
- CORS errors? → Backend CORS is configured
- 404 errors? → Check `VITE_API_URL` is correct
- Network errors? → Backend might be sleeping (Render free tier)

### Database/Firebase Issues:

If using Firebase:
1. Upload `credentials.json` as environment variable on Render:
   ```bash
   # Convert to base64
   cat backend/credentials.json | base64 -w 0
   ```
2. Add to Render environment:
   ```
   FIREBASE_CREDENTIALS_BASE64=<paste-base64-here>
   ```
3. Update `backend/firebase_service.py` to decode:
   ```python
   import base64
   import json
   credentials_b64 = os.getenv('FIREBASE_CREDENTIALS_BASE64')
   if credentials_b64:
       credentials_json = base64.b64decode(credentials_b64).decode()
       credentials_dict = json.loads(credentials_json)
   ```

---

## ✅ Deployment Checklist

### Before Deploying:
- [ ] All code committed and pushed to GitHub
- [ ] `.env` file NOT committed (use environment variables)
- [ ] API keys ready (Alpha Vantage, Groq, etc.)
- [ ] Test app works locally

### Backend (Render):
- [ ] Service created and deployed
- [ ] Environment variables added
- [ ] Backend URL copied
- [ ] Health check passes

### Frontend (Vercel):
- [ ] Project imported
- [ ] `VITE_API_URL` set to Render backend URL
- [ ] Build succeeds
- [ ] App works in browser

### Testing:
- [ ] Open Vercel URL
- [ ] Add transaction
- [ ] Check stock prices
- [ ] Test chatbot (if configured)
- [ ] Test from phone/other device

---

## 🎉 Success!

Your app is now live at:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://finzora-backend.onrender.com`

Share your URL with anyone - it works from **any device, anywhere!**

---

## 💰 Upgrade Options

### If you need better performance:

**Render Starter Plan ($7/month):**
- No sleep time
- Faster performance
- More reliable

**Vercel Pro ($20/month):**
- More bandwidth
- Better analytics
- Password protection

**Total for hobby project:** $7-27/month

---

## 📞 Need Help?

Common deployment questions:
1. **Backend sleeping?** → Use cron job or upgrade to paid
2. **CORS errors?** → Check backend URL is correct in `VITE_API_URL`
3. **Build failing?** → Check logs for missing dependencies
4. **Database not working?** → Check Firebase credentials setup

---

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/latest/deploying/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

**That's it!** Your FinZora app is now accessible from anywhere in the world! 🌍
