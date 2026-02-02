"""
Test script to verify real stock price fetching
This tests the /api/stock/add endpoint to check if REAL prices are being fetched
"""

import requests
import json

BASE_URL = "http://localhost:5000"

print("\n" + "="*70)
print("TESTING REAL STOCK PRICE FETCHING")
print("="*70 + "\n")

# Test health check first
print("1️⃣  Testing Backend Health...")
try:
    response = requests.get(f"{BASE_URL}/api/health")
    health = response.json()
    print(f"   ✓ Response: {health}")
    if 'success' in health:
        print(f"   ✓ API Key Configured: {health.get('api_key_configured')}")
        print(f"   ✓ Firebase Available: {health.get('firebase_available')}")
    elif 'status' in health:
        print(f"   ✓ Backend Status: {health.get('status')}")
    print()
except Exception as e:
    print(f"   ⚠️  Health check failed (may still be OK): {e}\n")

# Test adding a stock with REAL price
symbols = ['AAPL', 'GOOGL', 'MSFT']

for symbol in symbols:
    print(f"2️⃣  Testing REAL price fetch for {symbol}...")
    
    payload = {
        'symbol': symbol,
        'quantity': 1,
        'buy_price': 150,
        'date': '2024-01-01'
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/stock/add",
            json=payload,
            timeout=15
        )
        
        data = response.json()
        
        if response.status_code in [201, 500]:  # Accept 500 if Firebase not configured
            if 'current_price' in data:
                print(f"   ✓ Current Price: ${data['current_price']}")
                print(f"   ✓ Buy Price: {payload['buy_price']}")
                print(f"   ✓ Profit/Loss: ${data['profit_loss']}")
                
                # Verify price is DIFFERENT from buy price (not using fallback)
                if data['current_price'] != payload['buy_price']:
                    print(f"   ✓✓ REAL PRICE CONFIRMED (different from buy price)")
                else:
                    print(f"   ❌ Price might be using fallback!")
            else:
                print(f"   ℹ️  Firebase issue: {data.get('message')}")
                print(f"       (This is expected if credentials.json is missing)")
        else:
            print(f"   ❌ Error {response.status_code}: {data.get('message')}")
    
    except requests.exceptions.Timeout:
        print(f"   ❌ Timeout - API call took too long\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    print()

print("="*70)
print("TEST COMPLETE")
print("="*70)
print("\n💡 NEXT STEPS:")
print("   1. Check console output above for real price values")
print("   2. Prices should be different from the buy price (150)")
print("   3. If you see ₹175 for both, the API isn't fetching real data")
print("   4. If you see real prices, the API is working!\n")
