import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updateCurrentUser } from '@/service/endpoints/user';
import useAuthStore from '@/service/store/authStore';

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload) => updateCurrentUser(payload),
    onSuccess: (data) => {
      const freshUser = data?.user ?? data;
      if (freshUser) {
        setUser(freshUser);
        queryClient.setQueryData(['auth', 'me'], freshUser);
      }
      toast.success('Profile updated');
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not save your profile';
      toast.error(msg);
    },
  });
}
