"""
AI Chat Service - Multiple FREE Cloud Providers
Works for all users on any machine accessing the web app
1. Groq (FREE, Fast, Generous Limits) ← BEST FOR WEB APPS
2. Hugging Face (FREE, Unlimited)
3. Google Gemini (Paid, but if you have key)
"""

import os
import requests
import json
from datetime import datetime

class ChatService:
    def __init__(self):
        """Initialize AI Chat with cloud providers for web app"""
        self.enabled = False
        self.provider = None
        self.model_name = None
        self.api_key = None
        
        # Try cloud providers in order (all FREE for web apps)
        if self.init_groq():
            return
        
        if self.init_huggingface():
            return
        
        if self.init_gemini():
            return
        
        print("⚠️  No AI provider available.")
        print("   For WEB APPS: Get free Groq API key: https://console.groq.com")
        print("   Or use Hugging Face free tier: https://huggingface.co/settings/tokens")
        self.enabled = False
    
    def init_groq(self):
        """Initialize Groq - FREE, Fast, Perfect for Web Apps"""
        try:
            api_key = os.getenv('GROQ_API_KEY', '')
            if not api_key or api_key == 'your_groq_api_key_here' or len(api_key) < 20:
                print("   Groq: No API key found")
                return False

            # Assume availability if an API key is present; errors will be handled on request
            self.provider = 'groq'
            self.api_key = api_key
            self.model_name = 'mixtral-8x7b-32768'
            self.enabled = True
            print("✓ AI Chat enabled (Groq - FREE, Fast, Works Everywhere)")
            print("  Perfect for web apps with multiple users")
            return True
        except Exception as e:
            print(f"   Groq init error: {e}")
            return False
    
    def init_huggingface(self):
        """Initialize Hugging Face - FREE Inference API"""
        try:
            api_key = os.getenv('HUGGINGFACE_API_KEY', '')
            if not api_key or api_key == 'your_huggingface_api_key_here' or len(api_key) < 10:
                return False
            
            self.provider = 'huggingface'
            self.api_key = api_key
            self.model_name = 'mistralai/Mistral-7B-Instruct-v0.1'
            self.enabled = True
            print("✓ AI Chat enabled (Hugging Face - FREE)")
            print("  Works for all users on any machine")
            return True
        except:
            pass
        
        return False
    
    def init_gemini(self):
        """Initialize Google Gemini (paid, but fallback)"""
        try:
            import google.generativeai as genai
            
            api_key = os.getenv('GOOGLE_GEMINI_API_KEY', '')
            if not api_key or api_key == 'your_gemini_api_key_here' or len(api_key) < 20:
                return False
            
            genai.configure(api_key=api_key)
            
            model_options = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash']
            
            for model_name in model_options:
                try:
                    test_model = genai.GenerativeModel(model_name)
                    self.model_name = model_name
                    self.provider = 'gemini'
                    self.api_key = api_key
                    self.enabled = True
                    print(f"✓ AI Chat enabled (Google Gemini - {model_name})")
                    return True
                except:
                    continue
        except:
            pass
        
        return False
    
    def build_context(self, user_data):
        """
        Build context string from user's financial data
        
        Args:
            user_data: dict with keys 'expenses', 'income', 'portfolio'
        
        Returns:
            str: Formatted context for AI
        """
        context = "User's Financial Data:\n\n"
        
        # Add expense data
        if user_data.get('expenses'):
            expenses = user_data['expenses']
            context += f"Expenses: {len(expenses.get('data', []))} transactions\n"
            if expenses.get('data'):
                total = sum(e.get('amount', 0) for e in expenses['data'])
                context += f"Total expenses: ₹{total:.2f}\n"
                
                # Group by category
                categories = {}
                for exp in expenses['data']:
                    cat = exp.get('category', 'Other')
                    categories[cat] = categories.get(cat, 0) + exp.get('amount', 0)
                
                context += "By category:\n"
                for cat, amt in sorted(categories.items(), key=lambda x: x[1], reverse=True):
                    context += f"  - {cat}: ₹{amt:.2f}\n"
        
        # Add income data
        if user_data.get('income'):
            income = user_data['income']
            context += f"\nIncome: {len(income.get('data', []))} records\n"
            if income.get('data'):
                total = sum(i.get('amount', 0) for i in income['data'])
                context += f"Total income: ₹{total:.2f}\n"
        
        # Add portfolio data
        if user_data.get('portfolio'):
            portfolio = user_data['portfolio']
            context += f"\nStock Portfolio:\n"
            context += f"Net Worth: ₹{portfolio.get('net_worth', 0):.2f}\n"
            context += f"Profit/Loss: ₹{portfolio.get('total_profit_loss', 0):.2f}\n"
            
            if portfolio.get('data'):
                context += "Holdings:\n"
                for stock in portfolio['data'][:5]:  # Top 5 holdings
                    context += f"  - {stock.get('symbol')}: {stock.get('quantity')} shares, "
                    context += f"P&L: ₹{stock.get('profit_loss', 0):.2f}\n"
        
        return context
    
    def generate_response(self, user_message, user_data=None):
        """Generate AI response using cloud providers (works for all web users)"""
        if not self.enabled:
            return {
                'response': None,
                'error': '🆓 FREE: Get Groq API key (Free, Fast): https://console.groq.com\nOr Hugging Face: https://huggingface.co/settings/tokens'
            }
        
        try:
            if self.provider == 'groq':
                return self.generate_groq_response(user_message, user_data)
            elif self.provider == 'huggingface':
                return self.generate_huggingface_response(user_message, user_data)
            elif self.provider == 'gemini':
                return self.generate_gemini_response(user_message, user_data)
        except Exception as e:
            error_msg = str(e)
            if "rate" in error_msg.lower() or "quota" in error_msg.lower():
                return {
                    'response': None,
                    'error': f'Rate limited. Try Groq (more generous): https://console.groq.com'
                }
            return {
                'response': None,
                'error': f'Error: {error_msg[:150]}'
            }
        
        return {
            'response': None,
            'error': 'No AI provider available'
        }
    
    def generate_groq_response(self, user_message, user_data=None):
        """Generate response using Groq (FREE, Fast, Perfect for Web Apps)"""
        try:
            system_prompt = """You are FinZora AI, a financial advisor. Answer questions about:
 - Expenses and spending habits
 - Income and salary
 - Stock portfolio and investments
 - Financial advice and budgeting

 Keep answers under 150 words. Use ₹ for amounts."""

            if user_data:
                context = self.build_context(user_data)
                messages = [
                    {'role': 'system', 'content': system_prompt + f"\n\n{context}"},
                    {'role': 'user', 'content': user_message}
                ]
            else:
                messages = [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_message}
                ]

            # Try a small set of well-supported Groq models
            groq_models = [
                self.model_name or 'mixtral-8x7b-32768',
                'llama-3.1-8b-instant',
                'gemma2-9b-it'
            ]

            last_error = None
            for model in groq_models:
                try:
                    response = requests.post(
                        'https://api.groq.com/openai/v1/chat/completions',
                        headers={
                            'Authorization': f'Bearer {self.api_key}',
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        json={
                            'model': model,
                            'messages': messages,
                            'temperature': 0.7,
                            'max_tokens': 500,
                        },
                        timeout=30
                    )

                    if response.status_code == 200:
                        result = response.json()
                        # Persist the working model for next calls
                        self.model_name = model
                        return {
                            'response': result['choices'][0]['message']['content'],
                            'error': None
                        }
                    else:
                        # Capture detailed error text (often JSON)
                        try:
                            err_json = response.json()
                            msg = err_json.get('error', {}).get('message') or err_json.get('message')
                            last_error = f"Groq error {response.status_code}: {msg or response.text[:200]}"
                        except Exception:
                            last_error = f"Groq error {response.status_code}: {response.text[:200]}"
                        # Try next model on 400/404/422
                        if response.status_code in (400, 404, 422):
                            continue
                        else:
                            break
                except requests.exceptions.Timeout:
                    last_error = 'Request timeout with Groq model.'
                    continue

            return {
                'response': None,
                'error': last_error or 'Groq request failed'
            }
        except requests.exceptions.Timeout:
            return {
                'response': None,
                'error': 'Request timeout. Groq servers might be busy. Try again!'
            }
        except Exception as e:
            return {
                'response': None,
                'error': f'Groq error: {str(e)[:200]}'
            }
    
    def generate_huggingface_response(self, user_message, user_data=None):
        """Generate response using Hugging Face (FREE)"""
        try:
            system_prompt = """You are FinZora AI, a financial advisor."""
            
            if user_data:
                context = self.build_context(user_data)
                prompt = f"{system_prompt}\n\n{context}\n\nUser: {user_message}"
            else:
                prompt = f"{system_prompt}\n\nUser: {user_message}"
            
            response = requests.post(
                f"https://api-inference.huggingface.co/models/{self.model_name}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"inputs": prompt},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                text = result[0].get('generated_text', 'No response') if result else 'Error'
                return {
                    'response': text,
                    'error': None
                }
            else:
                return {
                    'response': None,
                    'error': f'HF error: {response.status_code}'
                }
        except Exception as e:
            return {
                'response': None,
                'error': f'HF error: {str(e)[:100]}'
            }
    
    def generate_gemini_response(self, user_message, user_data=None):
        """Generate response using Google Gemini (Paid)"""
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model_name)
            
            system_prompt = """You are FinZora AI, a financial advisor."""
            
            if user_data:
                context = self.build_context(user_data)
                full_prompt = f"{system_prompt}\n\n{context}\n\nUser: {user_message}"
            else:
                full_prompt = f"{system_prompt}\n\nUser: {user_message}"
            
            response = model.generate_content(full_prompt)
            
            return {
                'response': response.text,
                'error': None
            }
        except Exception as e:
            error_msg = str(e)
            return {
                'response': None,
                'error': f'Gemini error: {error_msg[:100]}'
            }
    
    def get_quick_prompts(self):
        """Return suggested quick prompts for user"""
        return [
            "Show my expense breakdown",
            "What's my total income?",
            "Portfolio profit/loss?",
            "Give me financial advice",
            "How can I save more money?",
            "What are my top expenses?"
        ]
