import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useGuestMode } from '@/hooks/use-guest-mode';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { loadUserTransactions } from '@/utils/transactionsStorage';
import type { Transaction } from '@/utils/dummyData';
import { SummaryCard } from '@/components/SummaryCard';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { generateFinancialInsights } from '@/utils/insights';
import { generateSmartAlerts } from '@/utils/smartAlerts';
import { SmartAlert } from '@/components/SmartAlert';
import { identifyRecurringTransactions } from '@/utils/subscriptionUtils';

const ChartEmptyState = ({ message }: { message: string }) => (
  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
    {message}
  </div>
);

export default function Dashboard() {
  const isGuestSession = useGuestMode();
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]); // Added for alerts
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (isGuestSession) {
      const local = loadUserTransactions();
      setTransactions([...local]);
      setTimeout(() => setIsLoading(false), 500);
      return;
    }

    if (!user) {
      if (!auth.currentUser) {
        setIsLoading(false);
      }
      setTransactions(loadUserTransactions());
      return;
    }

    // 1. Transactions Listener
    const txQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubTx = onSnapshot(txQuery, (snapshot) => {
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
      setIsLoading(false);
    });

    // 2. Budgets Listener (For Smart Alerts)
    const budgetQuery = query(collection(db, 'users', user.uid, 'budgets'));
    const unsubBudget = onSnapshot(budgetQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBudgets(docs);
    });

    return () => {
      unsubTx();
      unsubBudget();
    };
  }, [isGuestSession, user]);

  const { totalIncome, totalExpenses, totalBalance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses,
    };
  }, [transactions]);

  const computedLineData = useMemo(() => {
    if (!transactions.length) return [] as { month: string; income: number; expense: number }[];

    const byMonth = new Map<string, { income: number; expense: number; order: number }>();

    for (const t of transactions) {
      const d = new Date(t.date);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' });
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
  }, [transactions]);

  const computedPieData = useMemo(() => {
    if (!transactions.length) return [] as { name: string; value: number; color: string }[];

    const byCategory = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      const current = byCategory.get(t.category) ?? 0;
      byCategory.set(t.category || 'Other', current + t.amount);
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
  }, [transactions]);

  // UNIFIED SUMMARY CARDS
  const summaryCards = [
    {
      title: 'Total Balance',
      amount: `₹${totalBalance.toLocaleString()}`,
      icon: Wallet,
      trend: transactions.length
        ? 'Based on your recorded transactions'
        : 'Add your first transaction to see insights',
    },
    {
      title: 'Total Income',
      amount: `₹${totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      trend: transactions.length
        ? 'Sum of all income transactions'
        : 'Connect income sources to populate this chart',
    },
    {
      title: 'Total Expenses',
      amount: `₹${totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      trend: transactions.length
        ? 'Sum of all expense transactions'
        : 'Expenses will appear once you start tracking',
    },
  ];

  const lineData = computedLineData;
  const pieData = computedPieData;

  const insights = useMemo(() => {
    return generateFinancialInsights(transactions);
  }, [transactions]);

  const alerts = useMemo(() => {
    return generateSmartAlerts(transactions, budgets);
  }, [transactions, budgets]);

  const subscriptions = useMemo(() => {
    return identifyRecurringTransactions(transactions);
  }, [transactions]);

  if (isLoading) {
    return (
      <AppLayout showProfile>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout showProfile>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      {/* Smart Alerts */}
      <SmartAlert alerts={alerts} />

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
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

      {/* Line Chart Section */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="glass-card" id="monthly-chart">
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
      </div>

      {/* Charts Row - Bottom */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card h-full" id="category-chart">
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
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={
                  insight.type === 'positive'
                    ? 'p-4 bg-success/10 rounded-lg text-sm text-success-foreground border border-success/20'
                    : insight.type === 'negative'
                      ? 'p-4 bg-destructive/10 rounded-lg text-sm text-destructive border border-destructive/20'
                      : 'p-4 bg-accent/50 rounded-lg text-sm text-muted-foreground border border-border'
                }
              >
                <p>{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
