"""
ALPHA VANTAGE API SETUP GUIDE
Get Free Real Stock Prices - Easy 2-Minute Setup
"""

# ============================================================================
# STEP 1: GET FREE API KEY (2 minutes)
# ============================================================================

GETTING_API_KEY = """
1. Visit: https://www.alphavantage.co/

2. Click "Get Free API Key"

3. Fill the form:
   - Email: Your email
   - Name: Your name
   - Affiliation: Student/University
   - Purpose: Financial Application

4. Check your email for API key (instant)

5. Copy the API key (looks like: ABC123XYZ456...)

Done! ✓
"""

# ============================================================================
# STEP 2: ADD API KEY TO YOUR PROJECT (1 minute)
# ============================================================================

ADD_TO_PROJECT = """
Option A: Environment Variable (Recommended)

1. Create .env file in project root:
   ALPHA_VANTAGE_API_KEY=your_api_key_here

2. Backend will read automatically from environment

Option B: Direct in Code

1. Open backend/stock_service.py

2. Find line 18:
   ALPHA_VANTAGE_KEY = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')

3. Replace with:
   ALPHA_VANTAGE_KEY = 'YOUR_API_KEY_HERE'

Option C: Using Python-dotenv

1. API key is in .env file
2. Backend loads it automatically:
   from dotenv import load_dotenv
   load_dotenv()
   api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
"""

# ============================================================================
# STEP 3: VERIFY SETUP
# ============================================================================

VERIFY_SETUP = """
Test if API key works:

Windows PowerShell:
─────────────────────
$apiKey = "YOUR_API_KEY"
$symbol = "AAPL"
$url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=$symbol&apikey=$apiKey"
(Invoke-RestMethod -Uri $url).`'Global Quote`'

Python:
──────
import requests
response = requests.get(
    'https://www.alphavantage.co/query',
    params={
        'function': 'GLOBAL_QUOTE',
        'symbol': 'AAPL',
        'apikey': 'YOUR_API_KEY'
    }
)
print(response.json())

Expected Output:
────────────────
{
  "Global Quote": {
    "05. price": "150.25",
    ...
  }
}

If you see the price, your API key works! ✓
"""

# ============================================================================
# API LIMITS & PRICING
# ============================================================================

API_LIMITS = """
FREE PLAN (Recommended for University Project):
──────────────────────────────────────────────

✓ Stock Prices:      Unlimited
✓ Updates:          5 requests per minute
✓ Cost:             FREE
✓ Historical Data:  Limited
✓ Support:          Community

Perfect for:
• Student projects
• Learning
• Testing
• Demonstrations

LIMITS:
• 5 API calls per minute
• 500 calls per day
• ~30 stocks update per cycle (wait 1 min between cycles)

HOW TO WORK WITHIN LIMITS:
─────────────────────────

1. Don't update all stocks at once
2. Batch updates: Update 5 stocks, wait 1 minute
3. Cache prices for 1-5 minutes
4. Show cached price, update in background

EXAMPLE: Update 10 stocks
──────────────────────
Cycle 1: Update AAPL, GOOGL, MSFT, TESLA, INFY (5 requests)
Wait: 1 minute (shows previous prices while updating)
Cycle 2: Update TCS, HDFC, IBMB, WIPRO, HSBA (5 requests)

Users see instant updates + real prices!
"""

# ============================================================================
# COMMON ISSUES & SOLUTIONS
# ============================================================================

