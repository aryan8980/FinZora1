import yfinance as yf
import sys

symbol = "AAPL"
print(f"Testing yfinance for {symbol}...")
try:
    ticker = yf.Ticker(symbol)
    if hasattr(ticker, 'fast_info'):
        price = ticker.fast_info.last_price
        print(f"Fast info price: {price}")
    
    hist = ticker.history(period="1d")
    if not hist.empty:
        print(f"History price: {hist['Close'].iloc[-1]}")
    else:
        print("History empty")
        
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Error: {e}")
