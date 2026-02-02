"""
Test Real Stock Price Fetching
Quick test to verify API key and price fetching
"""

import requests
import os
from datetime import datetime

def test_alpha_vantage_api():
    """Test if API key works and fetch real stock prices"""
    
    # Get API key
    api_key = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')
    
    print("="*70)
    print("STOCK PRICE API TEST")
    print("="*70)
    print(f"\nAPI Key: {api_key[:10]}..." if len(api_key) > 10 else f"\nAPI Key: {api_key}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Test symbols
    test_symbols = ['AAPL', 'GOOGL', 'MSFT']
    
    print("Testing real stock prices:\n")
    
    all_success = True
    
    for symbol in test_symbols:
        try:
            print(f"➤ Fetching {symbol}...")
            
            response = requests.get(
                'https://www.alphavantage.co/query',
                params={
                    'function': 'GLOBAL_QUOTE',
                    'symbol': symbol,
                    'apikey': api_key
                },
                timeout=10
            )
            
            response.raise_for_status()
            data = response.json()
            
            # Check for errors
            if 'Error Message' in data:
                print(f"  ✗ Error: {data['Error Message']}")
                all_success = False
            
            elif 'Note' in data:
                print(f"  ⚠ API Rate Limit: {data['Note']}")
                print(f"    Please wait 60 seconds and try again")
                all_success = False
            
            elif 'Global Quote' in data:
                quote = data['Global Quote']
                price = quote.get('05. price')
                change = quote.get('09. change')
                change_pct = quote.get('10. change percent')
                
                if price and price != '':
                    print(f"  ✓ Real Price Fetched!")
                    print(f"    Symbol: {symbol}")
                    print(f"    Price: ${price}")
                    print(f"    Change: {change} ({change_pct})")
                else:
                    print(f"  ✗ No price data in response")
                    all_success = False
            else:
                print(f"  ✗ Unexpected response format")
                print(f"    Response: {data}")
                all_success = False
        
        except requests.exceptions.Timeout:
            print(f"  ✗ Timeout: Request took too long")
            all_success = False
        
        except requests.exceptions.ConnectionError:
            print(f"  ✗ Connection Error: Check internet connection")
            all_success = False
        
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            all_success = False
        
        print()
    
    # Summary
    print("="*70)
    if all_success:
        print("✓ TEST PASSED - All prices fetched successfully!")
        print("  Your API key works. Stock prices will be real-time.")
    else:
        print("✗ TEST FAILED - Check issues above")
        print("\nTroubleshooting:")
        print("  1. Verify API key in .env file")
        print("  2. Check internet connection")
        print("  3. Wait 60 seconds if rate limit hit")
        print("  4. Get new API key from https://www.alphavantage.co/")
    print("="*70)
    
    return all_success

if __name__ == "__main__":
    # Try to load from .env first
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except:
        pass
    
    test_alpha_vantage_api()
