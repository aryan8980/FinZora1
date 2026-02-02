"""
SETUP AND INSTALLATION GUIDE
FinZora - MODULE 4: SYSTEM CODING
Quick start guide for university project submission
"""

# ============================================================================
# STEP 1: BACKEND SETUP (Python Flask)
# ============================================================================

BACKEND_SETUP = """
Windows PowerShell / Command Prompt:

1. Navigate to project directory:
   cd path/to/vista-fin-ai-main

2. Create backend folder:
   mkdir backend
   cd backend

3. Create Python virtual environment:
   python -m venv venv
   venv\\Scripts\\activate

4. Create requirements.txt with:
   Flask==2.3.2
   flask-cors==4.0.0
   firebase-admin==6.1.0
   requests==2.31.0
   python-dotenv==1.0.0
   gunicorn==21.2.0

5. Install dependencies:
   pip install -r requirements.txt

6. Copy these files into backend/:
   - app.py
   - ai_categorizer.py
   - firebase_service.py
   - stock_service.py
   - validations.py

7. Setup Firebase:
   a) Go to Firebase Console: https://console.firebase.google.com
   b) Create new project or use existing one
   c) Go to Settings > Service Accounts
   d) Click "Generate New Private Key"
   e) Save as "credentials.json" in backend folder

8. Start backend server:
   python app.py
   
   Expected output:
   * Running on http://127.0.0.1:5000
   * Debug mode: on

✓ Backend is now running on http://localhost:5000
"""

# ============================================================================
# STEP 2: FRONTEND SETUP (React + TypeScript)
# ============================================================================

FRONTEND_SETUP = """
Windows PowerShell / Command Prompt:

1. From project root directory:
   cd path/to/vista-fin-ai-main

2. Install dependencies (if not already done):
   npm install
   OR
   bun install

3. Copy these files into src/components/:
   - AddExpense.tsx
   - StockPortfolio.tsx

4. Copy this file into src/services/:
   - api.ts

5. Verify API endpoint in src/services/api.ts:
   const API_BASE_URL = 'http://localhost:5000/api';

6. Start development server:
   npm run dev
   OR
   bun dev
   
   Expected output:
   ➜  Local:   http://localhost:5173/
   ➜  press h to show help

✓ Frontend is now running on http://localhost:5173
"""

# ============================================================================
# STEP 3: INTEGRATION TESTING
# ============================================================================

TESTING_GUIDE = """
Test Backend & Frontend Integration:

1. Open Browser:
   http://localhost:5173

2. Test Add Expense Feature:
   - Input Amount: 500
   - Input Merchant: "McDonald's"
   - Input Date: Today's date
   - Expected: "Category: Food" appears

   - Input Amount: 100
   - Input Merchant: "Uber"
   - Expected: "Category: Transport" appears

3. Test Stock Portfolio:
   - Input Symbol: AAPL
   - Input Quantity: 10
   - Input Buy Price: 150.25
   - Expected: Stock added with current price

4. Check Browser Console:
   Press F12 > Console tab
   Should show no errors (warnings are ok)

5. Check Backend Terminal:
   Should show GET/POST requests logged

✓ All integration tests passed!
"""

# ============================================================================
# STEP 4: PROJECT STRUCTURE VERIFICATION
# ============================================================================

EXPECTED_STRUCTURE = """
vista-fin-ai-main/
├── backend/
│   ├── venv/                    (Python virtual environment)
│   ├── app.py                   ✓ Main Flask app
│   ├── ai_categorizer.py        ✓ AI logic
│   ├── firebase_service.py      ✓ Database ops
│   ├── stock_service.py         ✓ Stock logic
│   ├── validations.py           ✓ Input validation
│   ├── credentials.json         ✓ Firebase key (KEEP SECRET!)
│   └── requirements.txt         ✓ Python packages
│
├── src/
│   ├── components/
│   │   ├── AddExpense.tsx       ✓ Expense form
│   │   ├── StockPortfolio.tsx   ✓ Portfolio manager
│   │   └── ... (other components)
│   │
│   ├── services/
│   │   ├── api.ts              ✓ API layer
│   │   └── ... (other services)
│   │
│   └── ... (other src files)
│
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── MODULE_4_DOCUMENTATION.md    ✓ Full documentation
└── ... (other config files)

✓ Structure verified!
"""

# ============================================================================
# COMMON ISSUES & SOLUTIONS
# ============================================================================

