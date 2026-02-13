import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  Target,
  ArrowRightLeft,
  MessageSquare,
  User,
  TrendingUp,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Receipt, label: 'Transactions', path: '/transactions' },
  { icon: PlusCircle, label: 'Add Expense', path: '/add-transaction' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: PiggyBank, label: 'Budgets', path: '/budget' },
  { icon: TrendingUp, label: 'Investments', path: '/investments' },
  { icon: ArrowRightLeft, label: 'Currency', path: '/currency' },
  { icon: MessageSquare, label: 'AI Assistant', path: '/chat' },
  { icon: User, label: 'Profile', path: '/profile' },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar = ({ className, onNavigate }: SidebarProps) => {
  return (
    <aside className={cn("w-64 border-r bg-card/80 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 shadow-xl z-20", className)}>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out',
                'hover:bg-accent/50 hover:translate-x-1',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 relative overflow-hidden'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
                )}
                <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "animate-pulse-subtle" : "")} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
