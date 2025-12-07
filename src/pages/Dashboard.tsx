import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { SummaryCard } from '@/components/SummaryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyTrends, categoryData } from '@/utils/dummyData';
import { motion } from 'framer-motion';
import { useGuestMode } from '@/hooks/use-guest-mode';

const ChartEmptyState = ({ message }: { message: string }) => (
  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
    {message}
  </div>
);

export default function Dashboard() {
  const isGuestSession = useGuestMode();

  const summaryCards = isGuestSession
    ? [
        {
          title: 'Total Balance',
          amount: '₹47,200',
          icon: Wallet,
          trend: '+12% from last month',
        },
        {
          title: 'Total Income',
          amount: '₹50,000',
          icon: TrendingUp,
          trend: '+5% from last month',
        },
        {
          title: 'Total Expenses',
          amount: '₹34,800',
          icon: TrendingDown,
          trend: '-8% from last month',
        },
      ]
    : [
        {
          title: 'Total Balance',
          amount: '₹0',
          icon: Wallet,
          trend: 'Add your first transaction to see insights',
        },
        {
          title: 'Total Income',
          amount: '₹0',
          icon: TrendingUp,
          trend: 'Connect income sources to populate this chart',
        },
        {
          title: 'Total Expenses',
          amount: '₹0',
          icon: TrendingDown,
          trend: 'Expenses will appear once you start tracking',
        },
      ];

  const lineData = isGuestSession ? monthlyTrends : [];
  const pieData = isGuestSession ? categoryData : [];

  const insights = isGuestSession
    ? [
        "📊 You're overspending 15% on Food this month compared to your average. Consider meal planning to reduce expenses.",
        '✨ Great job! Your savings rate increased by 8% this month. Keep up the good work!',
      ]
    : [
        'Once you start logging transactions, FinZora AI will surface personalized insights here.',
        'Connect your accounts or add expenses to unlock smarter recommendations.',
      ];

  return (
    <div className="min-h-screen">
      <Navbar showProfile />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {summaryCards.map((card, index) => (
              <SummaryCard
                key={card.title}
                title={card.title}
                amount={card.amount}
                icon={card.icon}
                trend={card.trend}
                index={index}
              />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {lineData.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} />
                        <Line type="monotone" dataKey="expense" stroke="hsl(var(--secondary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmptyState message="No trends to show yet. Add data or connect accounts to unlock analytics." />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {pieData.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.name}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmptyState message="Expense categories will appear after you log spending." />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="glass-card border-primary/50 shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  AI Financial Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, idx) => (
                  <div
                    key={insight}
                    className={
                      idx % 2 === 0
                        ? 'p-4 bg-accent/50 rounded-lg'
                        : 'p-4 bg-success/10 rounded-lg'
                    }
                  >
                    <p className={idx % 2 === 0 ? 'text-sm' : 'text-sm text-success-foreground'}>
                      {insight}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
