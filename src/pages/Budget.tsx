
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const { data: budgets = [], isLoading: isBudgetsLoading, error: budgetsError } = useQuery({
        queryKey: ['budgets'],
        queryFn: async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/budget/list`);
                if (!res.ok) throw new Error('Failed to fetch budgets');
                const data = await res.json();
                return data.success ? data.data : [];
            } catch (error) {
                console.error('Error fetching budgets:', error);
                return [];
            }
        },
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch Actual Spending
    const { data: spending = {}, isLoading: isSpendingLoading, refetch: refetchSpending } = useQuery({
        queryKey: ['expense-stats'],
        queryFn: async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/expense/statistics`);
                if (!res.ok) throw new Error('Failed to fetch spending stats');
                const data = await res.json();
                return data.success ? data.data : {};
            } catch (error) {
                console.error('Error fetching spending stats:', error);
                return {};
            }
        },
        retry: 2,
        staleTime: 0, // Always consider data stale to ensure fresh data
        refetchInterval: 5000, // Refetch every 5 seconds
    });

    // Set Budget Mutation
    const mutation = useMutation({
        mutationFn: async (newBudget: { category: string, limit: number }) => {
            const res = await fetch(`${API_BASE_URL}/budget/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBudget),
            });
            if (!res.ok) throw new Error('Failed to set budget');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
            toast({ title: 'Success', description: 'Budget limit updated!' });
            setLimit('');
            setSelectedCategory('');
        },
        onError: (error) => {
            console.error('Budget error:', error);
            toast({ title: 'Error', description: 'Failed to update budget', variant: 'destructive' });
        }
    });

    const handleSetBudget = () => {
        if (!selectedCategory || !limit) {
            toast({ title: 'Error', description: 'Please select a category and enter a limit', variant: 'destructive' });
            return;
        }
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
                        <CardContent className="flex gap-4 items-end flex-wrap">
                            <div className="flex-1 min-w-[200px] space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 min-w-[200px] space-y-2">
                                <label className="text-sm font-medium">Limit (₹)</label>
                                <Input type="number" placeholder="5000" value={limit} onChange={e => setLimit(e.target.value)} />
                            </div>
                            <Button onClick={handleSetBudget} disabled={mutation.isPending} className="gradient-primary">
                                {mutation.isPending ? 'Saving...' : 'Set Limit'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Error Message */}
                    {budgetsError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                            Failed to load budgets. Please try refreshing the page.
                        </div>
                    )}

                    {/* Budget List */}
                    {isBudgetsLoading || isSpendingLoading ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Loading budgets...
                        </div>
                    ) : (
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
                    )}

                </main>
            </div>
        </div>
    );
}
