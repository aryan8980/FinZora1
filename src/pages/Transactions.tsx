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
import { dummyTransactions } from '@/utils/dummyData';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/use-guest-mode';

const buildGuestTransactions = () => dummyTransactions.map((transaction) => ({ ...transaction }));

export default function Transactions() {
  const [search, setSearch] = useState('');
  const isGuestMode = useGuestMode();
  const [transactions, setTransactions] = useState(() =>
    isGuestMode ? buildGuestTransactions() : []
  );
  const { toast } = useToast();

  useEffect(() => {
    setTransactions(isGuestMode ? buildGuestTransactions() : []);
  }, [isGuestMode]);

  const filteredTransactions = transactions.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast({
      title: 'Transaction Deleted',
      description: 'The transaction has been removed',
    });
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
