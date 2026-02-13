"""
Stock Service Module
Purpose: Fetch live stock prices and manage stock portfolio logic
Uses: yfinance for real-time stock data (More reliable than free Alpha Vantage)
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StockService:
    """
    Service for stock price management and portfolio calculations.
    Integrates with yfinance for real-time data.
    """
    
    def get_live_price(self, symbol):
        """
        Fetch live stock price for given symbol using yfinance or direct API fallback.
        
        Args: symbol (str) - Stock symbol (e.g., 'AAPL', 'TCS.NS')
        Returns: price (float) or None if API fails
        """
        try:
            symbol = symbol.upper().strip()
            
            # Smart Symbol Lookup
            # If no suffix provided, try base symbol, then .NS (NSE), then .BO (BSE)
            symbols_to_try = [symbol]
            if '.' not in symbol and not symbol.isalpha() is False: # isalpha check to ensure it's a ticker
                symbols_to_try.extend([f"{symbol}.NS", f"{symbol}.BO"])
            
            logger.info(f"🔍 Smart Lookup for '{symbol}'. Trying: {symbols_to_try}")

            for sym in symbols_to_try:
                price = self._get_price_for_symbol(sym)
                if price:
                    logger.info(f"✅ Found price for {sym}: {price}")
                    return price
            
            logger.warning(f"❌ Smart Lookup failed for all variants of {symbol}")
            return None

        except Exception as e:
            logger.error(f"Error in get_live_price for {symbol}: {str(e)}")
            return None

    def _get_price_for_symbol(self, symbol):
        """Helper to try all fetch methods for a single specific symbol string"""
        try:
            # Attempt 1: Finnhub API (Primary - Fast & Reliable)
            price = self.get_finnhub_price(symbol)
            if price:
                 # logger.info(f"  ✓ Finnhub: {price}") # Reduce noise
                 return price

            # Attempt 2: yfinance fast_info
            # logger.info(f"  Trying yfinance for: {symbol}")
            ticker = yf.Ticker(symbol)
            try:
                if hasattr(ticker, 'fast_info'):
                    price = ticker.fast_info.last_price
                    if price:
                        return price
            except:
                pass

            # Attempt 3: yfinance history
            try:
                todays_data = ticker.history(period='1d')
                if not todays_data.empty:
                    price = todays_data['Close'].iloc[-1]
                    return float(price)
            except:
                pass
            
            # Attempt 4: Direct API Request (Fallback)
            try:
                import requests
                url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d"
                headers = {'User-Agent': 'Mozilla/5.0'}
                response = requests.get(url, headers=headers, timeout=3)
                if response.status_code == 200:
                    data = response.json()
                    result = data['chart']['result'][0]
                    meta = result['meta']
                    price = meta['regularMarketPrice']
                    return float(price)
            except:
                pass

            return None
        except Exception as e:
            logger.warning(f"  Error fetching {symbol}: {e}")
            return None

    def get_finnhub_price(self, symbol):
        """Fetch price from Finnhub API"""
        try:
            import os
            import requests
            api_key = os.getenv('FINNHUB_API_KEY')
            if not api_key:
                return None
            
            # Finnhub uses slightly different symbols sometimes, but mostly standard
            url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={api_key}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                # 'c' is current price
                price = data.get('c', 0)
                if price > 0:
                     return float(price)
            return None
        except Exception as e:
            logger.warning(f"⚠ Finnhub fetch failed: {e}")
            return None
    
    def get_stock_details(self, symbol):
        """
        Get detailed information about a stock.
        Args: symbol (str) - Stock symbol
        Returns: dict with price, change percentage, etc.
        """
        try:
            symbol = symbol.upper()
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Calculate change if possible, or just return basic info
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            previous_close = info.get('previousClose') or info.get('regularMarketPreviousClose')
            
            if not current_price:
                 # Try history if info is missing (common with yfinance sometimes)
                 hist = ticker.history(period="2d")
                 if not hist.empty:
                     current_price = hist['Close'].iloc[-1]
                     previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price

            change = 0
            change_percent = 0
            
            if current_price and previous_close:
                change = current_price - previous_close
                if previous_close != 0:
                    change_percent = (change / previous_close) * 100
            
            if current_price:
                 return {
                    'symbol': symbol,
                    'price': float(current_price),
                    'change': float(change),
                    'change_percent': float(change_percent),
                    'timestamp': datetime.now().isoformat()
                }
            
            return None
        
        except Exception as e:
            logger.error(f"Error fetching stock details: {str(e)}")
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
            logger.error(f"Error calculating portfolio metrics: {str(e)}")
            return {}
    
    def validate_symbol(self, symbol):
        """
        Validate if stock symbol exists by fetching its info.
        Args: symbol (str) - Stock symbol
        Returns: bool - True if valid
        """
        try:
            ticker = yf.Ticker(symbol)
            # Fetching history is a cheap way to check validity without downloading full info
            hist = ticker.history(period="1mo")
            return not hist.empty
        except:
            return False
    
    def get_batch_prices(self, symbols):
        """
        Fetch real prices for multiple stocks.
        Returns prices that were successfully fetched from API.
        """
        prices = {}
        # yfinance can handle batch downloading but Ticker approach is simpler for small lists
        # For larger lists, yf.download(symbols) is better
        
        if not symbols:
            return {}

        # Use batch download for efficiency
        try:
            data = yf.download(symbols, period="1d", group_by='ticker', progress=False)
            
            # Handle single symbol case (structure is different)
            if len(symbols) == 1:
                symbol = symbols[0]
                if not data.empty:
                    price = data['Close'].iloc[-1]
                    prices[symbol] = float(price)
            else:
                for symbol in symbols:
                    try:
                        # Check if column exists for this ticker
                        if symbol in data.columns.levels[0]:
                             price = data[symbol]['Close'].iloc[-1]
                             if not pd.isna(price): # check for NaN
                                prices[symbol] = float(price)
                    except:
                        continue
        except Exception as e:
            logger.error(f"Batch download failed, falling back to sequential: {e}")
            # Fallback
            for symbol in symbols:
                p = self.get_live_price(symbol)
                if p:
                    prices[symbol] = p
                    
        return prices
