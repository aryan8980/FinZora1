/**
 * Hook to invalidate budget-related queries
 * This ensures budget data updates when transactions are added/modified
 */
import { useQueryClient } from '@tanstack/react-query';

export const useBudgetInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateBudgetQueries = () => {
    // Invalidate both budget and spending stats to force refetch
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
  };

  return { invalidateBudgetQueries };
};
