import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Image, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { categorizeTransaction } from '@/utils/categorizeAI';
import { API_BASE_URL } from '@/services/api';
import { appendUserTransaction } from '@/utils/transactionsStorage';
import type { Transaction } from '@/utils/dummyData';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
  onSnapshot
} from 'firebase/firestore';

export default function AddTransaction() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  // Data State
  const [goals, setGoals] = useState<{ id: string; title: string }[]>([]);
  const [budgets, setBudgets] = useState<{ category: string; limit: number }[]>([]);
  const [spendingStats, setSpendingStats] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // UI State
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Fetch Goals
    const goalsQuery = query(collection(db, 'users', user.uid, 'goals'));
    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title })));
    });

    // 2. Fetch Budgets
    const budgetsQuery = query(collection(db, 'users', user.uid, 'budgets'));
    const unsubBudgets = onSnapshot(budgetsQuery, (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({
        category: doc.data().category,
        limit: doc.data().limit
      })));
    });

    // 3. Fetch All Transactions for Income/Expense Balance Check
    const allTransactionsQuery = query(collection(db, 'users', user.uid, 'transactions'));
    const unsubAllTransactions = onSnapshot(allTransactionsQuery, (snapshot) => {
      const txs: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        amount: Number(doc.data().amount),
        date: doc.data().date,
        category: doc.data().category,
        description: doc.data().description,
        type: doc.data().type as 'income' | 'expense'
      }));
      setTransactions(txs);

      // Also calculate spending stats for budget checks
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

      const stats: Record<string, number> = {};
      txs.forEach(tx => {
        if (tx.type === 'expense' && tx.date >= startOfMonthStr) {
          const cat = tx.category || 'Other';
          stats[cat] = (stats[cat] || 0) + tx.amount;
        }
      });
      setSpendingStats(stats);
    });

    return () => {
      unsubGoals();
      unsubBudgets();
      unsubAllTransactions();
    };
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);

    // Auto-detect Income
    const lower = value.toLowerCase();
    if (lower.includes('salary') || lower.includes('paycheck') || lower.includes('dividend')) {
      setType('income');
      setCategory('Income');
      return;
    }

    // Auto-categorize based on title for expenses
    if (value.length > 3) {
      const suggestedCategory = categorizeTransaction(value);
      setCategory(suggestedCategory);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast({
      title: 'Scanning Receipt...',
      description: 'Our AI is extracting the details. This may take a few seconds.',
    });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          // Send to our new backend endpoint using the centralized API_BASE_URL
          const response = await fetch(`${API_BASE_URL}/receipt/scan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_base64: base64String }),
          });

          const data = await response.json();

          if (data.success && data.data) {
            const result = data.data;
            setType('expense');
            if (result.merchant) setTitle(result.merchant);
            if (result.amount) setAmount(result.amount.toString());
            if (result.date) setDate(result.date);
            if (result.category) setCategory(result.category);

            toast({
              title: 'Scan Complete! ✨',
              description: 'We filled in what we could find. Please verify the details.',
            });
          } else {
            throw new Error(data.message || 'Failed to scan receipt');
          }
        } catch (error: any) {
          toast({
            title: 'Scan Failed',
            description: error.message || 'Could not process the receipt image.',
            variant: 'destructive',
          });
        } finally {
          setIsScanning(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsScanning(false);
      toast({
        title: 'Error',
        description: 'Failed to read the file.',
        variant: 'destructive',
      });
    }
  };

  const handleValidation = () => {
    // Basic Validation
    if (!title || !amount || !date || !category) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Income vs Expense Validation - CORE LOGIC CHECK
    if (type === 'expense') {
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const newExpenseAmount = Number(amount);
      const projectedExpenses = totalExpenses + newExpenseAmount;

      // Check if there's no income at all
      if (totalIncome === 0) {
        setWarningMessage(
          `⚠️ WARNING: You have no income recorded yet!||` +
          `You are trying to add an expense of ₹${newExpenseAmount.toLocaleString()} but you haven't recorded any income.||` +
          `It's recommended to add your income first to properly track your finances.||` +
          `Do you still want to continue?`
        );
        setShowWarning(true);
        return;
      }

      // Check if adding this expense would exceed total income
      if (projectedExpenses > totalIncome) {
        setWarningMessage(
          `⚠️ WARNING: This expense will exceed your total income!||` +
          `Total Income: ₹${totalIncome.toLocaleString()}||` +
          `Current Expenses: ₹${totalExpenses.toLocaleString()}||` +
          `New Expense: ₹${newExpenseAmount.toLocaleString()}||` +
          `Projected Total Expenses: ₹${projectedExpenses.toLocaleString()}||` +
          `||` +
          `You will be ₹${(projectedExpenses - totalIncome).toLocaleString()} over your income!||` +
          `||` +
          `Are you sure you want to continue?`
        );
        setShowWarning(true);
        return; // Stop and wait for user confirmation
      }
    }

    // Budget Check Logic
    if (type === 'expense') {
      const budget = budgets.find(b => b.category === category);
      if (budget) {
        const currentSpent = spendingStats[category] || 0;
        const newAmount = Number(amount);
        const projectedTotal = currentSpent + newAmount;

        if (projectedTotal > budget.limit) {
          // If currently under budget but this pushes over
          if (currentSpent <= budget.limit) {
            setWarningMessage(
              `⚠️ Budget Limit Exceeded!||` +
              `Category: ${category}||` +
              `Budget Limit: ₹${budget.limit.toLocaleString()}||` +
              `Current Spending: ₹${currentSpent.toLocaleString()}||` +
              `New Transaction: ₹${newAmount.toLocaleString()}||` +
              `Projected Total: ₹${projectedTotal.toLocaleString()}||` +
              `||` +
              `This will exceed your budget by ₹${(projectedTotal - budget.limit).toLocaleString()}.`
            );
            setShowWarning(true);
            return; // Stop and wait for confirmation
          }
          // If ALREADY over budget
          else {
            setWarningMessage(
              `⚠️ Already Over Budget!||` +
              `Category: ${category}||` +
              `Budget Limit: ₹${budget.limit.toLocaleString()}||` +
              `Current Spending: ₹${currentSpent.toLocaleString()} (Already ₹${(currentSpent - budget.limit).toLocaleString()} over)||` +
              `New Transaction: ₹${newAmount.toLocaleString()}||` +
              `||` +
              `Adding this will increase your deficit further.`
            );
            setShowWarning(true);
            return; // Stop and wait for confirmation
          }
        }
      }
    }

    // If no warning needed, proceed
    handleSubmit();
  };

  const handleSubmit = async () => {
    console.log('AddTransaction: submit clicked');
    toast({
      title: 'Saving transaction...',
      description: 'Please wait while we store your data.',
    });
    setShowWarning(false); // Close dialog if open

    const baseTransaction: Transaction = {
      id:
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto &&
          crypto.randomUUID()) ||
        Date.now().toString(),
      title,
      amount: Number(amount),
      date,
      category,
      description,
      type,
    };

    const user = auth.currentUser;

    try {
      if (!user) {
        appendUserTransaction(baseTransaction);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
          title: baseTransaction.title,
          amount: baseTransaction.amount,
          date: baseTransaction.date,
          category: baseTransaction.category,
          description: baseTransaction.description,
          type: baseTransaction.type,
          createdAt: serverTimestamp(),
        });

        // Update Goals if category matches (either by title or category field)
        try {
          const titleQuery = query(
            collection(db, 'users', user.uid, 'goals'),
            where('title', '==', baseTransaction.category)
          );
          const titleSnapshot = await getDocs(titleQuery);

          const categoryQuery = query(
            collection(db, 'users', user.uid, 'goals'),
            where('category', '==', baseTransaction.category)
          );
          const categorySnapshot = await getDocs(categoryQuery);

          const uniqueDocs = new Map();
          titleSnapshot.docs.forEach(d => uniqueDocs.set(d.id, d));
          categorySnapshot.docs.forEach(d => uniqueDocs.set(d.id, d));

          const docsToUpdate = Array.from(uniqueDocs.values());

          if (docsToUpdate.length > 0) {
            const updatePromises = docsToUpdate.map(goalDoc =>
              updateDoc(doc(db, 'users', user.uid, 'goals', goalDoc.id), {
                current: increment(baseTransaction.amount)
              })
            );
            if (updatePromises.length > 0) {
              await Promise.all(updatePromises);
              toast({
                title: 'Goals Updated!',
                description: `Added ₹${baseTransaction.amount} to ${updatePromises.length} matching goal(s).`,
              });
            }
          }
        } catch (goalError) {
          console.error("Error updating goals:", goalError);
          // Don't fail the transaction if goal update fails
        }

        // 3. Sync with Legacy Collections (Expenses/Income) for Analytics & Budgets
        if (baseTransaction.type === 'expense') {
          await addDoc(collection(db, 'users', user.uid, 'expenses'), {
            merchant: baseTransaction.title, // Map title to merchant
            amount: baseTransaction.amount,
            category: baseTransaction.category,
            date: baseTransaction.date,
            description: baseTransaction.description,
            timestamp: serverTimestamp(),
            type: 'expense'
          });
        } else if (baseTransaction.type === 'income') {
          await addDoc(collection(db, 'users', user.uid, 'income'), {
            source: baseTransaction.title, // Map title to source
            amount: baseTransaction.amount,
            description: baseTransaction.description,
            date: baseTransaction.date,
            timestamp: serverTimestamp(),
            type: 'income'
          });
        }
      }
    } catch (error) {
      console.error('Error adding transaction', error);
      toast({
        title: 'Failed to add transaction',
        description: 'Something went wrong while saving your transaction. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Transaction Added!',
      description: `Successfully added ${type} of ₹${amount}`,
    });

    // Reset form
    setTitle('');
    setAmount('');
    setDate('');
    setCategory('');
    setDescription('');

    // Force strict navigation delay to allow Firestore propagation
    setTimeout(() => {
      // Invalidate queries via simplistic reload if needed, or rely on real-time listeners
      navigate('/transactions');
    }, 1500);
  };

  return (
    <AppLayout showProfile>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="glass-card shadow-glass relative overflow-hidden">
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2 bg-gradient-primary bg-clip-text text-transparent">Analyzing Receipt</h3>
              <p className="text-muted-foreground">Extracting merchant, amount, and date...</p>
            </div>
          )}

          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Add New Transaction</CardTitle>
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleReceiptUpload}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={cameraInputRef}
                onChange={handleReceiptUpload}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                    disabled={isScanning}
                  >
                    <Camera className="w-4 h-4" />
                    Scan Receipt
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => cameraInputRef.current?.click()} className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                    <Image className="w-4 h-4 mr-2" />
                    Upload from Gallery
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleValidation(); // Validation triggers submit or warning
              }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value: 'income' | 'expense') => {
                      setType(value);
                      if (value === 'income') {
                        setCategory('Income');
                      } else {
                        setCategory('');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Starbucks Coffee"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                {type === 'expense' && (
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category {category && <span className="text-primary">(AI Suggested: {category})</span>}
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Bills">Bills</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Friends">Friends</SelectItem>
                        <SelectItem value="Family">Family</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        {goals.length > 0 && (
                          <>
                            <div className="h-px bg-border my-1" />
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Goals</div>
                            {Array.from(new Set(goals.map(g => g.title))).map((title) => (
                              <SelectItem key={`goal-${title}`} value={title}>
                                {title}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button" // Change to button to prevent default submit, handled by onClick
                  className="flex-1 gradient-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleValidation();
                  }}
                >
                  Add Transaction
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Budget Warning ⚠️</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-sm">
                {warningMessage.split('||').map((line, idx) => (
                  <p key={idx} className={line.trim() === '' ? 'h-2' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppLayout>
  );
}
