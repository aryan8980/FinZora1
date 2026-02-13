import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

interface AddSubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    isGuest: boolean;
}

export function AddSubscriptionDialog({ open, onOpenChange, onSuccess, isGuest }: AddSubscriptionDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        date: '',
        frequency: 'monthly',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const subscriptionData = {
                name: formData.name,
                amount: Number(formData.amount),
                frequency: formData.frequency,
                nextDueDate: formData.date, // Store as string for consistency initially
                isManual: true,
                createdAt: new Date().toISOString(),
            };

            if (isGuest) {
                const existing = JSON.parse(localStorage.getItem('finzora_subscriptions') || '[]');
                const newSub = { ...subscriptionData, id: `manual-${Date.now()}` };
                localStorage.setItem('finzora_subscriptions', JSON.stringify([...existing, newSub]));
            } else if (auth.currentUser) {
                await addDoc(collection(db, 'users', auth.currentUser.uid, 'subscriptions'), subscriptionData);
            }

            toast({
                title: 'Subscription Added',
                description: `${formData.name} has been added to your tracker.`,
            });

            setFormData({ name: '', amount: '', date: '', frequency: 'monthly' });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Error adding subscription:', error);
            toast({
                title: 'Error',
                description: 'Failed to add subscription. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Subscription</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Netflix, Gym, etc."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date">Next Due Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select
                            value={formData.frequency}
                            onValueChange={(val) => setFormData({ ...formData, frequency: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Subscription'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
