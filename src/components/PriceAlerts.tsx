import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Investment } from '@/utils/dummyData';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface PriceAlert {
  id: string;
  investmentId: string;
  investmentName: string;
  type: 'target' | 'profit' | 'loss';
  value: number;
  triggered: boolean;
}

interface PriceAlertsProps {
  investments: Investment[];
}

export const PriceAlerts = ({ investments }: PriceAlertsProps) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    investmentId: '',
    type: 'target' as 'target' | 'profit' | 'loss',
    value: '',
  });

  // Check alerts against current prices
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.triggered) return;

      const investment = investments.find(inv => inv.id === alert.investmentId);
      if (!investment) return;

      const profit = (investment.currentPrice - investment.buyPrice) * investment.quantity;
      const profitPercent = ((investment.currentPrice - investment.buyPrice) / investment.buyPrice) * 100;

      let shouldTrigger = false;
      let message = '';

      switch (alert.type) {
        case 'target':
          if (investment.currentPrice >= alert.value) {
            shouldTrigger = true;
            message = `${investment.name} has reached your target price of ₹${alert.value.toLocaleString()}!`;
          }
          break;
        case 'profit':
          if (profitPercent >= alert.value) {
            shouldTrigger = true;
            message = `${investment.name} has reached your profit target of ${alert.value}%!`;
          }
          break;
        case 'loss':
          if (profitPercent <= -alert.value) {
            shouldTrigger = true;
            message = `${investment.name} has dropped to your loss threshold of -${alert.value}%`;
          }
          break;
      }

      if (shouldTrigger) {
        setAlerts(prev =>
          prev.map(a => (a.id === alert.id ? { ...a, triggered: true } : a))
        );
        toast({
          title: '🔔 Price Alert Triggered!',
          description: message,
        });
      }
    });
  }, [investments, alerts, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const investment = investments.find(inv => inv.id === formData.investmentId);
    if (!investment) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      investmentId: formData.investmentId,
      investmentName: investment.name,
      type: formData.type,
      value: parseFloat(formData.value),
      triggered: false,
    };

    setAlerts([...alerts, newAlert]);
    toast({ title: 'Alert created successfully!' });
    
    setFormData({
      investmentId: '',
      type: 'target',
      value: '',
    });
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast({ title: 'Alert deleted' });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'profit':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'loss':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="glass-card shadow-glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Price Alerts
        </CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Bell className="mr-2 h-4 w-4" />
              Add Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="investment">Investment</Label>
                <Select
                  value={formData.investmentId}
                  onValueChange={(value) => setFormData({ ...formData, investmentId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment" />
                  </SelectTrigger>
                  <SelectContent>
                    {investments.map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.name} ({inv.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Alert Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="target">Target Price</SelectItem>
                    <SelectItem value="profit">Profit % Target</SelectItem>
                    <SelectItem value="loss">Loss % Threshold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">
                  {formData.type === 'target' ? 'Price (₹)' : 'Percentage (%)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'target' ? 'e.g., 55000' : 'e.g., 10'}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Create Alert
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No alerts set. Create your first alert to get notified!
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  alert.triggered 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className="font-medium">{alert.investmentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.type === 'target' && `Target: ₹${alert.value.toLocaleString()}`}
                        {alert.type === 'profit' && `Profit target: +${alert.value}%`}
                        {alert.type === 'loss' && `Loss threshold: -${alert.value}%`}
                      </p>
                      {alert.triggered && (
                        <p className="text-xs text-primary mt-1">✓ Triggered</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
