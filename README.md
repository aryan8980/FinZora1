# FinZora

FinZora is an AI-powered personal finance dashboard built with React, TypeScript, Vite, Tailwind CSS, and shadcn-ui.

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Run the dev server

```powershell
npm run dev
```

3. Open your browser at the URL printed in the terminal (commonly http://localhost:5173 or http://localhost:8080).

## Firebase setup

1. Create a Firebase project (console.firebase.google.com) and add a Web app.
2. Enable Email/Password auth (and any OAuth providers you need) plus Firestore.
3. Add a `.env` file in the project root with your config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

4. Restart the dev server so Vite picks up the new env variables.

## Project structure

- `src/` — application source
- `public/` — static assets
- `index.html` — app entry

## Technologies

- Vite
- React + TypeScript
- Tailwind CSS
- shadcn-ui

## Notes

- Keep secrets (API keys) out of source control. Use environment variables or a secret manager for production.
- For builds: `npm run build` and preview with `npm run preview`.

---

If you want this README to contain project-specific docs, contributor notes, or deploy instructions, tell me what you'd like and I can add them.
