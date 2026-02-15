"""
Firebase Firestore Service Layer
Purpose: Handle all database operations with Firebase Firestore
Provides: CRUD operations for transactions and stocks
"""

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime
import json
import uuid

class FirebaseService:
    """
    Service layer for Firebase Firestore operations.
    Handles initialization, data persistence, and retrieval.
    """
    
    def __init__(self, credentials_path='credentials.json', user_id='default_user'):
        """
        Initialize Firebase Firestore connection.
        Args:
            credentials_path (str) - Path to Firebase credentials JSON
            user_id (str) - Current user ID for multi-user support
        """
        try:
            self.user_id = user_id
            self.local_path = 'local_store.json'
            self.use_local = False

            # Check if credentials file exists
            import os
            if not os.path.exists(credentials_path):
                print(f"✓ Running in Local Data Mode")
                print(f"  Data will be saved locally to {self.local_path}")
                # Fallback to local JSON store so app still works
                self.db = None
                self.use_local = True
                self._ensure_local_store()
                return
            
            # Initialize Firebase app (if not already initialized)
            if not firebase_admin.get_app():
                cred = credentials.Certificate(credentials_path)
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            print(f"✓ Firebase initialized successfully for user: {user_id}")
            self.use_local = False
        
        except Exception as e:
            print(f"⚠️  Firebase initialization error: {str(e)}")
            print(f"   Stock API testing will still work without Firebase.")
            self.db = None
            self.use_local = True
            self._ensure_local_store()

    # --------------------------------------------------------------------
    # Local store helpers (JSON file)
    # --------------------------------------------------------------------
    def _ensure_local_store(self):
        """Create a minimal local JSON store if missing."""
        try:
            import os
            if not os.path.exists(self.local_path):
                with open(self.local_path, 'w', encoding='utf-8') as f:
                    json.dump({
                        'users': {
                            self.user_id: {
                                'income': [],
                                'expenses': [],
                                'stocks': []
                            }
                        }
                    }, f)
        except Exception as e:
            print(f"Error creating local store: {e}")

    def _read_local(self):
        with open(self.local_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _write_local(self, data):
        with open(self.local_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _user_bucket(self, data):
        users = data.setdefault('users', {})
        user = users.setdefault(self.user_id, {'income': [], 'expenses': [], 'stocks': []})
        return user

    def _new_id(self):
        return uuid.uuid4().hex
    
    # ========================================================================
    # INCOME OPERATIONS
    # ========================================================================
    
    def add_income(self, income_record):
        """
        Add income record to Firestore.
        Args: income_record (dict) - Income details
        Returns: doc_id (str) - Document ID
        """
        try:
            # Add document to user's income collection
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                doc_id = self._new_id()
                record = {**income_record, 'id': doc_id}
                bucket['income'].insert(0, record)
                self._write_local(data)
                return doc_id
            doc_ref = self.db.collection('users').document(self.user_id)\
                      .collection('income').add(income_record)
            return doc_ref[1].id
        except Exception as e:
            print(f"Error adding income: {str(e)}")
            raise
    
    def get_income(self, limit=100):
        """
        Retrieve all income records for user.
        Args: limit (int) - Max records to fetch
        Returns: list of income records with IDs
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                return bucket.get('income', [])[:limit]

            docs = self.db.collection('users').document(self.user_id)\
                   .collection('income').order_by('date', direction=firestore.Query.DESCENDING)\
                   .limit(limit).stream()
            incomes = []
            for doc in docs:
                income = doc.to_dict()
                income['id'] = doc.id
                incomes.append(income)
            return incomes
        except Exception as e:
            print(f"Error retrieving income: {str(e)}")
            return []
    
    def delete_income(self, income_id):
        """
        Delete income record by ID.
        Args: income_id (str) - Document ID
        Returns: success (bool)
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                bucket['income'] = [i for i in bucket.get('income', []) if i.get('id') != income_id]
                self._write_local(data)
                return True

            self.db.collection('users').document(self.user_id)\
               .collection('income').document(income_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting income: {str(e)}")
            return False
    
    # ========================================================================
    # EXPENSE OPERATIONS
    # ========================================================================
    
    def add_expense(self, expense_record):
        """
        Add expense record to Firestore.
        Args: expense_record (dict) - Expense details
        Returns: doc_id (str) - Document ID
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                doc_id = self._new_id()
                record = {**expense_record, 'id': doc_id}
                bucket['expenses'].insert(0, record)
                self._write_local(data)
                return doc_id

            doc_ref = self.db.collection('users').document(self.user_id)\
                      .collection('expenses').add(expense_record)
            return doc_ref[1].id
        except Exception as e:
            print(f"Error adding expense: {str(e)}")
            raise
    
    def get_expenses(self, category=None, limit=100):
        """
        Retrieve expenses with optional category filter.
        Args:
            category (str) - Optional category filter
            limit (int) - Max records to fetch
        Returns: list of expense records with IDs
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                expenses = bucket.get('expenses', [])
                if category:
                    expenses = [e for e in expenses if e.get('category') == category]
                return expenses[:limit]

            query = self.db.collection('users').document(self.user_id)\
                    .collection('expenses')
            if category:
                query = query.where('category', '==', category)
            docs = query.order_by('date', direction=firestore.Query.DESCENDING)\
                   .limit(limit).stream()
            expenses = []
            for doc in docs:
                expense = doc.to_dict()
                expense['id'] = doc.id
                expenses.append(expense)
            return expenses
        except Exception as e:
            print(f"Error retrieving expenses: {str(e)}")
            return []
    
    def get_expense_statistics(self):
        """
        Get expense totals grouped by category.
        Returns: dict - { category: total_amount }
        """
        try:
            expenses = self.get_expenses(limit=1000)
            stats = {}
            
            for expense in expenses:
                category = expense.get('category', 'Uncategorized')
                amount = expense.get('amount', 0)
                
                if category not in stats:
                    stats[category] = 0
                stats[category] += amount
            
            return stats
        except Exception as e:
            print(f"Error calculating statistics: {str(e)}")
            return {}
    
    def delete_expense(self, expense_id):
        """
        Delete expense record by ID.
        Args: expense_id (str) - Document ID
        Returns: success (bool)
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                bucket['expenses'] = [e for e in bucket.get('expenses', []) if e.get('id') != expense_id]
                self._write_local(data)
                return True

            self.db.collection('users').document(self.user_id)\
               .collection('expenses').document(expense_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting expense: {str(e)}")
            return False
    
    # ========================================================================
    # STOCK PORTFOLIO OPERATIONS
    # ========================================================================
    
    def add_stock(self, stock_record):
        """
        Add stock to portfolio.
        Args: stock_record (dict) - Stock details
        Returns: doc_id (str) - Document ID
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                doc_id = self._new_id()
                record = {**stock_record, 'id': doc_id}
                bucket['stocks'].insert(0, record)
                self._write_local(data)
                return doc_id

            doc_ref = self.db.collection('users').document(self.user_id)\
                      .collection('stocks').add(stock_record)
            return doc_ref[1].id
        except Exception as e:
            print(f"Error adding stock: {str(e)}")
            raise
    
    def get_stocks(self, limit=100):
        """
        Retrieve user's stock portfolio.
        Args: limit (int) - Max records to fetch
        Returns: list of stock records with IDs
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                return bucket.get('stocks', [])[:limit]

            docs = self.db.collection('users').document(self.user_id)\
                   .collection('stocks').limit(limit).stream()
            stocks = []
            for doc in docs:
                stock = doc.to_dict()
                stock['id'] = doc.id
                stocks.append(stock)
            return stocks
        except Exception as e:
            print(f"Error retrieving stocks: {str(e)}")
            return []
    
    def update_stock_price(self, stock_id, current_price, profit_loss):
        """
        Update stock with current price and profit/loss.
        Args:
            stock_id (str) - Document ID
            current_price (float) - Current stock price
            profit_loss (float) - Calculated profit/loss
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                updated = []
                for s in bucket.get('stocks', []):
                    if s.get('id') == stock_id:
                        s['current_price'] = current_price
                        s['profit_loss'] = profit_loss
                        s['last_updated'] = datetime.now().isoformat()
                    updated.append(s)
                bucket['stocks'] = updated
                self._write_local(data)
                return

            self.db.collection('users').document(self.user_id)\
               .collection('stocks').document(stock_id).update({
                   'current_price': current_price,
                   'profit_loss': profit_loss,
                   'last_updated': datetime.now().isoformat()
               })
        except Exception as e:
            print(f"Error updating stock: {str(e)}")
            raise
    
    def delete_stock(self, stock_id):
        """
        Remove stock from portfolio.
        Args: stock_id (str) - Document ID
        Returns: success (bool)
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                bucket['stocks'] = [s for s in bucket.get('stocks', []) if s.get('id') != stock_id]
                self._write_local(data)
                return True

            self.db.collection('users').document(self.user_id)\
               .collection('stocks').document(stock_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting stock: {str(e)}")
            return False

    # ========================================================================
    # CRYPTO PORTFOLIO OPERATIONS
    # ========================================================================
    
    def add_crypto(self, crypto_record):
        """
        Add crypto to portfolio.
        Args: crypto_record (dict)
        Returns: doc_id (str)
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                doc_id = self._new_id()
                record = {**crypto_record, 'id': doc_id}
                # Ensure 'crypto' list exists
                if 'crypto' not in bucket:
                    bucket['crypto'] = []
                bucket['crypto'].insert(0, record)
                self._write_local(data)
                return doc_id

            doc_ref = self.db.collection('users').document(self.user_id)\
                      .collection('crypto').add(crypto_record)
            return doc_ref[1].id
        except Exception as e:
            print(f"Error adding crypto: {str(e)}")
            raise
    
    def get_crypto(self, limit=100):
        """
        Retrieve user's crypto portfolio.
        Returns: list of crypto records
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                return bucket.get('crypto', [])[:limit]

            docs = self.db.collection('users').document(self.user_id)\
                   .collection('crypto').limit(limit).stream()
            cryptos = []
            for doc in docs:
                coin = doc.to_dict()
                coin['id'] = doc.id
                cryptos.append(coin)
            return cryptos
        except Exception as e:
            print(f"Error retrieving crypto: {str(e)}")
            return []

    def update_crypto_price(self, crypto_id, current_price, profit_loss):
        """
        Update crypto with current price and profit/loss.
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                updated = []
                # Ensure 'crypto' list exists
                if 'crypto' not in bucket:
                    bucket['crypto'] = []
                    
                for c in bucket.get('crypto', []):
                    if c.get('id') == crypto_id:
                        c['current_price'] = current_price
                        c['profit_loss'] = profit_loss
                        c['last_updated'] = datetime.now().isoformat()
                    updated.append(c)
                bucket['crypto'] = updated
                self._write_local(data)
                return

            self.db.collection('users').document(self.user_id)\
               .collection('crypto').document(crypto_id).update({
                   'current_price': current_price,
                   'profit_loss': profit_loss,
                   'last_updated': datetime.now().isoformat()
               })
        except Exception as e:
            print(f"Error updating crypto: {str(e)}")
            raise

    def delete_crypto(self, crypto_id):
        """
        Remove crypto from portfolio.
        """
        try:
            if self.use_local or not self.db:
                data = self._read_local()
                bucket = self._user_bucket(data)
                bucket['crypto'] = [c for c in bucket.get('crypto', []) if c.get('id') != crypto_id]
                self._write_local(data)
                return True

            self.db.collection('users').document(self.user_id)\
               .collection('crypto').document(crypto_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting crypto: {str(e)}")
            return False


    # ========================================================================
    # NOTIFICATION OPERATIONS
    # ========================================================================

    def save_fcm_token(self, token):
        """
        Save FCM token for the user.
        Args: token (str)
        """
        try:
            if self.use_local or not self.db:
                print(f"Local mode: FCM token would be saved: {token}")
                return True

            # Use set with merge=True to update or create
            self.db.collection('users').document(self.user_id).set({
                'fcm_token': token,
                'last_token_update': datetime.now().isoformat()
            }, merge=True)
            return True
        except Exception as e:
            print(f"Error saving FCM token: {str(e)}")
            return False

    def get_user_fcm_tokens(self, user_id=None):
        """
        Get FCM token for a user.
        """
        target_user = user_id or self.user_id
        try:
            if self.use_local or not self.db:
                return None

            doc = self.db.collection('users').document(target_user).get()
            if doc.exists:
                return doc.to_dict().get('fcm_token')
            return None
        except Exception as e:
            print(f"Error retrieving FCM token: {str(e)}")
            return None

    def add_alert(self, alert_record):
        """
        Add price alert to user.
        Args: alert_record (dict)
        Returns: doc_id (str)
        """
        try:
            if self.use_local or not self.db:
                print("Local mode: Alert saving mocked")
                return "local_alert_id"

            doc_ref = self.db.collection('users').document(self.user_id)\
                      .collection('alerts').add(alert_record)
            return doc_ref[1].id
        except Exception as e:
            print(f"Error adding alert: {str(e)}")
            raise

    def get_alerts(self):
        """
        Retrieve user's active alerts.
        Returns: list of alert records
        """
        try:
            if self.use_local or not self.db:
                return []

            docs = self.db.collection('users').document(self.user_id)\
                   .collection('alerts').stream()
            alerts = []
            for doc in docs:
                alert = doc.to_dict()
                alert['id'] = doc.id
                alerts.append(alert)
            return alerts
        except Exception as e:
            print(f"Error retrieving alerts: {str(e)}")
            return []

    def delete_alert(self, alert_id):
        """
        Delete alert.
        """
        try:
            if self.use_local or not self.db:
                return True

            self.db.collection('users').document(self.user_id)\
               .collection('alerts').document(alert_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting alert: {str(e)}")
            return False
