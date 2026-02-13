
import type { Transaction } from './dummyData'; // Centralize types later if needed

export interface Subscription {
    id: string;
    name: string;
    averageAmount: number;
    frequency: 'monthly' | 'weekly' | 'irregular';
    nextDueDate: Date;
    status: 'paid' | 'due' | 'overdue';
    daysUntilDue: number;
}

export const identifyRecurringTransactions = (transactions: Transaction[]): Subscription[] => {
    // 1. Group by normalized title
    const groups: Record<string, Transaction[]> = {};

    transactions.forEach(t => {
        if (t.type !== 'expense') return;
        // Simple normalization: lowercase, remove numbers/dates often found in bank desc
        // e.g., "Netflix #123" -> "netflix"
        const key = t.title.toLowerCase().replace(/[0-9#]/g, '').trim();
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });

    const subscriptions: Subscription[] = [];
    const today = new Date();

    Object.entries(groups).forEach(([name, txs]) => {
        // Need at least 2 occurrences to establish a pattern
        if (txs.length < 2) return;

        // Sort by date desc
        txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Check interval consistency (focus on monthly for now)
        const dates = txs.map(t => new Date(t.date));
        let isMonthly = true;
        const dayOfMonth = dates[0].getDate();

        // Check if subsequent dates are roughly 25-35 days apart
        for (let i = 0; i < dates.length - 1; i++) {
            const diffTime = Math.abs(dates[i].getTime() - dates[i + 1].getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 25 || diffDays > 35) {
                isMonthly = false;
                break;
            }
        }

        if (isMonthly) {
            const amountSum = txs.reduce((sum, t) => sum + t.amount, 0);
            const avgAmount = amountSum / txs.length;

            // Predict next due date
            // Last tx date + 1 month
            const lastTxDate = new Date(txs[0].date);
            const nextDue = new Date(lastTxDate);
            nextDue.setMonth(nextDue.getMonth() + 1);

            // Determine status
            const diffTime = nextDue.getTime() - today.getTime();
            const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If nextDue is in the past (e.g., due yesterday and not paid yet), it's overdue
            // UNLESS we just missed it in our simple logic, but assuming robust data:
            let status: Subscription['status'] = 'due';
            if (daysUntilDue < 0) status = 'overdue';
            // If we found a transaction in the current cycle?
            // Actually, our logic says nextDue is 1 month after LAST transaction.
            // So if last transaction was Feb 15, next is Mar 15.
            // If today is Feb 20, status is 'due' in 23 days. Correct.
            // If today is Mar 16, status is 'overdue' (by 1 day). Correct. 

            // Filter out old cancelled subs?
            // If "overdue" by > 45 days, assume cancelled
            if (daysUntilDue < -45) return;

            subscriptions.push({
                id: `sub-${name}-${Date.now()}`,
                name: txs[0].title, // Use original title of most recent
                averageAmount: avgAmount,
                frequency: 'monthly',
                nextDueDate: nextDue,
                status,
                daysUntilDue
            });
        }
    });

    return subscriptions.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};
