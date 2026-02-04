import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';

const currencies = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

// Fallback rates in case API fails
const fallbackRates: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.83,
  AUD: 0.019,
  CAD: 0.017,
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(fallbackRates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real exchange rates from API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use exchangerate-api.com free tier (no key required)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        
        if (!response.ok) throw new Error('Failed to fetch rates');
        
        const data = await response.json();
        const rates = data.rates;
        
        // Ensure all our currencies are in the rates
        const completeRates: Record<string, number> = {
          INR: 1,
          USD: rates.USD || fallbackRates.USD,
          EUR: rates.EUR || fallbackRates.EUR,
          GBP: rates.GBP || fallbackRates.GBP,
          JPY: rates.JPY || fallbackRates.JPY,
          AUD: rates.AUD || fallbackRates.AUD,
          CAD: rates.CAD || fallbackRates.CAD,
        };
        
        setExchangeRates(completeRates);
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError('Using fallback rates');
        setExchangeRates(fallbackRates);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh rates every 30 minutes
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConvert = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return;

    // Convert from source currency to INR first, then to target currency
    const inINR = amountNum / exchangeRates[fromCurrency];
    const converted = inINR * exchangeRates[toCurrency];
    setResult(converted);
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
  };

  return (
    <div className="min-h-screen">
      <Navbar showProfile />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Currency Converter</h1>
              <p className="text-muted-foreground">Convert between different currencies in real-time</p>
            </div>

            <Card className="glass-card shadow-glass">
              <CardHeader>
                <CardTitle>Convert Currency</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSwap}
                    className="mb-0.5"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <Label>To</Label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleConvert} 
                  className="w-full gradient-primary"
                  size="lg"
                >
                  Convert
                </Button>

                {result !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-gradient-primary rounded-lg text-center"
                  >
                    <p className="text-sm text-primary-foreground/80 mb-2">Converted Amount</p>
                    <p className="text-4xl font-bold text-black">
                      {currencies.find((c) => c.code === toCurrency)?.symbol}
                      {result.toFixed(2)}
                    </p>
                  </motion.div>
                )}

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 Exchange rates updated in real-time from exchangerate-api.com
                    {loading && ' (loading...)'}
                    {error && ` (${error})`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Popular Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { from: 'INR', to: 'USD', rate: exchangeRates.USD },
                    { from: 'INR', to: 'EUR', rate: exchangeRates.EUR },
                    { from: 'INR', to: 'GBP', rate: exchangeRates.GBP },
                  ].map((conv) => (
                    <div key={`${conv.from}-${conv.to}`} className="p-3 bg-accent rounded-lg">
                      <p className="text-sm text-muted-foreground">1 {conv.from} =</p>
                      <p className="text-lg font-bold">
                        {conv.rate.toFixed(4)} {conv.to}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
