"""
CODE EXAMPLES & USAGE SCENARIOS
MODULE 4: SYSTEM CODING - FinZora
University Project Submission Ready
"""

# ============================================================================
# EXAMPLE 1: EXPENSE ADDITION WITH AI CATEGORIZATION
# ============================================================================

EXAMPLE_ADD_EXPENSE = """
SCENARIO: User adds expense at McDonald's

FRONTEND CODE EXECUTION:
─────────────────────────
1. User fills form:
   Amount: 500
   Merchant: "McDonald's"
   Description: "Lunch with friends"
   Date: 2024-01-21

2. Form validation runs:
   ✓ Amount is numeric and positive
   ✓ Merchant is not empty
   
3. API call made:
   POST /api/expense/add
   {
     "amount": 500,
     "merchant": "McDonald's",
     "description": "Lunch with friends",
     "date": "2024-01-21"
   }

BACKEND PROCESSING:
─────────────────────────
1. Flask app.py receives request
2. Validations.py validates input:
   ✓ 500 is between 0 and 10,000,000
   ✓ "McDonald's" is not empty

3. AI Categorizer processes merchant:
   - Normalize: "mcdonald's"
   - Check against Food keywords
   - Match found: "mcdonalds" ✓
   - Category: "Food"

4. Firebase Service stores:
   Collection: users/{user_id}/expenses
   Document: {
     "amount": 500,
     "merchant": "McDonald's",
     "description": "Lunch with friends",
     "category": "Food",
     "date": "2024-01-21",
     "timestamp": "2024-01-21T12:30:45.123Z",
     "type": "expense"
   }

5. Response to frontend:
   {
     "success": true,
     "message": "Expense added successfully",
     "expense_id": "abc123xyz",
     "category": "Food"
   }

FRONTEND DISPLAY:
─────────────────────────
Success message: "Expense added successfully! Category: Food"
Form clears automatically
List updates in real-time
"""

# ============================================================================
# EXAMPLE 2: STOCK PORTFOLIO MANAGEMENT
# ============================================================================

EXAMPLE_STOCK_PORTFOLIO = """
SCENARIO: User adds Apple stock and tracks profits

STEP 1: ADD STOCK
─────────────────────────
Frontend input:
  Symbol: AAPL
  Quantity: 10
  Buy Price: 150.25
  Date: 2024-01-01

API Call: POST /api/stock/add
{
  "symbol": "AAPL",
  "quantity": 10,
  "buy_price": 150.25,
  "date": "2024-01-01"
}

Backend Processing:
1. Validations.py checks:
   ✓ Symbol "AAPL" is valid (1-10 chars)
   ✓ Quantity 10 is positive integer
   ✓ Price 150.25 is valid number

2. stock_service.py fetches live price:
   - Current price: 152.50 (from API)
   
3. Calculate metrics:
   - Investment: 150.25 × 10 = 1,502.50
   - Current Value: 152.50 × 10 = 1,525.00
   - Profit/Loss: 1,525.00 - 1,502.50 = 22.50
   - Return: (22.50 / 1,502.50) × 100 = 1.50%

4. Save to Firestore:
   Document: {
     "symbol": "AAPL",
     "quantity": 10,
     "buy_price": 150.25,
     "current_price": 152.50,
     "profit_loss": 22.50,
     "date": "2024-01-01",
     "timestamp": "2024-01-21T10:00:00Z"
   }

Response:
{
  "success": true,
  "stock_id": "stock123",
  "current_price": 152.50,
  "profit_loss": 22.50
}

STEP 2: UPDATE PRICES
─────────────────────────
User clicks "Update Prices" button

API Call: POST /api/stock/update-prices

Backend:
1. Fetch all user's stocks from Firestore
2. For each stock, fetch new price:
   - AAPL: 153.20 (price increased!)
3. Recalculate P&L:
   - New Profit: (153.20 × 10) - 1,502.50 = 30.50
4. Update Firestore documents
5. Return updated data

Frontend Display:
┌─────────────────────────────────┐
│ Portfolio Summary               │
├─────────────────────────────────┤
│ Total Investment:  ₹1,502.50    │
│ Net Worth:         ₹1,532.00    │
│ Total P&L:         ₹30.50 ▲     │ (Green - Profit)
├─────────────────────────────────┤
│ Symbol │ Qty │ Buy  │ Current │ P&L  │ Return │
│ AAPL   │ 10  │ 150.25│ 153.20 │ 30.50│ 2.03% │
└─────────────────────────────────┘
"""

# ============================================================================
# EXAMPLE 3: EXPENSE CATEGORIZATION LOGIC
# ============================================================================

