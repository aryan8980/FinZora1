
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { type SmartAlert as AlertType } from '@/utils/smartAlerts';

interface SmartAlertProps {
    alerts: AlertType[];
}

export function SmartAlert({ alerts }: SmartAlertProps) {
    const [visibleAlerts, setVisibleAlerts] = useState(alerts);

    const handleDismiss = (id: string) => {
        setVisibleAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            <AnimatePresence>
                {visibleAlerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, margin: 0 }}
                        className={`
              relative flex items-start p-4 rounded-lg border shadow-sm
              ${alert.type === 'critical'
                                ? 'bg-red-50 border-red-200 text-red-900'
                                : alert.type === 'warning'
                                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                                    : 'bg-blue-50 border-blue-200 text-blue-900'
                            }
            `}
                    >
                        <div className="shrink-0 mr-3 mt-0.5">
                            {alert.type === 'critical' ? (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            ) : alert.type === 'warning' ? (
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            ) : (
                                <Info className="h-5 w-5 text-blue-600" />
                            )}
                        </div>

                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">{alert.title}</h4>
                            <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                            {alert.action && (
                                <a
                                    href={alert.actionLink || '#'}
                                    className="inline-block mt-2 text-xs font-semibold underline hover:no-underline"
                                >
                                    {alert.action}
                                </a>
                            )}
                        </div>

                        <button
                            onClick={() => handleDismiss(alert.id)}
                            className="shrink-0 ml-3 p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 opacity-50" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
