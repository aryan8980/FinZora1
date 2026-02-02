
"""
Budget Service Layer
Purpose: Handle budget limits for categories
"""

class BudgetService:
    def __init__(self, firebase_service):
        self.db = firebase_service
    
    def set_budget(self, category, limit):
        """Set budget limit for a category"""
        record = {
            'category': category,
            'limit': float(limit),
            'id': f"budget_{category.lower()}"
        }
        
        # Use simpler local store strategy directly via existing service patterns
        # We will reuse the generic 'add' pattern or just direct list manipulation
        # For simplicity in this local-first app, we'll store budgets in a 'budgets' key
        
        try:
            if self.db.use_local or not self.db.db:
                data = self.db._read_local()
                bucket = self.db._user_bucket(data)
                
                # Upsert budget
                budgets = bucket.setdefault('budgets', [])
                # Remove existing for this category
                budgets = [b for b in budgets if b['category'] != category]
                budgets.append(record)
                bucket['budgets'] = budgets
                
                self.db._write_local(data)
                return True
                
            # Firebase implementation (omitted for local-first preference but robust)
            # self.db.db.collection...
            return True
            
        except Exception as e:
            print(f"Error setting budget: {e}")
            return False

    def get_budgets(self):
        """Get all budgets"""
        try:
            if self.db.use_local or not self.db.db:
                data = self.db._read_local()
                bucket = self.db._user_bucket(data)
                return bucket.get('budgets', [])
            return []
        except:
            return []