EXAMPLE_CATEGORIZATION = """
AI CATEGORIZATION TEST CASES:

Case 1: Merchant = "Starbucks"
─────────────────────────
Input: "Starbucks"
Normalize: "starbucks"
Check Food keywords: ["starbucks", "coffee", ...]
Match: "starbucks" ✓
Output: "Food"

Case 2: Merchant = "Uber"
─────────────────────────
Input: "Uber"
Normalize: "uber"
Check Transport keywords: ["uber", "ola", "taxi", ...]
Match: "uber" ✓
Output: "Transport"

Case 3: Merchant = "Amazon"
─────────────────────────
Input: "Amazon"
Normalize: "amazon"
Check Shopping keywords: ["amazon", "flipkart", ...]
Match: "amazon" ✓
Output: "Shopping"

Case 4: Merchant = "Netflix"
─────────────────────────
Input: "Netflix"
Normalize: "netflix"
Check Entertainment keywords: ["netflix", "spotify", ...]
Match: "netflix" ✓
Output: "Entertainment"

Case 5: Merchant = "XYZ Random Store"
─────────────────────────
Input: "XYZ Random Store"
Normalize: "xyz random store"
Check all categories: No match found
Output: "Uncategorized"

BATCH CATEGORIZATION:
─────────────────────────
merchants = ["McDonald's", "Uber", "Netflix"]
Results = {
  "McDonald's": "Food",
  "Uber": "Transport",
  "Netflix": "Entertainment"
}
"""

# ============================================================================
# EXAMPLE 4: INPUT VALIDATION SCENARIOS
# ============================================================================

EXAMPLE_VALIDATION = """
EXPENSE VALIDATION TEST CASES:

✓ VALID INPUT:
  Amount: 500, Merchant: "McDonald's"
  → Success: Valid input

✗ INVALID AMOUNT - EMPTY:
  Amount: "", Merchant: "McDonald's"
  → Error: "Amount is required"

✗ INVALID AMOUNT - NEGATIVE:
  Amount: -100, Merchant: "McDonald's"
  → Error: "Amount must be greater than zero"

✗ INVALID AMOUNT - NOT NUMERIC:
  Amount: "abc", Merchant: "McDonald's"
  → Error: "Amount must be a valid number"

✗ INVALID AMOUNT - EXCEEDS LIMIT:
  Amount: 100000000, Merchant: "McDonald's"
  → Error: "Amount exceeds maximum limit"

✗ INVALID MERCHANT - EMPTY:
  Amount: 500, Merchant: ""
  → Error: "Merchant is required"

✗ INVALID MERCHANT - TOO LONG:
  Amount: 500, Merchant: "[text > 100 chars]"
  → Error: "Description is too long (max 100 characters)"

STOCK VALIDATION TEST CASES:

✓ VALID STOCK:
  Symbol: "AAPL", Quantity: 10, Price: 150.25
  → Success: Stock added

✗ INVALID SYMBOL - EMPTY:
  Symbol: "", Quantity: 10, Price: 150.25
  → Error: "Stock symbol is required"

✗ INVALID QUANTITY - NEGATIVE:
  Symbol: "AAPL", Quantity: -5, Price: 150.25
  → Error: "Stock quantity must be greater than zero"

✗ INVALID PRICE - NOT NUMERIC:
  Symbol: "AAPL", Quantity: 10, Price: "abc"
  → Error: "Stock buy price must be a valid number"
"""

# ============================================================================
# EXAMPLE 5: DATABASE OPERATIONS FLOW
# ============================================================================

EXAMPLE_DATABASE_FLOW = """
FIREBASE FIRESTORE OPERATIONS:

SAVING EXPENSE:
─────────────────────────
expense_record = {
  "amount": 500,
  "merchant": "McDonald's",
  "category": "Food",
  "date": "2024-01-21",
  "timestamp": "2024-01-21T12:30:45Z",
  "type": "expense"
}

firebase_service.add_expense(expense_record)
  ↓
Database Path:
users/{user_id}/expenses/{expense_id}
  ↓
Stored in Firestore ✓

RETRIEVING EXPENSES:
─────────────────────────
firebase_service.get_expenses(category="Food")
  ↓
Query: WHERE category == "Food"
       ORDER BY date DESC
       LIMIT 100
  ↓
Returns: [
  {
    "id": "expense1",
    "amount": 500,
    "merchant": "McDonald's",
    "category": "Food",
    ...
  },
  {
    "id": "expense2",
    "amount": 300,
    "merchant": "Pizza Hut",
    "category": "Food",
    ...
  }
]

CALCULATING STATISTICS:
─────────────────────────
firebase_service.get_expense_statistics()
  ↓
Aggregate all expenses by category:
  
Stats = {
  "Food": 2500,           # Total spent on food
  "Transport": 1800,      # Total spent on transport
  "Shopping": 5000,       # Total spent on shopping
  "Entertainment": 1200,  # Total spent on entertainment
  ...
}

SAVING STOCK:
─────────────────────────
stock_record = {
  "symbol": "AAPL",
  "quantity": 10,
  "buy_price": 150.25,
  "current_price": 152.50,
  "profit_loss": 22.50,
  "date": "2024-01-01",
  "timestamp": "2024-01-21T10:00:00Z"
}

firebase_service.add_stock(stock_record)
  ↓
Database Path:
users/{user_id}/stocks/{stock_id}
  ↓
Stored in Firestore ✓

RETRIEVING PORTFOLIO:
─────────────────────────
firebase_service.get_stocks()
  ↓
Returns all stocks with calculations:
[
  {
    "id": "stock1",
    "symbol": "AAPL",
    "quantity": 10,
    "buy_price": 150.25,
    "current_price": 152.50,
    "profit_loss": 22.50,
    ...
  },
  {
    "id": "stock2",
    "symbol": "GOOGL",
    "quantity": 5,
    "buy_price": 140,
    "current_price": 145,
    "profit_loss": 25,
    ...
  }
]
"""

