import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_add_stock():
    print("\ntesting Add Stock API...")
    url = f"{BASE_URL}/stock/add"
    payload = {
        "symbol": "AAPL",
        "quantity": 1,
        "buy_price": 150.00,
        "date": "2023-10-27T10:00:00"
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✓ SUCCESS: Stock added successfully")
            return True
        else:
            print("✗ FAILED: Could not add stock")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ FAILED: Could not connect to backend. Is it running on port 5000?")
        return False
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_add_stock()
