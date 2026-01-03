import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { PriceAlerts } from '@/components/PriceAlerts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { dummyInvestments, Investment } from '@/utils/dummyData';
import { PlusCircle, TrendingUp, TrendingDown, Edit, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getCryptoPrice, getMultipleCryptoPrices } from '@/utils/cryptoApi';
import { getStockPrice } from '@/utils/stockApi';
import { useGuestMode } from '@/hooks/use-guest-mode';

const cloneGuestInvestments = () => dummyInvestments.map((investment) => ({ ...investment }));
const EmptyStateCard = ({ message }: { message: string }) => (
  <Card className="glass-card shadow-glass">
    <CardContent className="p-8 text-center text-muted-foreground text-sm">
      {message}
    </CardContent>
  </Card>
);

export default function Investments() {
  const isGuestMode = useGuestMode();
  const [investments, setInvestments] = useState<Investment[]>(() =>
    isGuestMode ? cloneGuestInvestments() : []
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Auto-refresh prices every 5 minutes
  useEffect(() => {
    if (!investments.length) return;
    refreshPrices();
    const interval = setInterval(refreshPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [investments.length]);

  useEffect(() => {
    setInvestments(isGuestMode ? cloneGuestInvestments() : []);
  }, [isGuestMode]);

  const refreshPrices = async () => {
    if (!investments.length) {
      toast({
        title: 'No investments to refresh',
        description: 'Add holdings to track live prices.',
      });
      return;
    }

    setIsRefreshing(true);
    try {
      const updatedInvestments = await Promise.all(
        investments.map(async (inv) => {
          if (inv.type === 'crypto') {
            // Map common symbols to CoinGecko IDs
            const coinIdMap: Record<string, string> = {
              BTC: 'bitcoin',
              ETH: 'ethereum',
              SOL: 'solana',
              ADA: 'cardano',
            };
            const coinId = coinIdMap[inv.symbol];
            if (coinId) {
              const priceData = await getCryptoPrice(coinId);
              if (priceData) {
                return { ...inv, currentPrice: priceData.current_price };
              }
            }
          } else if (inv.type === 'stock') {
            const priceData = await getStockPrice(inv.symbol);
            if (priceData) {
              return { ...inv, currentPrice: priceData.price };
            }
          }
          return inv;
        })
      );
      setInvestments(updatedInvestments);
      toast({ title: 'Prices updated successfully!' });
    } catch (error) {
      console.error('Error refreshing prices:', error);
      toast({ 
        title: 'Failed to update prices', 
        description: 'Using cached prices',
        variant: 'destructive' 
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    type: 'crypto' as 'crypto' | 'stock',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
  });

  const cryptoInvestments = investments.filter((inv) => inv.type === 'crypto');
  const stockInvestments = investments.filter((inv) => inv.type === 'stock');
  const hasInvestments = investments.length > 0;
  const hasCrypto = cryptoInvestments.length > 0;
  const hasStocks = stockInvestments.length > 0;

  const totalCryptoValue = cryptoInvestments.reduce(
    (sum, inv) => sum + inv.quantity * inv.currentPrice,
    0
  );
  const totalStockValue = stockInvestments.reduce(
    (sum, inv) => sum + inv.quantity * inv.currentPrice,
    0
  );
  const totalPortfolioValue = totalCryptoValue + totalStockValue;

  const portfolioData = [
    { name: 'Crypto', value: totalCryptoValue, color: 'hsl(217 91% 60%)' },
    { name: 'Stocks', value: totalStockValue, color: 'hsl(142 71% 45%)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let currentPriceNumber: number;

    if (formData.type === 'stock') {
      const quote = await getStockPrice(formData.symbol);

      if (quote && typeof quote.price === 'number' && !Number.isNaN(quote.price)) {
        currentPriceNumber = quote.price;
      } else {
        toast({
          title: 'Could not fetch stock price',
          description: 'Using your buy price as the current price for now.',
        });
        currentPriceNumber = parseFloat(formData.buyPrice || '0');
      }
    } else {
      currentPriceNumber = parseFloat(formData.currentPrice || '0');
    }

    if (Number.isNaN(currentPriceNumber)) {
      currentPriceNumber = 0;
    }

    if (editingId) {
      setInvestments(
        investments.map((inv) =>
          inv.id === editingId
            ? {
                ...inv,
                ...formData,
                quantity: parseFloat(formData.quantity),
                buyPrice: parseFloat(formData.buyPrice),
                currentPrice: currentPriceNumber,
              }
            : inv
        )
      );
      toast({ title: 'Investment updated successfully!' });
    } else {
      const newInvestment: Investment = {
        id: Date.now().toString(),
        ...formData,
        quantity: parseFloat(formData.quantity),
        buyPrice: parseFloat(formData.buyPrice),
        currentPrice: currentPriceNumber,
      };
      setInvestments([...investments, newInvestment]);
      toast({ title: 'Investment added successfully!' });
    }

    setFormData({
      name: '',
      symbol: '',
      type: 'crypto',
      quantity: '',
      buyPrice: '',
      currentPrice: '',
    });
    setIsAddOpen(false);
    setEditingId(null);
  };

  const handleEdit = (investment: Investment) => {
    setFormData({
      name: investment.name,
      symbol: investment.symbol,
      type: investment.type,
      quantity: investment.quantity.toString(),
      buyPrice: investment.buyPrice.toString(),
      currentPrice: investment.currentPrice.toString(),
    });
    setEditingId(investment.id);
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    setInvestments(investments.filter((inv) => inv.id !== id));
    toast({ title: 'Investment deleted successfully!' });
  };

  const calculateProfit = (investment: Investment) => {
    const profit = (investment.currentPrice - investment.buyPrice) * investment.quantity;
    const profitPercent = ((investment.currentPrice - investment.buyPrice) / investment.buyPrice) * 100;
    return { profit, profitPercent };
  };

  const InvestmentCard = ({ investment }: { investment: Investment }) => {
    const { profit, profitPercent } = calculateProfit(investment);
    const isProfit = profit >= 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 rounded-xl"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{investment.name}</h3>
            <p className="text-sm text-muted-foreground">{investment.symbol}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(investment)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(investment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-medium">{investment.quantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Buy Price:</span>
            <span className="font-medium">₹{investment.buyPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Price:</span>
            <span className="font-medium">₹{investment.currentPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Current Value:</span>
            <span className="font-semibold">
              ₹{(investment.quantity * investment.currentPrice).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">Profit/Loss:</span>
            <div className="flex items-center gap-1">
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={isProfit ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                ₹{Math.abs(profit).toLocaleString()} ({profitPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  Investment Portfolio
                </h1>
                <p className="text-muted-foreground">Track your crypto and stock investments with live prices</p>
              </div>
              <Button
                onClick={refreshPrices}
                disabled={isRefreshing}
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Prices
              </Button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card shadow-glass">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
                  <p className="text-3xl font-bold">₹{totalPortfolioValue.toLocaleString()}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card shadow-glass">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Crypto Value</p>
                  <p className="text-3xl font-bold">₹{totalCryptoValue.toLocaleString()}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card shadow-glass">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Stock Value</p>
                  <p className="text-3xl font-bold">₹{totalStockValue.toLocaleString()}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Dashboard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            {hasInvestments ? (
              <PerformanceDashboard investments={investments} />
            ) : (
              <EmptyStateCard message="Add investments to unlock performance analytics." />
            )}
          </motion.div>

          {/* Price Alerts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
            {hasInvestments ? (
              <PriceAlerts investments={investments} />
            ) : (
              <EmptyStateCard message="Track at least one holding to set price alerts." />
            )}
          </motion.div>

          {/* Portfolio Distribution Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass-card shadow-glass my-8">
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {hasInvestments ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => {
                          const percent = totalPortfolioValue
                            ? (entry.value / totalPortfolioValue) * 100
                            : 0;
                          return `${entry.name}: ${percent.toFixed(0)}%`;
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    Distribution data appears after you add investments.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Crypto Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="glass-card shadow-glass mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cryptocurrency Holdings</CardTitle>
                <Dialog open={isAddOpen && formData.type === 'crypto'} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setFormData({ ...formData, type: 'crypto' })}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Crypto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit' : 'Add'} Cryptocurrency</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Cryptocurrency Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Bitcoin"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="symbol">Symbol</Label>
                        <Input
                          id="symbol"
                          value={formData.symbol}
                          onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                          placeholder="e.g., BTC"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          step="0.00000001"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="e.g., 0.5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyPrice">Buy Price (₹)</Label>
                        <Input
                          id="buyPrice"
                          type="number"
                          step="0.01"
                          value={formData.buyPrice}
                          onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                          placeholder="e.g., 45000"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentPrice">Current Price (₹)</Label>
                        <Input
                          id="currentPrice"
                          type="number"
                          step="0.01"
                          value={formData.currentPrice}
                          onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                          placeholder="e.g., 52000"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {editingId ? 'Update' : 'Add'} Cryptocurrency
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cryptoInvestments.map((investment) => (
                    <InvestmentCard key={investment.id} investment={investment} />
                  ))}
                  {cryptoInvestments.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No crypto holdings yet. Add your first cryptocurrency!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stock Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card className="glass-card shadow-glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Stock Holdings</CardTitle>
                <Dialog open={isAddOpen && formData.type === 'stock'} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setFormData({ ...formData, type: 'stock' })}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Stock
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit' : 'Add'} Stock</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Apple Inc"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="symbol">Ticker Symbol</Label>
                        <Input
                          id="symbol"
                          value={formData.symbol}
                          onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                          placeholder="e.g., AAPL"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          step="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="e.g., 10"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyPrice">Buy Price (₹)</Label>
                        <Input
                          id="buyPrice"
                          type="number"
                          step="0.01"
                          value={formData.buyPrice}
                          onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                          placeholder="e.g., 175"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {editingId ? 'Update' : 'Add'} Stock
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stockInvestments.map((investment) => (
                    <InvestmentCard key={investment.id} investment={investment} />
                  ))}
                  {stockInvestments.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No stock holdings yet. Add your first stock!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
