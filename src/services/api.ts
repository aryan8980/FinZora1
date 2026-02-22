/**
 * API Service Layer - Frontend
 * Purpose: Handle all HTTP requests to Flask backend
 * Provides: Typed methods for income, expense, and stock operations
 */

// Use environment variable or default to localhost
// Force localhost in development to avoid stale production URL
// @ts-ignore
export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

console.log('🔌 API Service Initialized');
console.log('   Base URL:', API_BASE_URL);

// ============================================================================
// AUTHENTICATION API
// ============================================================================

/**
 * Send OTP to user's email
 * @param email - User's email
 */
export const sendOtp = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP
 * @param email - User's email
 * @param otp - OTP code
 */
export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return await response.json();
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// ============================================================================
// NOTIFICATION & ALERT API
// ============================================================================

/**
 * Save FCM token to backend
 * @param token - Firebase Cloud Messaging token
 */
export const saveFcmToken = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/save-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (!response.ok) throw new Error('Failed to save FCM token');
    return await response.json();
  } catch (error) {
    console.error('Error saving FCM token:', error);
    // Don't throw, as this is non-critical for core app function
  }
};

/**
 * Add price alert
 */
export const addAlert = async (alert: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
    if (!response.ok) throw new Error('Failed to add alert');
    return await response.json();
  } catch (error) {
    console.error('Error adding alert:', error);
    throw error;
  }
};

/**
 * Get all active alerts
 */
export const getAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/list`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

/**
 * Delete alert
 */
export const deleteAlert = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/delete/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete alert');
    return await response.json();
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};

// ============================================================================
// INCOME API
// ============================================================================

// ============================================================================
// INCOME API
// ============================================================================

/**
 * Add income to user account
 * @param amount - Income amount
 * @param source - Source of income
 * @param description - Optional description
 * @param date - Transaction date (ISO format)
 */
export const addIncome = async (
  amount: number,
  source: string,
  description: string = '',
  date: string = new Date().toISOString()
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/income/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, source, description, date })
    });

    if (!response.ok) throw new Error('Failed to add income');
    return await response.json();
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }
};

/**
 * Fetch all income records
 */
export const getIncomeList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/income/list`);
    if (!response.ok) throw new Error('Failed to fetch income');
    return await response.json();
  } catch (error) {
    console.error('Error fetching income:', error);
    throw error;
  }
};

// ============================================================================
// EXPENSE API
// ============================================================================

/**
 * Add expense with automatic AI categorization
 * @param amount - Expense amount
 * @param merchant - Merchant/vendor name
 * @param description - Optional description
 * @param date - Transaction date (ISO format)
 */
export const addExpense = async (
  amount: number,
  merchant: string,
  description: string = '',
  date: string = new Date().toISOString()
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/expense/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, merchant, description, date })
    });

    if (!response.ok) throw new Error('Failed to add expense');
    return await response.json();
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

/**
 * Fetch expenses with optional category filter
 * @param category - Optional category to filter by
 */
export const getExpenseList = async (category?: string) => {
  try {
    const url = new URL(`${API_BASE_URL}/expense/list`);
    if (category) url.searchParams.append('category', category);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

/**
 * Get expense statistics by category
 */
export const getExpenseStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/expense/statistics`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

// ============================================================================
// STOCK PORTFOLIO API
// ============================================================================

/**
 * Add stock to portfolio
 * @param symbol - Stock symbol (e.g., 'AAPL')
 * @param quantity - Number of shares
 * @param buyPrice - Purchase price per share
 * @param date - Purchase date (ISO format)
 */
export const addStock = async (
  symbol: string,
  quantity: number,
  buyPrice: number,
  date: string = new Date().toISOString()
) => {
  try {
    console.log(`📤 Adding stock: ${symbol}, Qty: ${quantity}, Price: ${buyPrice}`);
    const response = await fetch(`${API_BASE_URL}/stock/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, quantity, buy_price: buyPrice, date })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('❌ Failed to add stock:', errorData);
      throw new Error(errorData.message || 'Failed to add stock');
    }

    const result = await response.json();
    console.log('✅ Stock added:', result);
    return result;
  } catch (error) {
    console.error('Error adding stock:', error);
    throw error;
  }
};

/**
 * Fetch user's stock portfolio
 */
export const getStockPortfolio = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock/list`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
};

/**
 * Update live prices for all stocks
 */
export const updateStockPrices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock/update-prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to update prices');
    return await response.json();
  } catch (error) {
    console.error('Error updating prices:', error);
    throw error;
  }
};

/**
 * Delete stock from portfolio
 * @param id - Stock ID
 */
export const deleteStock = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock/delete/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete stock');
    return await response.json();
  } catch (error) {
    console.error('Error deleting stock:', error);
    throw error;
  }
};

// ============================================================================
// CRYPTO PORTFOLIO API
// ============================================================================

/**
 * Add crypto to portfolio
 */
export const addCrypto = async (
  symbol: string,
  quantity: number,
  buyPrice: number,
  date: string = new Date().toISOString()
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crypto/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, quantity, buy_price: buyPrice, date })
    });

    if (!response.ok) throw new Error('Failed to add crypto');
    return await response.json();
  } catch (error) {
    console.error('Error adding crypto:', error);
    throw error;
  }
};

/**
 * Fetch user's crypto portfolio
 */
export const getCryptoPortfolio = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/crypto/list`);
    if (!response.ok) throw new Error('Failed to fetch crypto portfolio');
    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto portfolio:', error);
    throw error;
  }
};

/**
 * Update live prices for all crypto
 */
export const updateCryptoPrices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/crypto/update-prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to update crypto prices');
    return await response.json();
  } catch (error) {
    console.error('Error updating crypto prices:', error);
    throw error;
  }
};

/**
 * Delete crypto from portfolio
 * @param id - Crypto ID
 */
export const deleteCrypto = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crypto/delete/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete crypto');
    return await response.json();
  } catch (error) {
    console.error('Error deleting crypto:', error);
    throw error;
  }
};

// ============================================================================
// ERROR HANDLING UTILITY
// ============================================================================

export const handleApiError = (error: any): string => {
  if (error instanceof TypeError) {
    return 'Network error. Please check your connection.';
  }
  return error?.message || 'An error occurred. Please try again.';
};

// ============================================================================
// AI CHAT API
// ============================================================================

/**
 * Send message to AI chatbot
 * @param message - User's message
 * @param includeContext - Whether to include user's financial data
 */
export const sendChatMessage = async (
  message: string,
  includeContext: boolean = true
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, include_context: includeContext })
    });

    if (!response.ok) throw new Error('Failed to send chat message');
    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get suggested chat prompts
 */
export const getChatPrompts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/prompts`);
    if (!response.ok) throw new Error('Failed to fetch prompts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching prompts:', error);
    throw error;
  }
};