# ============================================================================
# EXAMPLE 6: API REQUEST-RESPONSE CYCLE
# ============================================================================

EXAMPLE_API_CYCLE = """
COMPLETE API REQUEST-RESPONSE CYCLE:

REQUEST → VALIDATION → PROCESSING → DATABASE → RESPONSE

EXAMPLE 1: Add Expense
──────────────────────────

User Action:
┌─────────────────────────┐
│ Submit Expense Form     │
│ Amount: 500             │
│ Merchant: McDonald's    │
└─────────────────────────┘
           ↓
Frontend (React):
┌─────────────────────────────────────────┐
│ addExpense(500, "McDonald's")            │
│   ↓                                      │
│ fetch('http://localhost:5000/.../add')  │
│   ↓                                      │
│ POST request with JSON body              │
└─────────────────────────────────────────┘
           ↓
Network: HTTP POST to /api/expense/add
           ↓
Backend (Flask):
┌──────────────────────────────────────┐
│ @app.route('/api/expense/add')       │
│   ↓                                  │
│ receive JSON request                 │
│   ↓                                  │
│ validate_transaction(500, "McDonald's")
│   ✓ Valid                            │
│   ↓                                  │
│ categorizer.categorize("McDonald's") │
│   ✓ Returns "Food"                   │
│   ↓                                  │
│ firebase_service.add_expense(record) │
│   ✓ Saved, returns expense_id        │
│   ↓                                  │
│ return JSON response                 │
└──────────────────────────────────────┘
           ↓
HTTP Response:
{
  "success": true,
  "expense_id": "abc123",
  "category": "Food",
  "message": "Expense added successfully"
}
           ↓
Frontend Processing:
┌──────────────────────────────────────┐
│ Parse JSON response                  │
│ Display: "Expense added! Category: Food"
│ Clear form                           │
│ Refresh expense list                 │
│ Show success alert (3 sec)           │
└──────────────────────────────────────┘
           ↓
User Sees:
┌──────────────────────────────────────┐
│ ✓ Expense added successfully!        │
│ Category: Food                       │
│                                      │
│ [New Expense Form Reset]             │
└──────────────────────────────────────┘
"""

# ============================================================================
# EXAMPLE 7: SUMMARY OF DATA FLOW
# ============================================================================

EXAMPLE_DATA_FLOW_SUMMARY = """
COMPLETE DATA FLOW DIAGRAM:

USER INTERFACE
     │
     ↓
FRONTEND (React)
  • AddExpense.tsx
  • StockPortfolio.tsx
     │
     ├─ Form Validation
     ├─ Client-side checks
     │
     ↓
API SERVICE LAYER (api.ts)
  • HTTP requests
  • Error handling
  • Type-safe calls
     │
     ↓
NETWORK (HTTP/JSON)
  • POST /api/expense/add
  • GET /api/stock/list
  • etc.
     │
     ↓
BACKEND (Flask - app.py)
  • Route handlers
  • Business logic
     │
     ├─ VALIDATIONS (validations.py)
     │  ├─ Check amount > 0
     │  ├─ Check merchant not empty
     │  └─ Check data types
     │
     ├─ AI CATEGORIZER (ai_categorizer.py)
     │  ├─ Rule-based matching
     │  ├─ Keyword checking
     │  └─ Category assignment
     │
     ├─ STOCK SERVICE (stock_service.py)
     │  ├─ Fetch live prices
     │  ├─ Calculate P&L
     │  └─ Aggregate metrics
     │
     └─ FIREBASE SERVICE (firebase_service.py)
        ├─ Save to Firestore
        ├─ Retrieve from Firestore
        └─ Query and aggregate
     │
     ↓
DATABASE (Firebase Firestore)
  users/
  └─ {user_id}/
     ├─ income/
     ├─ expenses/
     └─ stocks/
     │
     ↓
RESPONSE (JSON)
{
  "success": true,
  "data": {...},
  "message": "..."
}
     │
     ↓
FRONTEND (Render UI)
  • Update display
  • Show confirmation
  • Refresh lists
"""

print(EXAMPLE_ADD_EXPENSE)
print("\n" + "="*70 + "\n")
print(EXAMPLE_STOCK_PORTFOLIO)
print("\n" + "="*70 + "\n")
print(EXAMPLE_VALIDATION)
print("\n" + "="*70 + "\n")
print(EXAMPLE_DATABASE_FLOW)
