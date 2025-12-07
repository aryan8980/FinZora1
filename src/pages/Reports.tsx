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
import { monthlyTrends, categoryData } from '@/utils/dummyData';
import { useGuestMode } from '@/hooks/use-guest-mode';

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
                  <ChartEmptyState message="Savings insights appear once you start logging income and expenses." />
                )}
              </CardContent>
    : [
        {
          title: 'Insights unavailable',
          description:
            'Connect your accounts or add transactions to unlock AI-powered spending analysis.',
          variant: 'accent',
        },
      ];
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
                  {monthlyTrendData.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyTrendData}>
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
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={savingsTrend}>
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
