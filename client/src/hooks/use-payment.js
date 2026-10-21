import { useMutation, useQueryClient } from '@tanstack/react-query';

import { storageKeys } from '@/lib/query-keys';
import { initiatePayment, updatePaymentStatus } from '@/service/endpoints/transaction';

export function useInitiatePayment() {
  return useMutation({
    mutationFn: initiatePayment,
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: storageKeys.all });
    },
  });
}
