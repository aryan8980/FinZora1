"""
FinZora - AI Financial Management System
Module 4: System Coding - Backend (Flask)
Author: Development Team
Purpose: Main Flask application handling income, expenses, and portfolio management
"""

import os
# Force pure-python implementation of protobuf to fix "Metaclasses with custom tp_new" error in Python 3.14
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from firebase_service import FirebaseService
from ai_categorizer import ExpenseCategorizer
from stock_service import StockService
from crypto_service import CryptoService
from chat_service import ChatService
from budget_service import BudgetService
from validations import validate_transaction, validate_stock_input

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)
# Enable CORS for all origins (restrict in production if needed)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialize services
firebase_service = FirebaseService()
categorizer = ExpenseCategorizer()
stock_service = StockService()
crypto_service = CryptoService()
chat_service = ChatService()
budget_service = BudgetService(firebase_service)

# ============================================================================
# STARTUP VERIFICATION
# ============================================================================

# Check if API key is properly configured
api_key = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')
print("\n" + "="*70)
print("FINZORA BACKEND STARTUP")
print("="*70)
print(f"API Key Status: {api_key[:10]}..." if api_key != 'demo' else "API Key Status: USING DEMO (get real key from https://www.alphavantage.co/)")
print("="*70 + "\n")

if api_key == 'demo':
    print("⚠️  WARNING: Using demo API key - stock prices may not work!")
    print("   To enable real stock prices:")
    print("   1. Get free API key: https://www.alphavantage.co/")
    print("   2. Add to .env: ALPHA_VANTAGE_API_KEY=your_key")
    print("   3. Restart this server\n")
else:
    print(f"✓ API Key configured (first 10 chars: {api_key[:10]})\n")

