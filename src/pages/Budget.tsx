import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Wallet, Target, Download } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    query,
    where
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

const EXPENSE_CATEGORIES = [
    'Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Other'
];

interface Budget {
    id: string; // Document ID (category name)
    category: string;
    limit: number;
}

interface Transaction {
    id: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
}

export default function BudgetPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [limit, setLimit] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // 1. Listen for Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (!firebaseUser) {
                setBudgets([]);
                setTransactions([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Listen for Budgets & Transactions
    useEffect(() => {
        if (!user) return;

        setLoading(true);

        // Fetch Budgets
        const budgetsQuery = query(collection(db, 'users', user.uid, 'budgets'));
        const unsubBudgets = onSnapshot(budgetsQuery, (snapshot) => {
            const fetchedBudgets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Budget[];
            setBudgets(fetchedBudgets);
        }, (error) => {
            console.error("Error fetching budgets:", error);
            toast({ title: "Error", description: "Failed to load budgets.", variant: "destructive" });
        });

        // Fetch Transactions (Active Listening for Real-time updates)
        // Optimization: Fetch all expenses and filter by date on the client side
        // to avoid Firebase composite index requirement error.
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

        const transactionsQuery = query(
            collection(db, 'users', user.uid, 'transactions'),
            where('type', '==', 'expense')
        );

        const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const fetchedTransactions = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter((doc: any) => doc.date >= startOfMonthStr) as Transaction[];

            setTransactions(fetchedTransactions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        });

        return () => {
            unsubBudgets();
            unsubTransactions();
        };
    }, [user]);

    // 3. Calculate Spending Stats
    const spendingStats = useMemo(() => {
        const stats: Record<string, number> = {};
        transactions.forEach(t => {
            // Normalize category matching (case insensitive)
            // But prefer the exact category string from the transaction if it matches a known category
            const cat = t.category || 'Other';
            stats[cat] = (stats[cat] || 0) + Number(t.amount);
        });
        return stats;
    }, [transactions]);

    // 4. Handle Set Budget
    const handleSetBudget = async () => {
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in to set a budget', variant: 'destructive' });
            return;
        }

        if (!selectedCategory || !limit) {
            toast({ title: 'Error', description: 'Please select a category and enter a limit', variant: 'destructive' });
            return;
        }

        const limitAmount = Number(limit);
        if (isNaN(limitAmount) || limitAmount <= 0) {
            toast({ title: 'Error', description: 'Please enter a valid positive number', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            // Use the category name as the document ID to prevent duplicate budgets for the same category
            await setDoc(doc(db, 'users', user.uid, 'budgets', selectedCategory), {
                category: selectedCategory,
                limit: limitAmount,
                updatedAt: new Date()
            });

            toast({ title: 'Success', description: `${selectedCategory} budget updated to ₹${limitAmount}` });
            setLimit('');
            setSelectedCategory('');
        } catch (error) {
            console.error("Error setting budget:", error);
            toast({ title: 'Error', description: 'Failed to save budget.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    // 5. Handle PDF Export
    const handleExportPDF = async () => {
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const html2canvas = (await import('html2canvas')).default;

            const element = document.createElement('div');
            element.style.padding = '20px';
            element.style.fontFamily = 'Arial, sans-serif';
            element.style.backgroundColor = '#ffffff';
            element.style.color = '#000000';

            const title = document.createElement('h1');
            title.textContent = 'Monthly Budget Report';
            title.style.marginBottom = '20px';
            title.style.borderBottom = '2px solid #000';
            title.style.paddingBottom = '10px';
            element.appendChild(title);

            const dateP = document.createElement('p');
            dateP.textContent = `Generated on: ${new Date().toLocaleDateString()}`;
            dateP.style.marginBottom = '20px';
            element.appendChild(dateP);

            // Summary Calculation
            const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
            const totalSpent = budgets.reduce((sum, b) => sum + (spendingStats[b.category] || 0), 0);
            const totalRemaining = totalBudget - totalSpent;

            const summarySection = document.createElement('div');
            summarySection.style.marginBottom = '30px';

            const summaryTitle = document.createElement('h2');
            summaryTitle.textContent = 'Budget Summary';
            summarySection.appendChild(summaryTitle);

            const summaryTable = document.createElement('table');
            summaryTable.style.width = '100%';
            summaryTable.style.borderCollapse = 'collapse';
            summaryTable.style.marginBottom = '20px';

            const summaryData = [
                { label: 'Total Budgeted', value: `₹${totalBudget.toLocaleString()}` },
                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}` },
                { label: 'Remaining', value: `₹${totalRemaining.toLocaleString()}` },
            ];

            summaryData.forEach((row) => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #ddd';
                const td1 = document.createElement('td');
                td1.textContent = row.label;
                td1.style.padding = '8px';
                td1.style.fontWeight = 'bold';
                const td2 = document.createElement('td');
                td2.textContent = row.value;
                td2.style.padding = '8px';
                td2.style.textAlign = 'right';
                tr.appendChild(td1);
                tr.appendChild(td2);
                summaryTable.appendChild(tr);
            });
            summarySection.appendChild(summaryTable);
            element.appendChild(summarySection);

            // Capture Budget Grid
            const gridElement = document.getElementById('budget-grid');
            if (gridElement) {
                const canvas = await html2canvas(gridElement, { scale: 2, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');

                const imgSection = document.createElement('div');
                const imgTitle = document.createElement('h2');
                imgTitle.textContent = 'Category Details';
                imgSection.appendChild(imgTitle);

                const img = document.createElement('img');
                img.src = imgData;
                img.style.width = '100%';
                img.style.height = 'auto';
                imgSection.appendChild(img);
                element.appendChild(imgSection);
            }

            const opt = {
                margin: 10,
                filename: `FinZora-Budgets-${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
            };

            html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({ title: 'Error', description: 'Failed to generate PDF.', variant: 'destructive' });
        }
    };

    return (
        <AppLayout showProfile>
            <main className="flex-1 space-y-6">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold mb-2 gradients-text">Monthly Budgets</h1>
                        <p className="text-muted-foreground">Set spending limits and track your progress.</p>
                    </div>
                    <Button variant="outline" onClick={handleExportPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
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
                        <Button onClick={handleSetBudget} disabled={isSaving} className="gradient-primary">
                            {isSaving ? 'Saving...' : 'Set Limit'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {loading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2].map(i => (
                            <Card key={i} className="glass-card h-32 animate-pulse bg-muted/20" />
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6" id="budget-grid">
                        {budgets.length > 0 ? (
                            budgets.map((budget) => {
                                // Calculate spent based on transaction aggregation
                                const spent = spendingStats[budget.category] || 0;
                                const percent = Math.min((spent / budget.limit) * 100, 100);
                                const isOver = spent > budget.limit;

                                return (
                                    <motion.div key={budget.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                            })
                        ) : (
                            <div className="col-span-2 text-center py-10">
                                <p className="text-muted-foreground mb-4">No budgets set yet.</p>
                                <p className="text-sm text-muted-foreground">Add a budget above to start tracking your spending habits!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </AppLayout>
    );
}