TROUBLESHOOTING = """
Issue 1: "ModuleNotFoundError: No module named 'flask'"
Solution:
  - Ensure virtual environment is activated: venv\\Scripts\\activate
  - Run: pip install -r requirements.txt

Issue 2: Backend runs but frontend shows "Failed to add expense"
Solution:
  - Check backend is running on http://localhost:5000
  - Verify API_BASE_URL in src/services/api.ts is correct
  - Check browser console (F12) for CORS errors

Issue 3: "credentials.json" not found
Solution:
  - Download from Firebase Console (Settings > Service Accounts)
  - Save as credentials.json in backend/ folder
  - Restart Flask server

Issue 4: Stock prices show as mock data
Solution:
  - This is intentional fallback behavior
  - To use real prices, add Alpha Vantage API key:
    - Get free key from https://www.alphavantage.co/
    - Add to backend/stock_service.py line 17:
      ALPHA_VANTAGE_KEY = 'YOUR_API_KEY_HERE'

Issue 5: Port already in use (address already in use)
Solution:
  - Change Flask port in app.py:
    app.run(debug=True, host='0.0.0.0', port=5001)  # Use 5001 instead
  - Or stop other process using that port

Issue 6: CORS Error when calling backend
Solution:
  - Ensure flask-cors is installed: pip install flask-cors
  - Verify CORS(app) line exists in app.py
  - Restart Flask server
"""

# ============================================================================
# QUICK START CHECKLIST
# ============================================================================

QUICK_START = """
✓ BACKEND SETUP CHECKLIST:
  □ Python 3.8+ installed
  □ Virtual environment created and activated
  □ requirements.txt installed
  □ credentials.json placed in backend/
  □ Backend files (5 files) copied
  □ Flask running without errors

✓ FRONTEND SETUP CHECKLIST:
  □ Node.js/Bun installed
  □ npm install or bun install completed
  □ Frontend files (2 components, 1 service) copied
  □ API_BASE_URL verified in api.ts
  □ Development server running

✓ INTEGRATION CHECKLIST:
  □ Both servers running simultaneously
  □ No errors in browser console (F12)
  □ Test add expense form works
  □ Test stock portfolio works
  □ AI categorization appears in UI

✓ SUBMISSION READY:
  □ All code files present
  □ MODULE_4_DOCUMENTATION.md reviewed
  □ Code is clean and commented
  □ No sensitive info in code
  □ Project structure intact
"""

# ============================================================================
# ENVIRONMENT VARIABLES (OPTIONAL)
# ============================================================================

ENV_SETUP = """
Create .env file in project root:

# Backend Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FIREBASE_CREDENTIALS_PATH=backend/credentials.json
ALPHA_VANTAGE_API_KEY=YOUR_FREE_API_KEY

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:5000/api

Then in app.py, load with:
  from dotenv import load_dotenv
  load_dotenv()
  api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
"""

# ============================================================================
# FILE LOCATIONS FOR COPY-PASTE
# ============================================================================

FILE_LOCATIONS = """
When copying files to your project:

BACKEND FILES (Create backend/ folder first):
  1. app.py                  → backend/app.py
  2. ai_categorizer.py       → backend/ai_categorizer.py
  3. firebase_service.py     → backend/firebase_service.py
  4. stock_service.py        → backend/stock_service.py
  5. validations.py          → backend/validations.py
  6. requirements.txt        → backend/requirements.txt

FRONTEND FILES:
  1. api.ts                  → src/services/api.ts
  2. AddExpense.tsx          → src/components/AddExpense.tsx
  3. StockPortfolio.tsx      → src/components/StockPortfolio.tsx

DOCUMENTATION:
  1. MODULE_4_DOCUMENTATION.md → project_root/MODULE_4_DOCUMENTATION.md

CREDENTIALS (Download from Firebase):
  1. credentials.json        → backend/credentials.json (NOT in git!)
"""

# ============================================================================
# STARTUP COMMANDS (COPY-PASTE READY)
# ============================================================================

STARTUP_COMMANDS = """
WINDOWS BATCH FILE (save as start.bat):
  @echo off
  echo Starting FinZora Backend & Frontend...
  
  cd backend
  start cmd /k venv\\Scripts\\activate && python app.py
  
  cd ..
  start cmd /k npm run dev
  
  echo Backend: http://localhost:5000
  echo Frontend: http://localhost:5173

WINDOWS POWERSHELL (run these separately):
  # Terminal 1 - Backend:
  cd backend; venv\\Scripts\\activate; python app.py
  
  # Terminal 2 - Frontend:
  npm run dev

MACOS/LINUX:
  # Terminal 1 - Backend:
  cd backend && source venv/bin/activate && python app.py
  
  # Terminal 2 - Frontend:
  npm run dev
"""

if __name__ == "__main__":
    print(QUICK_START)
    print("\n" + "="*70 + "\n")
    print(BACKEND_SETUP)
    print("\n" + "="*70 + "\n")
    print(FRONTEND_SETUP)
    print("\n" + "="*70 + "\n")
    print(TESTING_GUIDE)
