
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { type Subscription } from '@/utils/subscriptionUtils';

interface SubscriptionTrackerProps {
    subscriptions: Subscription[];
}

export function SubscriptionTracker({ subscriptions }: SubscriptionTrackerProps) {
    if (subscriptions.length === 0) {
        return (
            <Card className="glass-card shadow-glass h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        Upcoming Bills
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                        <Calendar className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">No recurring bills detected yet.</p>
                        <p className="text-xs mt-1 opacity-70">We'll identify subscriptions as you add more transactions.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card shadow-glass h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Bills
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {subscriptions.map((sub, index) => (
                    <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`
                p-2 rounded-full 
                ${sub.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                                    sub.status === 'due' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-green-500/10 text-green-500'}
              `}>
                                {sub.status === 'paid' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{sub.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {sub.status === 'overdue'
                                        ? `Overdue by ${Math.abs(sub.daysUntilDue)} days`
                                        : `Due in ${sub.daysUntilDue} days`}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm">₹{sub.averageAmount.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{sub.nextDueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                        </div>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
}
