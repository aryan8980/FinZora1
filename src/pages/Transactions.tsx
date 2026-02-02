import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { dummyTransactions, type Transaction } from '@/utils/dummyData';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/use-guest-mode';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { loadUserTransactions, saveUserTransactions } from '@/utils/transactionsStorage';

export default function Transactions() {
  const [search, setSearch] = useState('');
  const isGuestMode = useGuestMode();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isGuestMode) {
      const localTransactions = loadUserTransactions();
      setTransactions(localTransactions);
      return;
    }

    if (!user) {
      // Not authenticated: fall back to local transactions only
      const localTransactions = loadUserTransactions();
      setTransactions(localTransactions);
      return;
    }

    // When a user logs in for the first time on this device,
    // migrate any existing local transactions into their Firestore account
    try {
      const localTransactions = loadUserTransactions();
      const migrationFlagKey = `finzora-transactions-migrated-${user.uid}`;

      const hasWindow = typeof window !== 'undefined';
      const alreadyMigrated = hasWindow
        ? window.localStorage.getItem(migrationFlagKey) === 'true'
        : true;

      if (localTransactions.length && !alreadyMigrated) {
        (async () => {
          try {
            await Promise.all(
              localTransactions.map((tx) =>
                addDoc(collection(db, 'users', user.uid, 'transactions'), {
                  title: tx.title,
                  amount: tx.amount,
                  date: tx.date,
                  category: tx.category,
                  description: tx.description,
                  type: tx.type,
                })
              )
            );

            if (hasWindow) {
              window.localStorage.setItem(migrationFlagKey, 'true');
            }
          } catch (error) {
            console.error('Error migrating local transactions to Firestore', error);
          }
        })();
      }
    } catch (error) {
      console.error('Error preparing transaction migration', error);
    }

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userTransactions: Transaction[] = snapshot.docs.map((docSnap) => {
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

      setTransactions(userTransactions);
    });

    return () => unsubscribe();
  }, [isGuestMode, user]);

  const filteredTransactions = transactions.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!user) {
      // Local-only mode: update local storage
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      const updated = loadUserTransactions().filter((t) => t.id !== id);
      saveUserTransactions(updated);
      toast({
        title: 'Transaction Deleted',
        description: 'The transaction has been removed',
      });
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      toast({
        title: 'Transaction Deleted',
        description: 'The transaction has been removed',
      });
    } catch (error) {
      console.error('Error deleting transaction from Firestore', error);
      toast({
        title: 'Failed to delete transaction',
        description: 'Something went wrong while deleting from the cloud. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar showProfile />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="glass-card shadow-glass">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle className="text-2xl">All Transactions</CardTitle>
                  <Button asChild className="gradient-primary">
                    <Link to="/add-transaction">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Link>
                  </Button>
                </div>
                
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length ? (
                        filteredTransactions.map((transaction, index) => (
                          <motion.tr
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-b"
                          >
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{transaction.title}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-accent rounded-full text-xs">
                                {transaction.category}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {transaction.description}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={transaction.type === 'income' ? 'text-success' : 'text-destructive'}>
                                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDelete(transaction.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                            {isGuestMode
                              ? 'No transactions match your search.'
                              : 'No transactions yet. Add one to start tracking your cash flow.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
