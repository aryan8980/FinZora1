
import type { Transaction } from '@/utils/dummyData';

export interface Budget {
    id: string;
    category: string;
    limit: number;
}

// Define Alert Interface if not already defined
export interface SmartAlert {
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    action?: string; // e.g., "Adjust Budget"
    actionLink?: string;
}

export const generateSmartAlerts = (
    transactions: Transaction[],
    budgets: Budget[]
): SmartAlert[] => {
    const alerts: SmartAlert[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 1. Budget Analysis
    budgets.forEach((budget) => {
        // Calculate spending for this budget's category in the current month
        const spent = transactions
            .filter((t) => {
                const d = new Date(t.date);
                return (
                    t.type === 'expense' &&
                    t.category === budget.category &&
                    d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear
                );
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const percentage = (spent / budget.limit) * 100;

        if (percentage >= 100) {
            alerts.push({
                id: `budget-crit-${budget.category}`,
                type: 'critical',
                title: `Budget Exceeded: ${budget.category}`,
                message: `You've spent ₹${spent.toLocaleString()} (100%+) of your ₹${budget.limit.toLocaleString()} limit.`,
                action: 'Review',
                actionLink: '/budget',
            });
        } else if (percentage >= 85) {
            alerts.push({
                id: `budget-warn-${budget.category}`,
                type: 'warning',
                title: `Approaching Limit: ${budget.category}`,
                message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget based on recent data.`,
                action: 'Check',
                actionLink: '/budget',
            });
        }
    });

    // 2. Engagement / Streak Analysis
    // Check unrelated to budget: when was the last transaction?
    if (transactions.length > 0) {
        // Sort descending by date
        const sortedTx = [...transactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastTxDate = new Date(sortedTx[0].date);
        const diffTime = Math.abs(today.getTime() - lastTxDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 3) {
            alerts.push({
                id: 'engagement-missing',
                type: 'info',
                title: 'Missed you!',
                message: `It's been ${diffDays} days since your last recorded transaction. Keep your streak alive!`,
                action: 'Add Now',
                actionLink: '/add-transaction',
            });
        }
    } else {
        // New user case
        alerts.push({
            id: 'welcome-start',
            type: 'info',
            title: 'Start your journey',
            message: 'Add your first transaction to unlock smart insights.',
            action: 'Add First',
            actionLink: '/add-transaction',
        });
    }

    // 3. High Value Transaction Detection (Simple Anomaly)
    const recentTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        // Last 3 days
        return (today.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 3;
    });

    recentTransactions.forEach(t => {
        if (t.type === 'expense' && t.amount > 5000) { // Arbitrary large amount threshold for now
            alerts.push({
                id: `high-tx-${t.id}`,
                type: 'warning',
                title: 'Large Expense Detected',
                message: `You spent ₹${t.amount.toLocaleString()} on ${t.category}. was this planned?`,
            });
        }
    });

    return alerts;
};
