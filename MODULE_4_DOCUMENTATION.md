# MODULE 4: SYSTEM CODING - FinZora Financial Management System

## Project Overview
FinZora is an AI-powered financial management system designed for university project submission. This document covers MODULE 4: SYSTEM CODING implementation with clean, production-ready code.

**Tech Stack:**
- Frontend: React.js + TypeScript
- Backend: Python Flask
- Database: Firebase Firestore
- AI Logic: Rule-based categorization (ML-ready architecture)

---

## PROJECT STRUCTURE

```
FinZora/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── ai_categorizer.py         # AI expense categorization logic
│   ├── firebase_service.py       # Firestore database operations
│   ├── stock_service.py          # Stock portfolio management
│   ├── validations.py            # Input validation functions
│   └── requirements.txt          # Python dependencies
│
├── src/
│   ├── services/
│   │   └── api.ts               # Frontend API integration layer
│   │
│   ├── components/
│   │   ├── AddExpense.tsx       # Expense form component
│   │   └── StockPortfolio.tsx   # Stock portfolio component
│   │
│   └── ... (other React components)
```

---

## BACKEND IMPLEMENTATION

### 1. Main Application (app.py)

**Key Features:**
- RESTful API endpoints for income, expenses, and stocks
- Automatic expense categorization
- Firestore integration
- Comprehensive error handling
- CORS support for frontend communication

**Endpoints Provided:**
```
Income Management:
  POST   /api/income/add          - Add new income
  GET    /api/income/list         - Retrieve all incomes

Expense Management:
  POST   /api/expense/add         - Add expense (with AI categorization)
  GET    /api/expense/list        - Retrieve expenses (with optional filter)
  GET    /api/expense/statistics  - Get category-wise breakdown

Stock Portfolio:
  POST   /api/stock/add           - Add stock to portfolio
  GET    /api/stock/list          - Get portfolio with metrics
  POST   /api/stock/update-prices - Update live stock prices

Health:
  GET    /api/health              - Check API status
```

### 2. AI Expense Categorizer (ai_categorizer.py)

**Categorization Logic:**
Uses keyword-based matching for intelligent expense categorization.

**Supported Categories:**
- **Food**: McDonalds, Pizza, Starbucks, Restaurant
- **Transport**: Uber, Ola, Lyft, Fuel, Parking
- **Shopping**: Amazon, Flipkart, Walmart, Target
- **Entertainment**: Netflix, Spotify, Gaming, Cinema
- **Utilities**: Electricity, Water, Internet, Phone
- **Healthcare**: Hospital, Pharmacy, Gym, Medical
- **Education**: School, University, Course, Books

**Features:**
- ML-ready architecture (extensible with ML models)
- Custom rule addition support
- Bulk categorization capability
- Modular and reusable

### 3. Firebase Service (firebase_service.py)

**Database Operations:**
- User-specific collections for income, expenses, stocks
- Real-time data persistence
- Category-filtered queries
- Statistical calculations

**Database Structure:**
```
Firestore:
└── users/
    └── {user_id}/
        ├── income/
        │   └── {income_id}: {amount, source, date, ...}
        ├── expenses/
        │   └── {expense_id}: {amount, merchant, category, date, ...}
        └── stocks/
            └── {stock_id}: {symbol, quantity, buyPrice, currentPrice, ...}
```

### 4. Stock Service (stock_service.py)

**Features:**
- Live stock price fetching via Alpha Vantage API
- Profit/Loss calculations
- Portfolio metrics (net worth, returns)
- Batch price updates
- Fallback mock data for testing

**Supported Metrics:**
- Investment amount
- Current market value
- Profit/Loss (absolute & percentage)
- Portfolio returns

### 5. Input Validation (validations.py)

**Validation Rules:**

| Field | Rules |
|-------|-------|
| Amount | Required, positive, numeric, ≤ 10M |
| Merchant | Required, max 100 chars |
| Stock Symbol | Required, 1-10 chars, alphanumeric |
| Quantity | Required, positive integer, ≤ 1M |
| Buy Price | Required, positive, ≤ 100,000 |

---

## FRONTEND IMPLEMENTATION

### 1. API Service Layer (api.ts)

**Purpose:** Centralized HTTP request handling with TypeScript types

**Exported Functions:**
```typescript
// Income
addIncome(amount, source, description, date)
getIncomeList()

// Expenses
addExpense(amount, merchant, description, date)
getExpenseList(category?)
getExpenseStats()

// Stocks
addStock(symbol, quantity, buyPrice, date)
getStockPortfolio()
updateStockPrices()
```

### 2. Add Expense Form (AddExpense.tsx)

**Features:**
- Real-time form validation
- Live AI category prediction
- Error message display
- Success/failure notifications
- Loading states

**Form Fields:**
- Amount (required, numeric)
- Merchant (required, string)
- Description (optional)
- Date (required, ISO format)

### 3. Stock Portfolio (StockPortfolio.tsx)

**Features:**
- Add stocks with validation
- Real-time price updates
- Portfolio metrics display
- Profit/Loss highlighting
- Performance percentage calculation

