/**
 * Stock Portfolio Management Component
 * Purpose: Manage stock holdings with real-time price updates
 * Features: Add stocks, view portfolio, calculate P&L, net worth
 */

import React, { useState, useEffect } from 'react';
import {
  addStock,
  getStockPortfolio,
  updateStockPrices
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface Stock {
  id: string;
  symbol: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  profit_loss: number;
}

interface PortfolioData {
  data: Stock[];
  total_profit_loss: number;
  net_worth: number;
}

interface FormData {
  symbol: string;
  quantity: string;
  buyPrice: string;
  date: string;
}

interface FormErrors {
  symbol?: string;
  quantity?: string;
  buyPrice?: string;
}

const StockPortfolio: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    symbol: '',
    quantity: '',
    buyPrice: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState('');

  // ========================================================================
  // FETCH PORTFOLIO DATA
  // ========================================================================

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const data = await getStockPortfolio();
      if (data.success) {
        setPortfolio(data);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // VALIDATION LOGIC
  // ========================================================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate symbol
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Stock symbol is required';
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = 'Invalid stock symbol';
    }

    // Validate quantity
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a number';
    } else if (Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than zero';
    }

    // Validate buy price
    if (!formData.buyPrice.trim()) {
      newErrors.buyPrice = 'Buy price is required';
    } else if (isNaN(Number(formData.buyPrice))) {
      newErrors.buyPrice = 'Buy price must be a number';
    } else if (Number(formData.buyPrice) <= 0) {
      newErrors.buyPrice = 'Buy price must be greater than zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await addStock(
        formData.symbol,
        Number(formData.quantity),
        Number(formData.buyPrice),
        formData.date
      );

      if (response.success) {
        // Reset form
        setFormData({
          symbol: '',
          quantity: '',
          buyPrice: '',
          date: new Date().toISOString().split('T')[0]
        });
        setMessage(`Stock added! Current Price: ₹${response.current_price}`);

        // Refresh portfolio
        fetchPortfolio();

        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(response.message || 'Failed to add stock');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePrices = async () => {
    try {
      setLoading(true);
      const response = await updateStockPrices();
      if (response.success) {
        setMessage('Prices updated successfully!');
        fetchPortfolio();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  const calculateInvestment = (stock: Stock): number => {
    return stock.buy_price * stock.quantity;
  };

  const calculateCurrentValue = (stock: Stock): number => {
    return stock.current_price * stock.quantity;
  };

  const getProfitLossColor = (profitLoss: number): string => {
    return profitLoss >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getProfitLossPercent = (stock: Stock): number => {
    const investment = calculateInvestment(stock);
    return investment > 0
      ? ((stock.profit_loss / investment) * 100)
      : 0;
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="w-full space-y-6">
      {/* Add Stock Form */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Stock</h2>

        {message && (
          <Alert className={message.includes('Error') ? 'border-red-400' : 'border-green-400'}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleAddStock} className="grid grid-cols-4 gap-4">
          {/* Symbol Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Symbol <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="symbol"
              placeholder="AAPL"
              value={formData.symbol}
              onChange={handleChange}
              className={errors.symbol ? 'border-red-500' : ''}
            />
            {errors.symbol && (
              <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="quantity"
              placeholder="10"
              value={formData.quantity}
              onChange={handleChange}
              className={errors.quantity ? 'border-red-500' : ''}
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Buy Price Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Buy Price <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="buyPrice"
              placeholder="150.25"
              value={formData.buyPrice}
              onChange={handleChange}
              step="0.01"
              className={errors.buyPrice ? 'border-red-500' : ''}
            />
            {errors.buyPrice && (
              <p className="text-red-500 text-xs mt-1">{errors.buyPrice}</p>
            )}
          </div>

          {/* Date & Button */}
          <div className="flex flex-col">
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mb-2"
            />
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Adding...' : 'Add Stock'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Portfolio Summary */}
      {portfolio && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Portfolio Summary</h2>
            <Button
              onClick={handleUpdatePrices}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Updating...' : 'Update Prices'}
            </Button>
          </div>

          {/* Portfolio Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Total Investment</p>
              <p className="text-2xl font-bold">
                ₹
                {portfolio.data
                  .reduce((sum, stock) => sum + calculateInvestment(stock), 0)
                  .toFixed(2)}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Net Worth</p>
              <p className="text-2xl font-bold">₹{portfolio.net_worth.toFixed(2)}</p>
            </div>

            <div
              className={`p-4 rounded ${
                portfolio.total_profit_loss >= 0
                  ? 'bg-green-50'
                  : 'bg-red-50'
              }`}
            >
              <p className="text-gray-600 text-sm">Total Profit/Loss</p>
              <p
                className={`text-2xl font-bold ${getProfitLossColor(
                  portfolio.total_profit_loss
                )}`}
              >
                ₹{portfolio.total_profit_loss.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Portfolio Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Buy Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Investment</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Profit/Loss</TableHead>
                <TableHead>Return %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.data.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-bold">{stock.symbol}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>₹{stock.buy_price.toFixed(2)}</TableCell>
                  <TableCell>₹{stock.current_price.toFixed(2)}</TableCell>
                  <TableCell>₹{calculateInvestment(stock).toFixed(2)}</TableCell>
                  <TableCell>₹{calculateCurrentValue(stock).toFixed(2)}</TableCell>
                  <TableCell
                    className={getProfitLossColor(stock.profit_loss)}
                  >
                    ₹{stock.profit_loss.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={getProfitLossColor(stock.profit_loss)}
                  >
                    {getProfitLossPercent(stock).toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {loading && <p className="text-center text-gray-500">Loading...</p>}
    </div>
  );
};

export default StockPortfolio;
