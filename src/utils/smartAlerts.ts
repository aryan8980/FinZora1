
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

    // 3. High Value Transaction Detection
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    const trailingIncome = transactions
        .filter(t => t.type === 'income' && new Date(t.date) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);

    const highValueThreshold = trailingIncome > 0 ? trailingIncome * 0.20 : 5000;

    const last3Days = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));
    const recentTransactions = transactions.filter(t => new Date(t.date) >= last3Days);

    recentTransactions.forEach(t => {
        if (t.type === 'expense' && t.amount > highValueThreshold && t.amount > 1000) {
            alerts.push({
                id: `high-tx-${t.id}`,
                type: 'warning',
                title: 'Large Expense Detected',
                message: `You spent ₹${t.amount.toLocaleString()} on ${t.category}. Was this planned?`,
                action: 'Review',
                actionLink: '/transactions',
            });
        }
    });

    // 4. Duplicate Charge Detection
    const last7Days = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const recentTx = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= last7Days);
    recentTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const checkedDuplicates = new Set<string>();

    for (let i = 0; i < recentTx.length; i++) {
        for (let j = i + 1; j < recentTx.length; j++) {
            const tx1 = recentTx[i];
            const tx2 = recentTx[j];

            if (tx1.amount === tx2.amount && tx1.category === tx2.category && !checkedDuplicates.has(tx1.id) && !checkedDuplicates.has(tx2.id)) {
                const diffTime = Math.abs(new Date(tx1.date).getTime() - new Date(tx2.date).getTime());
                const diffHours = diffTime / (1000 * 60 * 60);

                if (diffHours <= 48 && tx1.amount > 0) {
                    alerts.push({
                        id: `duplicate-charge-${tx1.id}-${tx2.id}`,
                        type: 'warning',
                        title: 'Potential Duplicate Charge',
                        message: `We noticed two transactions of ₹${tx1.amount.toLocaleString()} for ${tx1.category} within 48 hours.`,
                        action: 'Review',
                        actionLink: '/transactions',
                    });
                    checkedDuplicates.add(tx1.id);
                    checkedDuplicates.add(tx2.id);
                }
            }
        }
    }

    // 5. Anomalous Spending Detection
    const categorySpending7Days = new Map<string, number>();
    const categorySpending30Days = new Map<string, number>();

    transactions.filter(t => t.type === 'expense').forEach(t => {
        const txDate = new Date(t.date);
        if (txDate >= last7Days && txDate <= today) {
            categorySpending7Days.set(t.category, (categorySpending7Days.get(t.category) || 0) + t.amount);
        }
        if (txDate >= thirtyDaysAgo && txDate <= today) {
            categorySpending30Days.set(t.category, (categorySpending30Days.get(t.category) || 0) + t.amount);
        }
    });

    categorySpending7Days.forEach((spent7Days, category) => {
        const spent30Days = categorySpending30Days.get(category) || 0;
        const weeklyAverageObj = spent30Days / 4;

        if (spent7Days > 500 && spent7Days > weeklyAverageObj * 1.5 && weeklyAverageObj > 0) {
            alerts.push({
                id: `anomaly-spending-${category}`,
                type: 'warning',
                title: 'Spending Spike Detected',
                message: `You've spent ₹${spent7Days.toLocaleString()} on ${category} this week, visually higher than your usual.`,
                action: 'Check Budget',
                actionLink: '/budget',
            });
        }
    });

    return alerts;
};
