import { useQuery } from '@tanstack/react-query';

import { getAvailableStorage, getStorageUsage } from '@/service/endpoints/package';
import { storageKeys } from '@/lib/query-keys';

const FIVE_MIN = 5 * 60_000;

export function useStorageUsage() {
  return useQuery({
    queryKey: storageKeys.usage(),
    queryFn: getStorageUsage,
    staleTime: FIVE_MIN,
    select: (data) => data?.result ?? data,
  });
}

export function useStorageFiles() {
  return useQuery({
    queryKey: storageKeys.files(),
    queryFn: getAvailableStorage,
    staleTime: FIVE_MIN,
    select: (data) => data?.result ?? data,
  });
}
