import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Download, Lightbulb } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { monthlyTrends as guestMonthlyTrends, categoryData as guestCategoryData, type Transaction } from '@/utils/dummyData';
import { useGuestMode } from '@/hooks/use-guest-mode';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { loadUserTransactions } from '@/utils/transactionsStorage';

const savingsTrend = [
  { month: 'Jul', savings: 13000 },
  { month: 'Aug', savings: 13000 },
  { month: 'Sep', savings: 17000 },
  { month: 'Oct', savings: 12000 },
  { month: 'Nov', savings: 16000 },
  { month: 'Dec', savings: 16000 },
];

const ChartEmptyState = ({ message }: { message: string }) => (
  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
    {message}
  </div>
);

export default function Reports() {
  const isGuestMode = useGuestMode();
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions(loadUserTransactions());
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Transaction[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          title: data.title ?? '',
          amount:
            typeof data.amount === 'number'
              ? data.amount
              : Number(data.amount) || 0,
          date: data.date ?? '',
          category: data.category ?? '',
          description: data.description ?? '',
          type: data.type === 'income' ? 'income' : 'expense',
        };
      });

      setTransactions(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const categoryChartData = useMemo(() => {
    if (isGuestMode) return guestCategoryData;
    if (!transactions.length) return [] as { name: string; value: number; color: string }[];

    const byCategory = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      const key = t.category || 'Other';
      byCategory.set(key, (byCategory.get(key) ?? 0) + t.amount);
    }

    const palette = [
      'hsl(217 91% 60%)',
      'hsl(270 67% 57%)',
      'hsl(142 71% 45%)',
      'hsl(217 91% 75%)',
      'hsl(270 67% 75%)',
      'hsl(25 95% 53%)',
    ];

    return Array.from(byCategory.entries()).map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }));
  }, [isGuestMode, transactions]);

  const spendingTrendData = useMemo(() => {
    if (isGuestMode) return guestMonthlyTrends;
    if (!transactions.length) return [] as { month: string; income: number; expense: number }[];

    const byMonth = new Map<string, { income: number; expense: number; order: number }>();

    for (const t of transactions) {
      const d = new Date(t.date);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const current = byMonth.get(key) ?? { income: 0, expense: 0, order: d.getTime() };
      if (t.type === 'income') current.income += t.amount;
      else current.expense += t.amount;
      current.order = Math.min(current.order, d.getTime());
      byMonth.set(key, current);
    }

    return Array.from(byMonth.entries())
      .sort((a, b) => a[1].order - b[1].order)
      .map(([key, value]) => {
        const [year, month] = key.split('-').map(Number);
        const label = new Date(year, month, 1).toLocaleString('default', { month: 'short' });
        return { month: label, income: value.income, expense: value.expense };
      });
  }, [isGuestMode, transactions]);

  const savingsData = useMemo(() => {
    if (isGuestMode) return savingsTrend;
    if (!spendingTrendData.length) return [] as { month: string; savings: number }[];

    return spendingTrendData.map((row) => ({
      month: row.month,
      savings: row.income - row.expense,
    }));
  }, [isGuestMode, spendingTrendData]);

  const insights = useMemo(() => {
    if (isGuestMode) {
      return [
        {
          title: 'Spending is stable across categories',
          description:
            'Your expenses are well-distributed. Consider optimizing subscriptions to increase monthly savings.',
          variant: 'default' as const,
        },
        {
          title: 'Savings rate improving',
          description:
            'Your savings have grown steadily over the last 6 months. Stay consistent to reach long-term goals.',
          variant: 'success' as const,
        },
      ];
    }

    if (!transactions.length) {
      return [
        {
          title: 'Insights unavailable',
          description:
            'Add transactions to unlock AI-powered spending analysis and reports.',
          variant: 'accent' as const,
        },
      ];
    }

    const total = transactions.reduce((sum, t) => sum + t.amount * (t.type === 'income' ? 1 : -1), 0);
    const expenseTotal = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      {
        title: 'Live spending overview',
        description: `You have recorded ${transactions.length} transactions. Net balance impact is ₹${total.toLocaleString()}.`,
        variant: 'default' as const,
      },
      {
        title: 'Expense intensity',
        description: `Total expenses across all categories are ₹${expenseTotal.toLocaleString()}.`,
        variant: 'accent' as const,
      },
    ];
  }, [isGuestMode, transactions]);

  return (
    <div className="min-h-screen">
      <Navbar showProfile />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-between items-center"
          >
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {categoryChartData.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.name}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
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
                    <ChartEmptyState message="Add expenses to visualize category breakdown." />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Monthly Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  {spendingTrendData.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={spendingTrendData}>
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
                        <Legend />
                        <Bar dataKey="income" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="expense" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmptyState message="No monthly data yet. Start tracking income and expenses." />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Savings Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Savings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                  {savingsData.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={savingsData}>
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
                        <Line 
                          type="monotone" 
                          dataKey="savings" 
                          stroke="hsl(var(--success))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--success))', r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmptyState message="Savings trend will appear after you log income and expenses." />
                  )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="glass-card border-primary/50 shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  AI Spending Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight) => {
                  const containerClass =
                    insight.variant === 'success'
                      ? 'bg-success/10'
                      : insight.variant === 'primary'
                        ? 'bg-primary/10'
                        : 'bg-accent/50';
                  const headingClass =
                    insight.variant === 'success'
                      ? 'text-success'
                      : insight.variant === 'primary'
                        ? 'text-primary'
                        : 'text-foreground';
                  const bodyClass =
                    insight.variant === 'success'
                      ? 'text-sm text-success'
                      : insight.variant === 'primary'
                        ? 'text-sm text-primary'
                        : 'text-sm text-muted-foreground';

                  return (
                    <div key={insight.title} className={`p-4 rounded-lg ${containerClass}`}>
                      <h4 className={`font-semibold mb-2 ${headingClass}`}>{insight.title}</h4>
                      <p className={bodyClass}>{insight.description}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
