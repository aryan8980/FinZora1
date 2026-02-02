"""
Stock Service Module
Purpose: Fetch live stock prices and manage stock portfolio logic
Uses: Alpha Vantage API for real-time stock data
Note: Free API key available at https://www.alphavantage.co/
"""

import requests
from datetime import datetime
import os

class StockService:
    """
    Service for stock price management and portfolio calculations.
    Integrates with Alpha Vantage API for real-time data.
    """
    
    # API Configuration - Get free key from https://www.alphavantage.co/
    # Set via environment variable or directly below
    ALPHA_VANTAGE_KEY = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')
    ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query'
    
    # Retry configuration for API failures
    MAX_RETRIES = 3
    RETRY_DELAY = 1  # seconds
    
    def get_live_price(self, symbol):
        """
        Fetch live stock price for given symbol.
        ALWAYS fetches from real API, no fallback to mock data.
        
        Args: symbol (str) - Stock symbol (e.g., 'AAPL', 'TCS')
        Returns: price (float) or None if API fails
        """
        try:
            symbol = symbol.upper().strip()
            
            # Validate symbol format
            if not symbol or len(symbol) > 10:
                raise ValueError(f"Invalid symbol: {symbol}")
            
            # Fetch from Alpha Vantage API with retry logic
            price = self._fetch_from_alpha_vantage(symbol)
            
            if price:
                print(f"✓ Real price fetched for {symbol}: ${price}")
                return price
            else:
                # Log error but don't use mock data
                print(f"✗ Failed to fetch real price for {symbol}")
                print(f"  Ensure your API key is valid: {self.ALPHA_VANTAGE_KEY}")
                raise Exception(f"Could not fetch real price for {symbol}")
        
        except Exception as e:
            print(f"Error fetching price for {symbol}: {str(e)}")
            raise
    
    def _fetch_from_alpha_vantage(self, symbol):
        """
        Fetch stock price from Alpha Vantage API with retry logic.
        Always tries to get real data.
        
        Args: symbol (str) - Stock symbol
        Returns: price (float) or None if all retries fail
        """
        print(f"\n  📡 Alpha Vantage API Call:")
        print(f"     Symbol: {symbol}")
        print(f"     API Key: {'set' if self.ALPHA_VANTAGE_KEY != 'demo' else '❌ DEMO (not real)'}")
        
        for attempt in range(self.MAX_RETRIES):
            try:
                params = {
                    'function': 'GLOBAL_QUOTE',
                    'symbol': symbol,
                    'apikey': self.ALPHA_VANTAGE_KEY
                }
                
                print(f"     Attempt {attempt + 1}/{self.MAX_RETRIES}...")
                
                # Fetch with timeout
                response = requests.get(
                    self.ALPHA_VANTAGE_URL,
                    params=params,
                    timeout=10
                )
                response.raise_for_status()
                data = response.json()
                
                # Debug: Show full response structure
                print(f"     Response keys: {list(data.keys())}")
                
                # Check for API error messages
                if 'Error Message' in data:
                    raise Exception(f"API Error: {data['Error Message']}")
                
                if 'Note' in data:
                    # API call frequency limit reached
                    print(f"     ⚠️ Rate Limit: {data['Note']}")
                    if attempt < self.MAX_RETRIES - 1:
                        import time
                        time.sleep(self.RETRY_DELAY)
                        continue
                    return None
                
                # Extract price from response
                if 'Global Quote' in data:
                    quote = data['Global Quote']
                    print(f"     Quote data: {quote}")
                    price = quote.get('05. price')
                    
                    if price and price != '':
                        print(f"     ✓ Price found: ${price}")
                        return float(price)
                    else:
                        print(f"     ⚠️ No price in quote data")
                else:
                    print(f"     ⚠️ No 'Global Quote' in response")
                
                # No price data in response, retry
                if attempt < self.MAX_RETRIES - 1:
                    import time
                    print(f"     Retrying...")
                    time.sleep(self.RETRY_DELAY)
                    continue
                
                return None
            
            except requests.exceptions.Timeout:
                print(f"     ⚠️ Timeout on attempt {attempt + 1}/{self.MAX_RETRIES}")
                if attempt < self.MAX_RETRIES - 1:
                    import time
                    time.sleep(self.RETRY_DELAY)
                    continue
                return None
            
            except requests.exceptions.RequestException as e:
                print(f"⚠ Network error on attempt {attempt + 1}: {str(e)}")
                if attempt < self.MAX_RETRIES - 1:
                    import time
                    time.sleep(self.RETRY_DELAY)
                    continue
                return None
            
            except Exception as e:
                print(f"✗ Error fetching from API: {str(e)}")
                if attempt < self.MAX_RETRIES - 1:
                    import time
                    time.sleep(self.RETRY_DELAY)
                    continue
                return None
        
        return None
    
    def get_stock_details(self, symbol):
        """
        Get detailed information about a stock.
        Args: symbol (str) - Stock symbol
        Returns: dict with price, change percentage, etc.
        """
        try:
            symbol = symbol.upper()
            
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol,
                'apikey': self.ALPHA_VANTAGE_KEY
            }
            
            response = requests.get(self.ALPHA_VANTAGE_URL, params=params, timeout=5)
            data = response.json()
            
            if 'Global Quote' in data:
                quote = data['Global Quote']
                return {
                    'symbol': symbol,
                    'price': float(quote.get('05. price', 0)),
                    'change': float(quote.get('09. change', 0)),
                    'change_percent': float(quote.get('10. change percent', '0%').strip('%')),
                    'timestamp': datetime.now().isoformat()
                }
            
            return None
        
        except Exception as e:
            print(f"Error fetching stock details: {str(e)}")
            return None
    
    def calculate_portfolio_metrics(self, stocks):
        """
        Calculate total metrics for stock portfolio.
        Args: stocks (list) - List of stock records
        Returns: dict with total investment, current value, profit/loss
        """
        try:
            total_investment = 0
            total_current_value = 0
            total_profit_loss = 0
            
            for stock in stocks:
                investment = stock['quantity'] * stock['buy_price']
                current_value = stock['quantity'] * stock['current_price']
                
                total_investment += investment
                total_current_value += current_value
                total_profit_loss += (current_value - investment)
            
            return {
                'total_investment': round(total_investment, 2),
                'total_current_value': round(total_current_value, 2),
                'total_profit_loss': round(total_profit_loss, 2),
                'profit_loss_percentage': round(
                    (total_profit_loss / total_investment * 100) if total_investment > 0 else 0,
                    2
                )
            }
        
        except Exception as e:
            print(f"Error calculating portfolio metrics: {str(e)}")
            return {}
    
    def validate_symbol(self, symbol):
        """
        Validate if stock symbol exists by fetching its real price.
        Args: symbol (str) - Stock symbol
        Returns: bool - True if valid and price fetched successfully
        """
        try:
            price = self.get_live_price(symbol)
            return price is not None
        except:
            return False
    
    def get_batch_prices(self, symbols):
        """
        Fetch real prices for multiple stocks.
        Returns prices that were successfully fetched from API.
        
        Args: symbols (list) - List of stock symbols
        Returns: dict - { symbol: price } (only successful fetches)
        """
        prices = {}
        failed_symbols = []
        
        for symbol in symbols:
            try:
                price = self.get_live_price(symbol)
                if price:
                    prices[symbol] = price
            except Exception as e:
                failed_symbols.append(f"{symbol} ({str(e)})")
        
        if failed_symbols:
            print(f"⚠ Failed to fetch prices for: {', '.join(failed_symbols)}")
        
        return prices
