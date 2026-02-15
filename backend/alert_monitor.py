
"""
Alert Monitor Service
Purpose: Continuously check stock prices and send push notifications for triggered alerts.
"""
import time
import firebase_admin
from firebase_admin import credentials, firestore, messaging
import yfinance as yf
from datetime import datetime
import os

# Initialize Firebase if not already initialized
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate('credentials.json')
        firebase_admin.initialize_app(cred)
except ValueError:
    # App already exists
    pass

db = firestore.client()

def get_live_price(symbol):
    try:
        ticker = yf.Ticker(symbol)
        # Try fast fetch first
        data = ticker.history(period="1d")
        if not data.empty:
            return data['Close'].iloc[-1]
        return None
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None

def send_push_notification(token, title, body):
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            token=token,
        )
        response = messaging.send(message)
        print(f"Successfully sent message: {response}")
        return True
    except Exception as e:
        print(f"Error sending message: {e}")
        return False

def check_alerts():
    print(f"--- Checking Alerts at {datetime.now()} ---")
    
    # 1. Get all users
    users_ref = db.collection('users').stream()
    
    for user_doc in users_ref:
        user_data = user_doc.to_dict()
        user_id = user_doc.id
        fcm_token = user_data.get('fcm_token')
        
        # We process alerts even if no token (maybe for future email logging), 
        # but for now we need token to notify.
        if not fcm_token:
            continue
            
        print(f"Checking alerts for user: {user_id}")
        
        # 2. Get active alerts for this user
        alerts_ref = db.collection('users').document(user_id).collection('alerts').stream()
        
        for alert_doc in alerts_ref:
            alert = alert_doc.to_dict()
            alert_id = alert_doc.id
            
            if alert.get('triggered'):
                continue
                
            symbol = alert.get('symbol')
            if not symbol:
                print(f"Skipping alert {alert_id}: No symbol found")
                continue

            # Fetch current price
            current_price = get_live_price(symbol)
            if not current_price:
                continue

            # Check condition
            should_trigger = False
            message = ""
            
            alert_type = alert.get('type')
            target_value = alert.get('value')
            
            # Use basic logic for 'target' type for now (simplest)
            # Logic from frontend: 
            # target -> if current >= target (if target > buy?) OR current <= target (if target < buy?)
            # Actually frontend says: "if currentPrice >= alert.value" for target.
            # But what if I want to buy when it drops? 
            # The frontend logic seems to assume "target price" is a "Upper Target".
            # Let's stick to frontend logic: 
            # target: current >= value
            
            if alert_type == 'target':
                if current_price >= target_value:
                    should_trigger = True
                    message = f"🚀 {symbol} hit your target of ${target_value}!"
            
            # We can expand for profit/loss if we fetch buy_price from stock list. 
            # For MVP backend monitor, let's stick to simple price target 
            # or we need to look up the investment details.
            
            if should_trigger:
                print(f"!!! TRIGGERING ALERT for {symbol} !!!")
                # Send Push Notification
                success = send_push_notification(fcm_token, "Price Alert", message)
                
                if success:
                    # Mark as triggered in DB
                    db.collection('users').document(user_id)\
                      .collection('alerts').document(alert_id).update({'triggered': True})



if __name__ == "__main__":
    print("Starting Alert Monitor Service...")
    while True:
        # check_alerts() 
        # Placeholder loop until we fix persistence
        time.sleep(60)
