// CoinGecko API for cryptocurrency prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CryptoPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export const searchCrypto = async (query: string): Promise<any[]> => {
  try {
    const response = await fetch(`${COINGECKO_API}/search?query=${query}`);
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error('Error searching crypto:', error);
    return [];
  }
};

export const getCryptoPrice = async (coinId: string): Promise<CryptoPrice | null> => {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=inr&ids=${coinId}`
    );
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return null;
  }
};

export const getMultipleCryptoPrices = async (coinIds: string[]): Promise<Record<string, number>> => {
  try {
    const ids = coinIds.join(',');
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=inr`
    );
    const data = await response.json();
    
    const prices: Record<string, number> = {};
    for (const [coinId, priceData] of Object.entries(data)) {
      prices[coinId] = (priceData as any).inr;
    }
    return prices;
  } catch (error) {
    console.error('Error fetching multiple crypto prices:', error);
    return {};
  }
};
