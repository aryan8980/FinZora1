export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  type: 'income' | 'expense';
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

export const dummyTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Salary',
    amount: 50000,
    date: '2025-01-01',
    category: 'Income',
    description: 'Monthly salary',
    type: 'income',
  },
  {
    id: '2',
    title: 'Starbucks Coffee',
    amount: 450,
    date: '2025-01-03',
    category: 'Food',
    description: 'Morning coffee',
    type: 'expense',
  },
  {
    id: '3',
    title: 'Grocery Shopping',
    amount: 3200,
    date: '2025-01-05',
    category: 'Food',
    description: 'Weekly groceries',
    type: 'expense',
  },
  {
    id: '4',
    title: 'Uber Ride',
    amount: 250,
    date: '2025-01-06',
    category: 'Transport',
    description: 'Office commute',
    type: 'expense',
  },
  {
    id: '5',
    title: 'Netflix Subscription',
    amount: 799,
    date: '2025-01-08',
    category: 'Entertainment',
    description: 'Monthly subscription',
    type: 'expense',
  },
];

export const dummyGoals: Goal[] = [
  {
    id: '1',
    title: 'Buy iPhone 15 Pro',
    target: 80000,
    current: 35000,
    deadline: '2025-07-01',
    category: 'Electronics',
  },
  {
    id: '2',
    title: 'Vacation to Goa',
    target: 45000,
    current: 22000,
    deadline: '2025-12-20',
    category: 'Travel',
  },
  {
    id: '3',
    title: 'Emergency Fund',
    target: 100000,
    current: 65000,
    deadline: '2025-12-31',
    category: 'Savings',
  },
];

export const monthlyTrends = [
  { month: 'Jul', income: 45000, expense: 32000 },
  { month: 'Aug', income: 48000, expense: 35000 },
  { month: 'Sep', income: 50000, expense: 33000 },
  { month: 'Oct', income: 50000, expense: 38000 },
  { month: 'Nov', income: 52000, expense: 36000 },
  { month: 'Dec', income: 50000, expense: 34000 },
];

export const categoryData = [
  { name: 'Food', value: 8500, color: 'hsl(217 91% 60%)' },
  { name: 'Transport', value: 3200, color: 'hsl(270 67% 57%)' },
  { name: 'Entertainment', value: 2500, color: 'hsl(142 71% 45%)' },
  { name: 'Shopping', value: 5600, color: 'hsl(217 91% 75%)' },
  { name: 'Bills', value: 7800, color: 'hsl(270 67% 75%)' },
];

export interface Investment {
  id: string;
  name: string;
  symbol: string;
  type: 'crypto' | 'stock';
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

export const dummyInvestments: Investment[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'crypto',
    quantity: 0.5,
    buyPrice: 45000,
    currentPrice: 52000,
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'crypto',
    quantity: 2,
    buyPrice: 3000,
    currentPrice: 3500,
  },
  {
    id: '3',
    name: 'Apple Inc',
    symbol: 'AAPL',
    type: 'stock',
    quantity: 10,
    buyPrice: 175,
    currentPrice: 185,
  },
  {
    id: '4',
    name: 'Tesla Inc',
    symbol: 'TSLA',
    type: 'stock',
    quantity: 5,
    buyPrice: 220,
    currentPrice: 245,
  },
  {
    id: '5',
    name: 'Microsoft',
    symbol: 'MSFT',
    type: 'stock',
    quantity: 8,
    buyPrice: 380,
    currentPrice: 410,
  },
];