TROUBLESHOOTING = """
Issue 1: "Could not fetch real price for AAPL"
─────────────────────────────────────────────

Cause: Invalid or missing API key
Solution:
  1. Verify API key in .env or code
  2. Test with: python test_api.py (see below)
  3. Check API key is copied correctly (no spaces)
  4. Regenerate new API key from website


Issue 2: "API Rate Limit: Please wait before making requests"
──────────────────────────────────────────────────────────────

Cause: More than 5 requests per minute
Solution:
  1. Wait 1 minute between update cycles
  2. Don't update all stocks at once
  3. Add delay: import time; time.sleep(60)
  4. Show cached prices while waiting


Issue 3: "Invalid Stock Symbol"
──────────────────────────────

Cause: Stock symbol doesn't exist
Solution:
  1. Use valid US stock symbols (AAPL, GOOGL, MSFT)
  2. For Indian stocks: INFY.BSE, TCS.BSE
  3. Check on Yahoo Finance or Google for symbol


Issue 4: Timeout Error
──────────────────────

Cause: API server slow or network issue
Solution:
  1. Retry automatically (already implemented, retries 3 times)
  2. Check internet connection
  3. Wait a moment and try again
  4. API has built-in retry logic


Issue 5: Empty Price Response
──────────────────────────────

Cause: API returned data but no price
Solution:
  1. Symbol doesn't exist
  2. API didn't return price yet (new symbol)
  3. Try common symbols first: AAPL, GOOGL, MSFT
"""

# ============================================================================
# TEST YOUR API KEY
# ============================================================================

TEST_SCRIPT = """
Create file: test_api.py

---START---
import requests
import os
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
api_key = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')

print(f"Testing with API Key: {api_key[:10]}...")

# Test symbols
test_symbols = ['AAPL', 'GOOGL', 'MSFT', 'INFY']

for symbol in test_symbols:
    try:
        print(f"\\nFetching {symbol}...")
        response = requests.get(
            'https://www.alphavantage.co/query',
            params={
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol,
                'apikey': api_key
            },
            timeout=10
        )
        
        data = response.json()
        
        if 'Error Message' in data:
            print(f"  ✗ Error: {data['Error Message']}")
        elif 'Note' in data:
            print(f"  ⚠ Rate Limit: {data['Note']}")
        elif 'Global Quote' in data:
            price = data['Global Quote'].get('05. price')
            if price:
                print(f"  ✓ Price: ${price}")
            else:
                print(f"  ✗ No price data")
        else:
            print(f"  ✗ Unexpected response: {data}")
    
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")

print("\\n✓ Test complete!")
---END---

Run: python test_api.py
"""

# ============================================================================
# RECOMMENDED STOCKS FOR TESTING
# ============================================================================

RECOMMENDED_STOCKS = """
US STOCKS (Always have data):
├── AAPL (Apple) - Very stable
├── GOOGL (Google) - Always good
├── MSFT (Microsoft) - Reliable
├── AMZN (Amazon) - Good data
├── TSLA (Tesla) - Very popular
├── META (Meta/Facebook) - Good
└── NVDA (Nvidia) - Popular

INDIAN STOCKS (Format: SYMBOL.BSE):
├── INFY (Infosys) - Good data
├── TCS (Tata Consulting) - Most reliable
├── HDB (HDFC Bank) - Good
├── WIPRO - Available
└── BAJAJFINSV - Available

GLOBAL STOCKS:
├── BHP (mining, Australia)
├── SAN (Santos, Australia)
├── ORE (China)
├── CCIV (Lucid Motors, EV)
└── NIO (NIO, Chinese EV)

Start with: AAPL, GOOGL, MSFT
These always have data available!
"""

# ============================================================================
# SETUP COMPLETE CHECKLIST
# ============================================================================

CHECKLIST = """
✓ Got free API key from https://www.alphavantage.co
✓ Added API key to .env file or code
✓ Tested API key with test_api.py
✓ Backend stock_service.py configured
✓ App.py updated to use real prices
✓ Ran local test - prices fetching correctly
✓ Ready to add stocks and track them with REAL prices!

Success! You now have real-time stock price fetching! 🚀
"""

if __name__ == "__main__":
    print(GETTING_API_KEY)
    print("\n" + "="*70 + "\n")
    print(ADD_TO_PROJECT)
    print("\n" + "="*70 + "\n")
    print(VERIFY_SETUP)
    print("\n" + "="*70 + "\n")
    print(API_LIMITS)
    print("\n" + "="*70 + "\n")
    print(RECOMMENDED_STOCKS)
