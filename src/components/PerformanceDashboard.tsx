import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { Investment } from '@/utils/dummyData';
import { motion } from 'framer-motion';

interface PerformanceDashboardProps {
  investments: Investment[];
}

export const PerformanceDashboard = ({ investments }: PerformanceDashboardProps) => {
  // Calculate performance metrics
  const calculateMetrics = (timeframe: 'day' | 'week' | 'month') => {
    let totalProfit = 0;
    let totalValue = 0;
    
    investments.forEach(inv => {
      const profit = (inv.currentPrice - inv.buyPrice) * inv.quantity;
      totalProfit += profit;
      totalValue += inv.currentPrice * inv.quantity;
    });
    
    const profitPercent = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;
    return { totalProfit, profitPercent };
  };

  const dayMetrics = calculateMetrics('day');
  const weekMetrics = calculateMetrics('week');
  const monthMetrics = calculateMetrics('month');

  // Find best and worst performers
  const performanceData = investments.map(inv => {
    const profit = (inv.currentPrice - inv.buyPrice) * inv.quantity;
    const profitPercent = ((inv.currentPrice - inv.buyPrice) / inv.buyPrice) * 100;
    return { ...inv, profit, profitPercent };
  });

  const bestPerformer = performanceData.reduce((best, current) => 
    current.profitPercent > best.profitPercent ? current : best
  , performanceData[0] || { name: 'N/A', profitPercent: 0 });

  const worstPerformer = performanceData.reduce((worst, current) => 
    current.profitPercent < worst.profitPercent ? current : worst
  , performanceData[0] || { name: 'N/A', profitPercent: 0 });

  // Generate mock historical data
  const generateHistoricalData = () => {
    const data = [];
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentPrice * inv.quantity, 0);
    
    for (let i = 30; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * 0.1;
      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: totalValue * (1 + variance),
      });
    }
    return data;
  };

  const historicalData = generateHistoricalData();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card shadow-glass">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="month" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="day">24H</TabsTrigger>
                <TabsTrigger value="week">7D</TabsTrigger>
                <TabsTrigger value="month">30D</TabsTrigger>
              </TabsList>
              <TabsContent value="day" className="space-y-4">
                <MetricCard
                  label="24H Gain/Loss"
                  value={dayMetrics.totalProfit}
                  percent={dayMetrics.profitPercent}
                />
              </TabsContent>
              <TabsContent value="week" className="space-y-4">
                <MetricCard
                  label="7D Gain/Loss"
                  value={weekMetrics.totalProfit}
                  percent={weekMetrics.profitPercent}
                />
              </TabsContent>
              <TabsContent value="month" className="space-y-4">
                <MetricCard
                  label="30D Gain/Loss"
                  value={monthMetrics.totalProfit}
                  percent={monthMetrics.profitPercent}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card shadow-glass">
          <CardHeader>
            <CardTitle>Portfolio Value Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Award className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Performer</p>
                  <p className="text-lg font-semibold">{bestPerformer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-success font-semibold">
                  +{bestPerformer.profitPercent.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Worst Performer</p>
                  <p className="text-lg font-semibold">{worstPerformer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-destructive font-semibold">
                  {worstPerformer.profitPercent.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, percent }: { label: string; value: number; percent: number }) => {
  const isPositive = value >= 0;
  
  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="h-5 w-5 text-success" />
        ) : (
          <TrendingDown className="h-5 w-5 text-destructive" />
        )}
        <div>
          <p className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
            ₹{Math.abs(value).toLocaleString()}
          </p>
          <p className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{percent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};