**Displayed Metrics:**
- Total investment
- Net worth
- Total profit/loss
- Per-stock performance
- Return percentage

---

## SETUP INSTRUCTIONS

### Backend Setup

1. **Create Backend Directory:**
```bash
mkdir backend
cd backend
```

2. **Create Virtual Environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies:**
```bash
pip install -r requirements.txt
```

4. **Setup Firebase:**
- Download credentials JSON from Firebase Console
- Place as `credentials.json` in backend directory
- Update `firebase_service.py` if needed

5. **Run Backend Server:**
```bash
python app.py
```
Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install Frontend Dependencies:**
```bash
npm install
# or
bun install
```

2. **Update API Endpoint:**
In `src/services/api.ts`, ensure API_BASE_URL matches your backend:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

3. **Run Frontend:**
```bash
npm run dev
```

---

## IMPLEMENTATION EXAMPLES

### Adding an Expense

**Frontend Call:**
```typescript
const response = await addExpense(500, "McDonald's", "Lunch", "2024-01-21");
// Returns: { success: true, expense_id: "xxx", category: "Food" }
```

**Backend Process:**
1. Validates amount and merchant
2. AI categorizes "McDonald's" → "Food"
3. Stores in Firestore
4. Returns categorized expense

### Stock Portfolio Tracking

**Adding a Stock:**
```typescript
const response = await addStock("AAPL", 10, 150.25, "2024-01-20");
// Returns: { current_price: 152.50, profit_loss: 22.50 }
```

**Portfolio Calculation:**
- Investment: 150.25 × 10 = ₹1,502.50
- Current Value: 152.50 × 10 = ₹1,525.00
- Profit: ₹22.50 (1.5%)

---

## CODE QUALITY STANDARDS

### Implemented:
✅ **Clean Code:**
- Meaningful variable names
- Single responsibility principle
- DRY (Don't Repeat Yourself)
- Comprehensive comments

✅ **Modularity:**
- Separate concerns (API, DB, AI, Validation)
- Reusable functions
- Service layer pattern
- TypeScript interfaces

✅ **Error Handling:**
- Try-catch blocks
- User-friendly error messages
- Input validation
- Graceful failure modes

✅ **Performance:**
- Efficient database queries
- Batch operations support
- Minimal API calls
- Client-side validation

---

## CONFIGURATION & ENVIRONMENT

### Required Environment Variables:

**Backend (.env)**
```
FLASK_ENV=development
FLASK_DEBUG=True
FIREBASE_CREDENTIALS_PATH=credentials.json
ALPHA_VANTAGE_API_KEY=YOUR_API_KEY
```

**Frontend (.env)**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## TESTING RECOMMENDATIONS

### Test Cases:

**1. Expense Categorization:**
- ✓ McDonald's → Food
- ✓ Uber → Transport
- ✓ Amazon → Shopping
- ✓ Unknown merchant → Uncategorized

**2. Validation:**
- ✓ Empty amount → Error
- ✓ Negative amount → Error
- ✓ Missing merchant → Error
- ✓ Valid input → Success

**3. Stock Portfolio:**
- ✓ Add valid stock → Success
- ✓ Invalid symbol → Error
- ✓ Price updates → Calculate P&L
- ✓ Multiple stocks → Aggregate metrics

---

## DEPLOYMENT NOTES

### Production Deployment:

**Backend:**
```bash
# Use Gunicorn for production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Frontend:**
```bash
# Build for production
npm run build
# Deploy dist/ folder to static hosting
```

**Security Checklist:**
- ✓ Input validation on all endpoints
- ✓ CORS properly configured
- ✓ Firebase credentials not in code
- ✓ API keys in environment variables
- ✓ HTTPS enforced in production
- ✓ Rate limiting on APIs

---

## FUTURE ENHANCEMENTS (ML-Ready)

Current rule-based system is designed for easy ML integration:

1. **ML Model Integration:**
```python
# Replace rule-based with ML model
from sklearn.naive_bayes import MultinomialNB
classifier = MultinomialNB()
category = classifier.predict([merchant_embedding])
```

2. **Advanced Features:**
- Budget recommendations
- Spending anomaly detection
- Predictive expense forecasting
- Investment recommendation engine

3. **Performance Optimization:**
- Implement caching
- Database indexing
- API response compression
- Frontend code splitting

---

## UNIVERSITY SUBMISSION CHECKLIST

- ✅ Clean, well-commented code
- ✅ Modular architecture
- ✅ AI-based categorization logic
- ✅ Database integration
- ✅ Frontend-backend integration
- ✅ Input validation
- ✅ Error handling
- ✅ API documentation
- ✅ Setup instructions
- ✅ Code examples

---

## CONTACT & SUPPORT

For questions or modifications, refer to:
- Backend: `app.py` comments
- AI Logic: `ai_categorizer.py`
- Database: `firebase_service.py`
- Frontend: Component-level comments

---

**Document Version:** 1.0  
**Last Updated:** January 2024  
**Status:** Ready for University Submission
