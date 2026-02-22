"""
AI-Based Expense Categorization Module
Purpose: Automatically categorize expenses based on merchant names
Uses: Rule-based logic with ML-ready structure for future enhancement
"""

class ExpenseCategorizer:
    """
    Categorizes expenses into predefined categories based on merchant names.
    Structure is modular and extensible for ML models.
    """
    
    # Knowledge base: Merchant patterns mapped to categories
    CATEGORY_RULES = {
        'Food': [
            'mcdonalds', 'subway', 'pizza', 'burger', 'kfc', 'dominos',
            'starbucks', 'coffee', 'restaurant', 'cafe', 'diner', 'food',
            'pizza hut', 'taco bell', 'chipotle', 'applebees', 'olive garden'
        ],
        'Transport': [
            'uber', 'ola', 'lyft', 'taxi', 'bus', 'train', 'metro',
            'railway', 'gas station', 'petrol', 'fuel', 'parking',
            'transit', 'airline', 'flight', 'airbnb'
        ],
        'Shopping': [
            'amazon', 'flipkart', 'walmart', 'target', 'ebay', 'etsy',
            'mall', 'store', 'shop', 'retail', 'market', 'bestbuy'
        ],
        'Entertainment': [
            'netflix', 'spotify', 'youtube', 'gaming', 'movie', 'cinema',
            'theater', 'concert', 'game', 'playstation', 'xbox', 'steam'
        ],
        'Utilities': [
            'electricity', 'water', 'gas', 'internet', 'phone', 'mobile',
            'bill', 'utility', 'power', 'broadband'
        ],
        'Healthcare': [
            'hospital', 'doctor', 'pharmacy', 'medicine', 'medical',
            'clinic', 'dental', 'health', 'gym', 'fitness'
        ],
        'Education': [
            'school', 'university', 'college', 'course', 'training',
            'education', 'book', 'learning', 'tuition'
        ]
    }
    

    
    def __init__(self):
        """Initialize with Gemini API"""
        import os
        import google.generativeai as genai
        
        self.api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
        self.use_ai = False
        
        if self.api_key and len(self.api_key) > 20:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                self.use_ai = True
                print("✓ AI Categorizer initialized (Gemini)")
            except Exception as e:
                print(f"⚠️ AI Categorizer init failed: {e}")

    def categorize(self, merchant_name):
        """
        Categorize expense using AI, falling back to rules.
        """
        if not merchant_name:
            return 'Uncategorized'
            
        # 1. Try AI first
        if self.use_ai:
            try:
                prompt = (
                    f"Categorize this transaction merchant: '{merchant_name}' "
                    f"into one of these exact categories: "
                    f"{', '.join(self.CATEGORY_RULES.keys())}, Other. "
                    f"Return ONLY the category word."
                )
                response = self.model.generate_content(prompt)
                category = response.text.strip().replace('.', '')
                
                # Check if valid category returned
                if category in self.CATEGORY_RULES:
                    return category
            except Exception as e:
                pass # Fallback silent

        # 2. Fallback to Rule-based logic
        normalized_name = merchant_name.lower().strip()
        
        for category, keywords in self.CATEGORY_RULES.items():
            for keyword in keywords:
                if keyword in normalized_name:
                    return category
        
        return 'Uncategorized'
    
    def get_all_categories(self):
        """
        Get all available expense categories
        Returns: list of category names
        """
        return list(self.CATEGORY_RULES.keys())
    
    def add_custom_rule(self, category, keywords):
        """
        Add custom categorization rules (ML-ready).
        Args:
            category (str) - Category name
            keywords (list) - List of keywords to match
        """
        if category not in self.CATEGORY_RULES:
            self.CATEGORY_RULES[category] = []
        self.CATEGORY_RULES[category].extend([k.lower() for k in keywords])
    
    def bulk_categorize(self, merchant_list):
        """
        Categorize multiple merchants at once.
        Args: merchant_list (list) - List of merchant names
        Returns: dict - { merchant: category }
        """
        results = {}
        for merchant in merchant_list:
            results[merchant] = self.categorize(merchant)
        return results

