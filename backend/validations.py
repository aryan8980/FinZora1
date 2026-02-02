"""
Input Validation Module
Purpose: Validate user inputs for transactions and stocks
Handles: Empty inputs, negative values, invalid data types
"""

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


def validate_transaction(amount, description, transaction_type='expense'):
    """
    Validate income or expense transaction input.
    Args:
        amount (float/str) - Transaction amount
        description (str) - Merchant or source name
        transaction_type (str) - 'income' or 'expense'
    
    Returns: dict - { valid: bool, error: str or None }
    """
    try:
        # Validate amount
        if not amount:
            return {
                'valid': False,
                'error': f'{transaction_type.capitalize()} amount is required'
            }
        
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return {
                'valid': False,
                'error': f'{transaction_type.capitalize()} amount must be a valid number'
            }
        
        # Check for negative or zero amount
        if amount <= 0:
            return {
                'valid': False,
                'error': f'{transaction_type.capitalize()} amount must be greater than zero'
            }
        
        # Check maximum limit (e.g., 10 million)
        if amount > 10000000:
            return {
                'valid': False,
                'error': f'{transaction_type.capitalize()} amount exceeds maximum limit'
            }
        
        # Validate description
        if not description or not description.strip():
            return {
                'valid': False,
                'error': f'{transaction_type.capitalize()} {
                    "merchant" if transaction_type == "expense" else "source"
                } is required'
            }
        
        # Check description length (max 100 chars)
        if len(description) > 100:
            return {
                'valid': False,
                'error': 'Description is too long (max 100 characters)'
            }
        
        # Validation passed
        return {'valid': True, 'error': None}
    
    except Exception as e:
        return {
            'valid': False,
            'error': f'Validation error: {str(e)}'
        }


def validate_stock_input(symbol, quantity, buy_price):
    """
    Validate stock portfolio input.
    Args:
        symbol (str) - Stock symbol (e.g., 'AAPL')
        quantity (int/str) - Number of shares
        buy_price (float/str) - Purchase price per share
    
    Returns: dict - { valid: bool, error: str or None }
    """
    try:
        # Validate symbol
        if not symbol or not symbol.strip():
            return {
                'valid': False,
                'error': 'Stock symbol is required'
            }
        
        symbol = symbol.upper().strip()
        
        # Check symbol format (2-5 characters, alphanumeric)
        if not symbol.replace('.', '').isalnum() or len(symbol) < 1 or len(symbol) > 10:
            return {
                'valid': False,
                'error': 'Invalid stock symbol format'
            }
        
        # Validate quantity
        if not quantity:
            return {
                'valid': False,
                'error': 'Stock quantity is required'
            }
        
        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return {
                'valid': False,
                'error': 'Stock quantity must be a whole number'
            }
        
        # Check positive quantity
        if quantity <= 0:
            return {
                'valid': False,
                'error': 'Stock quantity must be greater than zero'
            }
        
        # Check reasonable quantity limit (max 1 million shares)
        if quantity > 1000000:
            return {
                'valid': False,
                'error': 'Stock quantity exceeds reasonable limit'
            }
        
        # Validate buy price
        if not buy_price and buy_price != 0:
            return {
                'valid': False,
                'error': 'Stock buy price is required'
            }
        
        try:
            buy_price = float(buy_price)
        except (ValueError, TypeError):
            return {
                'valid': False,
                'error': 'Stock buy price must be a valid number'
            }
        
        # Check positive price
        if buy_price <= 0:
            return {
                'valid': False,
                'error': 'Stock buy price must be greater than zero'
            }
        
        # Check reasonable price limit
        if buy_price > 100000:
            return {
                'valid': False,
                'error': 'Stock buy price seems unreasonable'
            }
        
        # Validation passed
        return {'valid': True, 'error': None}
    
    except Exception as e:
        return {
            'valid': False,
            'error': f'Validation error: {str(e)}'
        }


def validate_date(date_str):
    """
    Validate date string in ISO format (YYYY-MM-DD).
    Args: date_str (str) - Date string
    Returns: dict - { valid: bool, error: str or None }
    """
    try:
        from datetime import datetime
        
        if not date_str:
            return {'valid': False, 'error': 'Date is required'}
        
        # Try parsing ISO format
        try:
            datetime.fromisoformat(date_str.split('T')[0])
            return {'valid': True, 'error': None}
        except:
            return {'valid': False, 'error': 'Date must be in YYYY-MM-DD format'}
    
    except Exception as e:
        return {'valid': False, 'error': f'Date validation error: {str(e)}'}


def sanitize_input(user_input):
    """
    Sanitize user input to prevent injection attacks.
    Args: user_input (str) - Raw user input
    Returns: str - Sanitized input
    """
    if not isinstance(user_input, str):
        return str(user_input)
    
    # Remove leading/trailing whitespace
    sanitized = user_input.strip()
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", ';', '--', '/*', '*/']
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    
    return sanitized
