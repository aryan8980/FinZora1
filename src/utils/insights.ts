import { Transaction } from './dummyData';

export interface Insight {
    id: string;
    type: 'positive' | 'negative' | 'neutral';
    message: string;
}

export const generateFinancialInsights = (transactions: Transaction[]): Insight[] => {
    if (!transactions || transactions.length === 0) {
        return [
            {
                id: 'no-data',
                type: 'neutral',
                message: 'Start adding transactions to see AI-powered financial insights here.',
            },
        ];
    }

    const insights: Insight[] = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter current month transactions
    const currentMonthTransactions = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const previousMonthTransactions = transactions.filter((t) => {
        const d = new Date(t.date);
        // Handle Jan case
        if (currentMonth === 0) {
            return d.getMonth() === 11 && d.getFullYear() === currentYear - 1;
        }
        return d.getMonth() === currentMonth - 1 && d.getFullYear() === currentYear;
    });

    // METRIC 1: Month-over-Month Spending
    const currentExpenses = currentMonthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const previousExpenses = previousMonthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    if (previousExpenses > 0) {
        const percentChange = ((currentExpenses - previousExpenses) / previousExpenses) * 100;
        if (percentChange > 10) {
            insights.push({
                id: 'spending-increase',
                type: 'negative',
                message: `⚠️ Spending Alert: You've spent ${percentChange.toFixed(0)}% more this month compared to last month.`,
            });
        } else if (percentChange < -10) {
            insights.push({
                id: 'spending-decrease',
                type: 'positive',
                message: `🎉 Great job! Your spending is down ${Math.abs(percentChange).toFixed(0)}% compared to last month.`,
            });
        }
    }

    // METRIC 2: Top Expense Category
    const categoryTotals: Record<string, number> = {};
    currentMonthTransactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
            const cat = t.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
        });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
        const [topCategory, topAmount] = sortedCategories[0];
        if (topAmount > 0) {
            insights.push({
                id: 'top-category',
                type: 'neutral',
                message: `📊 Top Expense: Your highest spending category this month is ${topCategory} (₹${topAmount.toLocaleString()}).`,
            });
        }
    }

    // METRIC 3: Savings Rate (Income vs Expenses)
    const currentIncome = currentMonthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    if (currentIncome > 0) {
        const savings = currentIncome - currentExpenses;
        const savingsRate = (savings / currentIncome) * 100;

        if (savingsRate > 20) {
            insights.push({
                id: 'savings-healthy',
                type: 'positive',
                message: `💰 Healthy Savings: You saved ${savingsRate.toFixed(0)}% of your income this month!`,
            });
        } else if (savingsRate < 0) {
            insights.push({
                id: 'savings-negative',
                type: 'negative',
                message: `📉 Deficit Alert: You have spent ₹${Math.abs(savings).toLocaleString()} more than your income this month.`,
            });
        }
    }

    // Fallback defaults if logic yields fewer than 2 insights
    const defaultInsights = [
        "💡 Tip: Review your subscriptions to find hidden savings.",
        "💡 Tip: Try the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings."
    ];

    // Fill up to at least 2
    let i = 0;
    while (insights.length < 2 && i < defaultInsights.length) {
        insights.push({
            id: `default-${i}`,
            type: 'neutral',
            message: defaultInsights[i]
        });
        i++;
    }

    return insights.slice(0, 3); // Return top 3
};
