// Alpha Vantage API for stock prices
// Note: For production, store API keys securely (environment variables or a secret manager)

const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';
// Use Vite env key exposed from .env (must be prefixed with VITE_ to be available in frontend)
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const getStockPrice = async (symbol: string): Promise<StockQuote | null> => {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_API}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await response.json();
    
    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']) * 83, // Convert to INR (approximate)
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
};

export const searchStock = async (keywords: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_API}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${DEMO_API_KEY}`
    );
    const data = await response.json();
    return data.bestMatches || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};
