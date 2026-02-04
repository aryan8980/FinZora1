# FinZora

FinZora is an AI-powered personal finance dashboard built with React, TypeScript, Vite, Tailwind CSS, and shadcn-ui. Features include expense tracking, stock portfolio management, AI-powered categorization, and chatbot assistance.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### 1. Install dependencies

```bash
npm install
cd backend && pip install -r requirements.txt && cd ..
```

### 2. Configure environment

Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:5000/api
ALPHA_VANTAGE_API_KEY=demo
```

### 3. Run the application

**Terminal 1 - Backend:**
```bash
cd backend && python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Open your browser

Visit: http://localhost:8080

---

## 🌍 Deploy to Production (Public Access)

Want to host your app so **anyone can access it from anywhere**? 

### Quick Deploy:
1. Run preparation script:
   ```bash
   ./deploy-prep.sh
   ```

2. Follow the comprehensive guide:
   📖 **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)**

### Recommended Stack (FREE):
- **Backend:** Render.com (Free tier)
- **Frontend:** Vercel (Free tier)
- **Total Cost:** $0/month

The deployment guide includes:
- Step-by-step instructions with screenshots
- Environment variable configuration
- Custom domain setup (optional)
- Troubleshooting tips
- Keeping free tier active

---

## 📁 Project Structure

```
FinZora1/
├── backend/              # Flask API
│   ├── app.py           # Main backend application
│   ├── requirements.txt # Python dependencies
│   ├── Procfile         # Deployment configuration
│   └── ...
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── pages/           # Route pages
│   ├── services/        # API integration
│   └── ...
├── public/              # Static assets
├── vercel.json          # Vercel deployment config
└── netlify.toml         # Netlify deployment config
```

---

## 🛠 Technologies

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn-ui
- **State Management:** React Query
- **Routing:** React Router

### Backend
- **Framework:** Flask (Python)
- **APIs:** Alpha Vantage (stocks), Groq (AI chat)
- **Database:** Firebase Firestore
- **CORS:** Enabled for cross-origin requests

---

## 🔑 API Keys Setup

### Alpha Vantage (Stock Prices) - FREE
1. Visit: https://www.alphavantage.co/
2. Get free API key (5 requests/minute)
3. Add to `.env`: `ALPHA_VANTAGE_API_KEY=your_key`

### Groq (AI Chat) - FREE
1. Visit: https://groq.com/
2. Create account and get API key
3. Add to `.env`: `GROQ_API_KEY=your_key`

### Firebase (Database) - FREE
1. Create project at https://console.firebase.google.com
2. Download `credentials.json` to `backend/`
3. Enable Firestore Database

---

## 📚 Documentation

- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Deploy to cloud (Render + Vercel)
- **[HOSTING_GUIDE.md](HOSTING_GUIDE.md)** - Local network access
- **[API_KEY_SETUP.py](API_KEY_SETUP.py)** - API configuration help
- **[START_HERE.md](START_HERE.md)** - Getting started guide

---

## 🔧 Development

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint code
```bash
npm run lint
```

---

## 🐛 Troubleshooting

### Backend won't start?
- Check Python version: `python --version` (need 3.11+)
- Install dependencies: `pip install -r backend/requirements.txt`
- Check port 5000 is free: `lsof -i :5000`

### Frontend won't connect to backend?
- Check `VITE_API_URL` in `.env`
- Ensure backend is running on port 5000
- Check browser console for errors (F12)

### Stocks not working?
- Using demo API key? Get real one from Alpha Vantage
- Check API limits (5 requests/minute on free tier)
- View backend logs for API errors

---

## 🔒 Security Notes

- ✅ `.env` is in `.gitignore` - never commit API keys
- ✅ Use environment variables in production
- ✅ Firebase credentials should be kept secure
- ✅ CORS is configured for production use

---

## 📱 Features

- 📊 Expense & Income Tracking
- 💼 Stock Portfolio Management
- 📈 Real-time Stock Prices
- 🤖 AI-Powered Expense Categorization
- 💬 Financial Chatbot Assistant
- 📉 Budget Planning & Goals
- 📱 Responsive Design (Mobile & Desktop)
- 🔐 Firebase Authentication
- 🌙 Dark/Light Theme

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 💬 Need Help?

- Check documentation files in the project root
- Review troubleshooting section above
- Check backend logs for errors
- Ensure all API keys are configured correctly

---

**Made with ❤️ using React, TypeScript, Flask, and modern web technologies**
