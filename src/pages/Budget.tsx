
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Wallet, Target } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EXPENSE_CATEGORIES = [
    'Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Other'
];

interface Budget {
    category: string;
    limit: number;
}

interface ExpenseStat {
    [category: string]: number;
}

export default function BudgetPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [limit, setLimit] = useState<string>('');

    // Fetch Budgets
    const { data: budgets = [] } = useQuery({
        queryKey: ['budgets'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/api/budget/list');
            const data = await res.json();
            return data.success ? data.data : [];
        }
    });

    // Fetch Actual Spending
    const { data: spending = {} } = useQuery({
        queryKey: ['expense-stats'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/api/expense/statistics');
            const data = await res.json();
            return data.success ? data.data : {};
        }
    });

    // Set Budget Mutation
    const mutation = useMutation({
        mutationFn: async (newBudget: { category: string, limit: number }) => {
            const res = await fetch('http://localhost:5000/api/budget/set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBudget),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast({ title: 'Success', description: 'Budget limit updated!' });
            setLimit('');
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to update budget', variant: 'destructive' });
        }
    });

    const handleSetBudget = () => {
        if (!selectedCategory || !limit) return;
        mutation.mutate({ category: selectedCategory, limit: Number(limit) });
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    return (
        <div className="min-h-screen">
            <Navbar showProfile />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 space-y-6">

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold mb-2 gradients-text">Monthly Budgets</h1>
                        <p className="text-muted-foreground mb-6">Set spending limits and track your progress.</p>
                    </motion.div>

                    {/* Set Budget Form */}
                    <Card className="glass-card max-w-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Set New Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-4 items-end">
                            <div className="w-1/3 space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-1/3 space-y-2">
                                <label className="text-sm font-medium">Limit (₹)</label>
                                <Input type="number" placeholder="5000" value={limit} onChange={e => setLimit(e.target.value)} />
                            </div>
                            <Button onClick={handleSetBudget} disabled={mutation.isPending} className="flex-1 gradient-primary">
                                {mutation.isPending ? 'Saving...' : 'Set Limit'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Budget List */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {budgets.map((budget: Budget) => {
                            const spent = spending[budget.category] || 0;
                            const percent = Math.min((spent / budget.limit) * 100, 100);
                            const isOver = spent > budget.limit;

                            return (
                                <motion.div key={budget.category} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <Card className={`glass-card ${isOver ? 'border-red-500/50' : ''}`}>
                                        <CardHeader className="flex flex-row justify-between items-center pb-2">
                                            <CardTitle className="font-medium text-lg">{budget.category}</CardTitle>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Wallet className="h-4 w-4 text-muted-foreground" />
                                                <span className={isOver ? 'text-red-500 font-bold' : ''}>
                                                    ₹{spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Progress value={percent} className={`h-3 ${isOver ? '[&>div]:bg-red-500' : '[&>div]:' + getProgressColor(percent)}`} />
                                            <p className="text-xs text-right mt-2 text-muted-foreground">
                                                {percent.toFixed(1)}% Used
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}


                        {budgets.length === 0 && (
                            <div className="col-span-2 text-center py-10 text-muted-foreground">
                                No budgets set yet. Add one above to start tracking!
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}
