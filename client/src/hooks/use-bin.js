import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { storageKeys } from '@/lib/query-keys';
import { clearBin, getBinStorage, restoreBin, restoreBinItem } from '@/service/endpoints/bin';

const FIVE_MIN = 5 * 60_000;

export function useBin() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: storageKeys.bin(),
    queryFn: getBinStorage,
    staleTime: FIVE_MIN,
    select: (data) => {
      const body = data?.result ?? data ?? {};
      return {
        folders: body.deleted_folders ?? body.folders ?? [],
        files: body.deleted_files ?? body.files ?? [],
      };
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: storageKeys.all });

  const restoreOne = useMutation({
    mutationFn: ({ itemType, id }) => restoreBinItem({ itemType, id }),
    onSuccess: invalidate,
  });

  const restoreAll = useMutation({
    mutationFn: () => restoreBin(),
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: () => clearBin(),
    onSuccess: invalidate,
  });

  return {
    ...query,
    restoreOne,
    restoreAll,
    clear,
  };
}
