# 🚀 Quick Deployment Reference

## One-Command Deploy Prep
```bash
./deploy-prep.sh
git push origin main
```

---

## Backend (Render.com)

### Configuration:
```
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

### Environment Variables:
```
ALPHA_VANTAGE_API_KEY=your_key
FLASK_ENV=production
```

### URL Example:
```
https://finzora-backend.onrender.com
```

---

## Frontend (Vercel)

### Configuration:
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

### Environment Variables:
```
VITE_API_URL=https://finzora-backend.onrender.com/api
```

### URL Example:
```
https://finzora.vercel.app
```

---

## Free Tier Limits

**Render:**
- Sleeps after 15 min inactivity
- First request: ~30-60 sec wake time
- Solution: Use cron-job.org to ping every 10 min

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deploys
- Auto SSL

---

## Quick Test

After deployment:

```bash
# Test backend
curl https://your-backend.onrender.com/api/health

# Visit frontend
open https://your-app.vercel.app
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend sleeping | Use cron job or upgrade to $7/month |
| CORS errors | Check VITE_API_URL is correct |
| Build fails | Check logs on platform dashboard |
| 500 errors | Check backend logs for Python errors |

---

## Update After Deploy

```bash
git add .
git commit -m "Update"
git push origin main
```

Both platforms auto-deploy!

---

📖 **Full Guide:** [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
