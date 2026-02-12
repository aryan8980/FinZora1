from stock_service import StockService
import logging
import sys

# Configure logging to see the fallback messages
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

print("Testing StockService.get_live_price with fallback...")
service = StockService()
try:
    price = service.get_live_price("AAPL")
    print(f"Final Price Result: {price}")
except Exception as e:
    print(f"Test Failed: {e}")
