import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertTriangle, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGuestMode } from '@/hooks/use-guest-mode';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore'; // Added getDocs
import { loadUserTransactions } from '@/utils/transactionsStorage';
import type { Transaction } from '@/utils/dummyData';
import { identifyRecurringTransactions, type Subscription } from '@/utils/subscriptionUtils';
import { AddSubscriptionDialog } from '@/components/AddSubscriptionDialog'; // Import new component

export default function Subscriptions() {
    const isGuestSession = useGuestMode();
    const [user, setUser] = useState<User | null>(() => auth.currentUser);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [manualSubscriptions, setManualSubscriptions] = useState<any[]>([]); // New state
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // Dialog state

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Transactions && Manual Subscriptions
    useEffect(() => {
        setIsLoading(true);

        if (isGuestSession) {
            const localTxs = loadUserTransactions();
            const localSubs = JSON.parse(localStorage.getItem('finzora_subscriptions') || '[]');
            setTransactions([...localTxs]);
            setManualSubscriptions(localSubs);
            setTimeout(() => setIsLoading(false), 300);
            return;
        }

        if (!user) {
            if (!auth.currentUser) setIsLoading(false);
            setTransactions(loadUserTransactions());
            return;
        }

        // 1. Transactions Listener
        const txQuery = query(
            collection(db, 'users', user.uid, 'transactions'),
            orderBy('date', 'desc')
        );
        const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
            const docs = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            })) as Transaction[];
            setTransactions(docs);
            setIsLoading(false);
        });

        // 2. Manual Subscriptions Listener
        const subQuery = query(collection(db, 'users', user.uid, 'subscriptions'));
        const unsubscribeSub = onSnapshot(subQuery, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setManualSubscriptions(docs);
        });

        return () => {
            unsubscribeTx();
            unsubscribeSub();
        };
    }, [isGuestSession, user]);

    const subscriptions = useMemo(() => {
        // 1. Get Auto-Detected
        const autoDetected = identifyRecurringTransactions(transactions);

        // 2. Process Manual Subscriptions to match Subscription interface
        const processedManual = manualSubscriptions.map(sub => {
            const nextDue = new Date(sub.nextDueDate);
            const today = new Date();
            const diffTime = nextDue.getTime() - today.getTime();
            const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let status: Subscription['status'] = 'due';
            if (daysUntilDue < 0) status = 'overdue';
            // Simple logic: if due date is > 30 days away, it's 'paid' for this month? 
            // Or simpler: Manual subs are always 'due' until updated? 
            // For MVP, calculated purely on date.

            return {
                id: sub.id,
                name: sub.name,
                averageAmount: sub.amount,
                frequency: sub.frequency,
                nextDueDate: nextDue,
                status: status,
                daysUntilDue: daysUntilDue
            } as Subscription;
        });

        // 3. Merge (Prefer Manual if names match)
        // Create a map by normalized name
        const mergedMap = new Map<string, Subscription>();

        // Add auto-detected first
        autoDetected.forEach(sub => {
            mergedMap.set(sub.name.toLowerCase().trim(), sub);
        });

        // Overwrite with manual
        processedManual.forEach(sub => {
            mergedMap.set(sub.name.toLowerCase().trim(), sub);
        });

        return Array.from(mergedMap.values()).sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    }, [transactions, manualSubscriptions]);

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.averageAmount, 0);

    return (
        <AppLayout showProfile>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        Subscriptions & Bills
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Track recurring payments automatically detected from your transactions.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 w-[200px]"
                        />
                    </div>

                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Monthly</p>
                                <h2 className="text-2xl font-bold">₹{totalMonthly.toLocaleString()}</h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Subs</p>
                                <h2 className="text-2xl font-bold">{subscriptions.length}</h2>
                            </div>
                            <div className="p-3 bg-secondary/10 rounded-full">
                                <CheckCircle className="h-6 w-6 text-secondary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                                <h2 className="text-2xl font-bold">
                                    {subscriptions.filter(s => s.status === 'due' || s.status === 'overdue').length}
                                </h2>
                            </div>
                            <div className="p-3 bg-amber-500/10 rounded-full">
                                <Clock className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4">
                {filteredSubscriptions.length === 0 ? (
                    <Card className="glass-card p-12 text-center text-muted-foreground">
                        <p>No subscriptions found. Try adding more transactions or add one manually.</p>
                    </Card>
                ) : (
                    filteredSubscriptions.map((sub, index) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="glass-card hover:bg-accent/5 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                    p-3 rounded-full 
                                    ${sub.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                                                sub.status === 'due' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-green-500/10 text-green-500'}
                                `}>
                                            {sub.status === 'paid' ? <CheckCircle className="h-5 w-5" /> :
                                                sub.status === 'overdue' ? <AlertTriangle className="h-5 w-5" /> :
                                                    <Clock className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{sub.name}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                {sub.frequency} • Next due: {sub.nextDueDate.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">₹{sub.averageAmount.toLocaleString()}</p>
                                        <p className={`text-sm font-medium ${sub.daysUntilDue < 0 ? 'text-destructive' :
                                                sub.daysUntilDue <= 5 ? 'text-amber-500' : 'text-muted-foreground'
                                            }`}>
                                            {sub.status === 'overdue'
                                                ? `Overdue by ${Math.abs(sub.daysUntilDue)} days`
                                                : sub.status === 'due'
                                                    ? `Due in ${sub.daysUntilDue} days`
                                                    : 'Paid'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            <AddSubscriptionDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={() => { }} // Snapshot listener will update automatically
                isGuest={isGuestSession} // Pass the boolean result of the hook
            />
        </AppLayout>
    );
}
