"""
Crypto Service Module
Purpose: Fetch live cryptocurrency prices
Uses: CoinGecko API (Free tier)
"""

import requests
import time

class CryptoService:
    """
    Service for cryptocurrency price management.
    Integrates with CoinGecko API.
    """
    
    COINGECKO_API = 'https://api.coingecko.com/api/v3'
    
    def get_live_price(self, coin_id):
        """
        Fetch live price for a given coin ID (e.g., 'bitcoin').
        Args: coin_id (str)
        Returns: price (float) or None
        """
        try:
            url = f"{self.COINGECKO_API}/simple/price"
            params = {
                'ids': coin_id,
                'vs_currencies': 'usd' # Storing in USD, frontend can convert or we can store in INR
            }
            # Note: The original code seemed to use INR. Let's stick to INR to match existing patterns if possible, 
            # or USD if that's the standard. The task description implies INR in the frontend ("₹").
            # Let's fetch INR to be consistent with the frontend expectations.
            params['vs_currencies'] = 'inr'
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 429:
                print("⚠️ CoinGecko Rate Limit reached. Waiting...")
                time.sleep(5)
                return self.get_live_price(coin_id)
                
            data = response.json()
            
            if coin_id in data:
                return data[coin_id]['inr']
            
            return None
            
        except Exception as e:
            print(f"Error fetching crypto price for {coin_id}: {e}")
            return None

    def search_coin(self, query):
        """
        Search for a coin by name or symbol to get its ID.
        """
        try:
            url = f"{self.COINGECKO_API}/search"
            response = requests.get(url, params={'query': query}, timeout=10)
            data = response.json()
            return data.get('coins', [])
        except Exception as e:
            print(f"Error searching coin {query}: {e}")
            return []