# ============================================================================
# HEALTH CHECK ENDPOINT (no Firebase required)
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify backend is running.
    Used for debugging without requiring Firebase.
    """
    api_key = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')
    return jsonify({
        'success': True,
        'message': 'Backend is running',
        'api_key_configured': api_key != 'demo',
        'firebase_available': firebase_service.db is not None or getattr(firebase_service, 'use_local', False)
    }), 200


# ============================================================================
# INCOME ENDPOINTS
# ============================================================================

@app.route('/api/income/add', methods=['POST'])
def add_income():
    """
    Add income to user's account
    Expected JSON: { amount, source, description, date }
    Returns: { success, message, income_id }
    """
    try:
        data = request.get_json()
        
        # Validate input
        validation = validate_transaction(
            amount=data.get('amount'),
            description=data.get('source'),
            transaction_type='income'
        )
        if not validation['valid']:
            return jsonify({'success': False, 'message': validation['error']}), 400
        
        # Prepare income record
        income_record = {
            'amount': float(data.get('amount')),
            'source': data.get('source', 'Unknown'),
            'description': data.get('description', ''),
            'date': data.get('date', datetime.now().isoformat()),
            'timestamp': datetime.now().isoformat(),
            'type': 'income'
        }
        
        # Save to Firestore
        income_id = firebase_service.add_income(income_record)
        
        return jsonify({
            'success': True,
            'message': 'Income added successfully',
            'income_id': income_id
        }), 201
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/income/list', methods=['GET'])
def get_income():
    """
    Retrieve all income records for the user
    Returns: { success, data: [income_records] }
    """
    try:
        incomes = firebase_service.get_income()
        return jsonify({
            'success': True,
            'data': incomes
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ============================================================================
# EXPENSE ENDPOINTS
# ============================================================================

@app.route('/api/expense/add', methods=['POST'])
def add_expense():
    """
    Add expense with automatic AI-based categorization
    Expected JSON: { amount, merchant, description, date }
    Returns: { success, message, expense_id, category }
    """
    try:
        data = request.get_json()
        
        # Validate input
        validation = validate_transaction(
            amount=data.get('amount'),
            description=data.get('merchant'),
            transaction_type='expense'
        )
        if not validation['valid']:
            return jsonify({'success': False, 'message': validation['error']}), 400
        
        # AI-based categorization
        merchant_name = data.get('merchant', '')
        category = categorizer.categorize(merchant_name)
        
        # Prepare expense record
        expense_record = {
            'amount': float(data.get('amount')),
            'merchant': merchant_name,
            'description': data.get('description', ''),
            'category': category,
            'date': data.get('date', datetime.now().isoformat()),
            'timestamp': datetime.now().isoformat(),
            'type': 'expense'
        }
        
        # Save to Firestore
        expense_id = firebase_service.add_expense(expense_record)
        
        return jsonify({
            'success': True,
            'message': 'Expense added successfully',
            'expense_id': expense_id,
            'category': category
        }), 201
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/expense/list', methods=['GET'])
def get_expenses():
    """
    Retrieve all expenses with optional category filter
    Query params: category (optional)
    Returns: { success, data: [expense_records] }
    """
    try:
        category_filter = request.args.get('category', None)
        expenses = firebase_service.get_expenses(category_filter)
        return jsonify({
            'success': True,
            'data': expenses
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/expense/statistics', methods=['GET'])
def get_expense_statistics():
    """
    Get expense statistics by category
    Returns: { success, data: { category: total_amount, ... } }
    """
    try:
        stats = firebase_service.get_expense_statistics()
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500



# ============================================================================
# BUDGET ENDPOINTS
# ============================================================================

@app.route('/api/budget/set', methods=['POST'])
def set_budget():
    """Set budget for a category"""
    try:
        data = request.get_json()
        category = data.get('category')
        limit = data.get('limit')
        
        if not category or not limit:
            return jsonify({'success': False, 'message': 'Missing category or limit'}), 400
            
        success = budget_service.set_budget(category, limit)
        return jsonify({'success': success, 'message': 'Budget updated'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/budget/list', methods=['GET'])
def get_budgets():
    """Get all budgets"""
    try:
        budgets = budget_service.get_budgets()
        return jsonify({'success': True, 'data': budgets}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ============================================================================
# STOCK PORTFOLIO ENDPOINTS
# ============================================================================

@app.route('/api/stock/add', methods=['POST'])
def add_stock():
    """
    Add stock to portfolio with real live price fetch
    Expected JSON: { symbol, quantity, buy_price, date }
    Returns: { success, message, stock_id, current_price, profit_loss }
    """
    try:
        data = request.get_json()
        symbol = data.get('symbol', '').upper()
        
        print(f"\n{'='*70}")
        print(f"📈 ADDING STOCK: {symbol}")
        print(f"{'='*70}")
        
        # Validate stock input
        validation = validate_stock_input(
            symbol=symbol,
            quantity=data.get('quantity'),
            buy_price=data.get('buy_price')
        )
        if not validation['valid']:
            print(f"❌ Validation failed: {validation['error']}\n")
            return jsonify({'success': False, 'message': validation['error']}), 400
        
        print(f"✓ Input validation passed")
        print(f"  Symbol: {symbol}")
        print(f"  Quantity: {data.get('quantity')}")
        print(f"  Buy Price: {data.get('buy_price')}")
        
        # Fetch REAL current stock price (ALWAYS try, even if Firebase will fail)
        print(f"🔍 Fetching REAL price for {symbol}...")
        try:
            current_price = stock_service.get_live_price(symbol)
            print(f"✓ Real price fetched: ${current_price}")
            
            if not current_price:
                print(f"❌ No price returned from API\n")
                return jsonify({
                    'success': False,
                    'message': f"Could not fetch real price for {symbol}. Check your API key."
                }), 400
        except Exception as e:
            print(f"❌ Error fetching price: {str(e)}\n")
            return jsonify({
                'success': False,
                'message': f"Error fetching stock price: {str(e)}"
            }), 400
        
        # Calculate profit/loss
        buy_price = float(data.get('buy_price'))
        quantity = float(data.get('quantity'))
        profit_loss = (current_price - buy_price) * quantity
        
        print(f"💰 Profit/Loss Calculation:")
        print(f"  Current Price: ${current_price}")
        print(f"  Buy Price: ${buy_price}")
        print(f"  Quantity: {quantity}")
        print(f"  Profit/Loss: ${profit_loss}")
        
        # Prepare stock record
        stock_record = {
            'symbol': symbol,
            'quantity': quantity,
            'buy_price': buy_price,
            'current_price': current_price,
            'profit_loss': profit_loss,
            'date': data.get('date', datetime.now().isoformat()),
            'timestamp': datetime.now().isoformat()
        }
        
        # Save to Firestore
        stock_id = firebase_service.add_stock(stock_record)
        print(f"✓ Stock saved to database: {stock_id}")
        print(f"{'='*70}\n")
        
        return jsonify({
            'success': True,
            'message': 'Stock added successfully with REAL live price',
            'stock_id': stock_id,
            'current_price': current_price,
            'profit_loss': profit_loss
        }), 201
    
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        print(f"{'='*70}\n")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/stock/list', methods=['GET'])
def get_stocks():
    """
    Retrieve user's stock portfolio
    Returns: { success, data: [stocks], total_profit_loss, net_worth }
    """
    try:
        stocks = firebase_service.get_stocks()
        
        # Calculate portfolio metrics
        total_investment = sum(s['buy_price'] * s['quantity'] for s in stocks)
        total_current_value = sum(s['current_price'] * s['quantity'] for s in stocks)
        total_profit_loss = total_current_value - total_investment
        
        return jsonify({
            'success': True,
            'data': stocks,
            'total_profit_loss': round(total_profit_loss, 2),
            'net_worth': round(total_current_value, 2)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/stock/delete/<stock_id>', methods=['DELETE'])
def delete_stock(stock_id):
    """
    Delete stock from portfolio
    """
    try:
        success = firebase_service.delete_stock(stock_id)
        if success:
            return jsonify({'success': True, 'message': 'Stock deleted successfully'}), 200
        else:
            return jsonify({'success': False, 'message': 'Failed to delete stock'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/stock/update-prices', methods=['POST'])
def update_stock_prices():
    """
    Update REAL live prices for all stocks in portfolio
    Fetches current prices from API for each stock
    Returns: { success, message, updated_stocks, failed_stocks }
    """
    try:
        stocks = firebase_service.get_stocks()
        updated_stocks = []
        failed_stocks = []
        
        for stock in stocks:
            try:
                # Fetch REAL live price for each stock
                current_price = stock_service.get_live_price(stock['symbol'])
                
                if current_price:
                    # Calculate new profit/loss with real price
                    profit_loss = (current_price - stock['buy_price']) * stock['quantity']
                    
                    # Update in Firestore
                    firebase_service.update_stock_price(
                        stock['id'],
                        current_price,
                        profit_loss
                    )
                    
                    updated_stocks.append({
                        'symbol': stock['symbol'],
                        'current_price': current_price,
                        'profit_loss': profit_loss
                    })
                else:
                    failed_stocks.append({
                        'symbol': stock['symbol'],
                        'reason': 'Could not fetch real price from API'
                    })
            
            except Exception as e:
                failed_stocks.append({
                    'symbol': stock['symbol'],
                    'reason': str(e)
                })
        
        return jsonify({
            'success': True,
            'message': f'Updated {len(updated_stocks)} stocks with real live prices',
            'updated_stocks': updated_stocks,
            'failed_stocks': failed_stocks if failed_stocks else None
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ============================================================================
# CRYPTO PORTFOLIO ENDPOINTS
# ============================================================================

@app.route('/api/crypto/add', methods=['POST'])
def add_crypto():
    """
    Add crypto to portfolio with real live price fetch
    Expected JSON: { symbol, quantity, buy_price, date }
    """
    try:
        data = request.get_json()
        symbol = data.get('symbol', '').lower() # CoinGecko IDs are usually lowercase
        name = data.get('name', symbol)
        
        # Simple mapping for common symbols if user enters 'BTC' instead of 'bitcoin'
        # In a real app, we would search first. For now, we trust the input or map basics.
        symbol_map = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'sol': 'solana',
            'ada': 'cardano',
            'doge': 'dogecoin',
            'dot': 'polkadot',
            'matic': 'matic-network'
        }
        coin_id = symbol_map.get(symbol, symbol)
        
        # Fetch REAL current price
        try:
            current_price = crypto_service.get_live_price(coin_id)
            if not current_price:
                # If direct ID failed, try searching
                results = crypto_service.search_coin(symbol)
                if results:
                    coin_id = results[0]['id']
                    current_price = crypto_service.get_live_price(coin_id)
            
            if not current_price:
                 return jsonify({
                    'success': False,
                    'message': f"Could not fetch price for {symbol}. Try using the full name (e.g., 'bitcoin')."
                }), 400
                
        except Exception as e:
             return jsonify({
                'success': False,
                'message': f"Error fetching crypto price: {str(e)}"
            }), 400
        
        # Calculate profit/loss
        buy_price = float(data.get('buy_price'))
        quantity = float(data.get('quantity'))
        profit_loss = (current_price - buy_price) * quantity
        
        # Prepare crypto record
        crypto_record = {
            'symbol': symbol.upper(), # Display as uppercase
            'coin_id': coin_id,      # Store actual ID for updates
            'name': name,
            'quantity': quantity,
            'buy_price': buy_price,
            'current_price': current_price,
            'profit_loss': profit_loss,
            'date': data.get('date', datetime.now().isoformat()),
            'timestamp': datetime.now().isoformat(),
            'type': 'crypto'
        }
        
        # Save to Firestore
        doc_id = firebase_service.add_crypto(crypto_record)
        
        return jsonify({
            'success': True,
            'message': 'Crypto added successfully',
            'id': doc_id,
            'current_price': current_price
        }), 201
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/crypto/list', methods=['GET'])
def get_crypto():
    """Retrieve user's crypto portfolio"""
    try:
        cryptos = firebase_service.get_crypto()
        return jsonify({'success': True, 'data': cryptos}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/crypto/update-prices', methods=['POST'])
def update_crypto_prices():
    """Update live prices for all crypto"""
    try:
        cryptos = firebase_service.get_crypto()
        updated = []
        
        for coin in cryptos:
            coin_id = coin.get('coin_id', coin.get('symbol').lower())
            current_price = crypto_service.get_live_price(coin_id)
            
            if current_price:
                profit_loss = (current_price - coin['buy_price']) * coin['quantity']
                firebase_service.update_crypto_price(coin['id'], current_price, profit_loss)
                updated.append({'id': coin['id'], 'price': current_price})
        
        return jsonify({'success': True, 'updated': len(updated)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/crypto/delete/<crypto_id>', methods=['DELETE'])
def delete_crypto(crypto_id):
    """Delete crypto from portfolio"""
    try:
        success = firebase_service.delete_crypto(crypto_id)
        if success:
            return jsonify({'success': True, 'message': 'Crypto deleted successfully'}), 200
        else:
            return jsonify({'success': False, 'message': 'Failed to delete crypto'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ============================================================================
# AI CHAT ENDPOINT
# ============================================================================

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    AI-powered chat endpoint using Google Gemini
    Expected JSON: { message, include_context }
    Returns: { success, response, data_used }
    """
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        include_context = data.get('include_context', True)
        
        if not user_message:
            return jsonify({
                'success': False,
                'message': 'Message is required'
            }), 400
        
        # Gather user's financial data if context is requested
        user_data = None
        if include_context:
            try:
                # Fetch all user data
                expenses_list = []
                income_list = []
                stocks_list = []
                
                # Try to fetch expenses
                try:
                    expenses_list = firebase_service.get_expenses()
                except Exception as e:
                    print(f"Could not fetch expenses: {e}")
                
                # Try to fetch income
                try:
                    income_list = firebase_service.get_income()
                except Exception as e:
                    print(f"Could not fetch income: {e}")
                
                # Try to fetch stocks
                try:
                    stocks_list = firebase_service.get_stocks()
                except Exception as e:
                    print(f"Could not fetch stocks: {e}")
                
                # Format data for chat service (expects 'data' key)
                user_data = {
                    'expenses': {'data': expenses_list} if expenses_list else None,
                    'income': {'data': income_list} if income_list else None,
                    'portfolio': {
                        'data': stocks_list,
                        'net_worth': sum(s.get('current_price', 0) * s.get('quantity', 0) for s in stocks_list),
                        'total_profit_loss': sum(s.get('profit_loss', 0) for s in stocks_list)
                    } if stocks_list else None
                }
                
                # Only send if we have actual data
                if not any([expenses_list, income_list, stocks_list]):
                    user_data = None
                    
            except Exception as e:
                # If data fetch fails, continue without context
                print(f"Warning: Could not fetch user context: {e}")
                user_data = None
        
        # Generate AI response
        result = chat_service.generate_response(user_message, user_data)
        
        if result.get('error'):
            return jsonify({
                'success': False,
                'message': result['error'],
                'fallback': True
            }), 200
        
        return jsonify({
            'success': True,
            'response': result['response'],
            'data_used': user_data is not None
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Chat error: {str(e)}'
        }), 500


@app.route('/api/chat/prompts', methods=['GET'])
def get_chat_prompts():
    """
    Get suggested quick prompts for chat
    Returns: { success, prompts }
    """
    try:
        prompts = chat_service.get_quick_prompts()
        return jsonify({
            'success': True,
            'prompts': prompts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    
    print("\n" + "="*70)
    print("🚀 FinZora Backend Started Successfully!")
    print("="*70)
    print(f"📡 API Server: http://0.0.0.0:{port}")
    print("   Stock API: Alpha Vantage (configured)" if os.getenv('ALPHA_VANTAGE_API_KEY') != 'demo' else "   Stock API: Demo mode (configure API key in .env)")
    print("   Firebase: " + ("configured" if os.path.exists('credentials.json') else "missing credentials.json"))
    print("="*70 + "\n")
    
    app.run(debug=debug, port=port, host='0.0.0.0')
