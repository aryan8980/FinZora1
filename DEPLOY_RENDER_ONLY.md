# Render Full Stack Deployment (All-in-One)

## Deploy BOTH Frontend + Backend to Render

If you want everything on one platform:

### Step 1: Deploy Backend (Web Service)

1. Go to [render.com](https://render.com)
2. Create "Web Service"
3. Connect your GitHub repo
4. Settings:
   ```
   Name: finzora-backend
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```
5. Add environment variables:
   ```
   ALPHA_VANTAGE_API_KEY=your_key
   FLASK_ENV=production
   ```
6. Copy the backend URL

### Step 2: Deploy Frontend (Static Site)

1. On Render, click "New +" → "Static Site"
2. Connect same GitHub repo
3. Settings:
   ```
   Name: finzora-frontend
   Root Directory: ./
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. Add environment variable:
   ```
   VITE_API_URL=https://finzora-backend.onrender.com/api
   ```
   (Use YOUR backend URL from Step 1)
5. Deploy!

### Result:
- Backend: `https://finzora-backend.onrender.com`
- Frontend: `https://finzora-frontend.onrender.com`

**Both on Render, 100% FREE!**
