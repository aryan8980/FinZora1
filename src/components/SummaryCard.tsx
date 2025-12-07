import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  title: string;
  amount: string;
  icon: LucideIcon;
  trend?: string;
  index?: number;
}

export const SummaryCard = ({ title, amount, icon: Icon, trend, index = 0 }: SummaryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="glass-card shadow-glass hover:shadow-glow transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{amount}</p>
              {trend && (
                <p className="text-sm text-success">{trend}</p>
              )}
            </div>
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
