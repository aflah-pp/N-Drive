import { useQuery } from '@tanstack/react-query';

import { getAllPackage } from '@/service/endpoints/package';

const FIVE_MIN = 5 * 60_000;

export const planKeys = {
  all: ['plans'],
  list: () => [...planKeys.all, 'list'],
};

export function usePlans() {
  return useQuery({
    queryKey: planKeys.list(),
    queryFn: getAllPackage,
    staleTime: FIVE_MIN,
    select: (data) => (Array.isArray(data) ? data : (data?.packages ?? [])),
  });
}
