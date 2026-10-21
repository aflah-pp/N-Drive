import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { storageKeys } from '@/lib/query-keys';
import { deleteItem } from '@/service/endpoints/file';

export function DeleteConfirmDialog({ target, onClose, onSuccess }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item) =>
      deleteItem({
        fileId: item.kind === 'file' ? item.id : undefined,
        folderId: item.kind === 'folder' ? item.id : undefined,
      }),
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: storageKeys.all });
      toast.success(`${item.name} moved to Trash`);
      onSuccess?.();
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not delete';
      toast.error(msg);
    },
  });

  return (
    <AlertDialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move {target?.kind === 'folder' ? 'folder' : 'file'} to Trash?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{target?.name}</strong> will be moved to Trash. You can restore it later from the Bin page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              if (target) mutation.mutate(target);
            }}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <Trash2 size={13} />
            {mutation.isPending ? 'Moving…' : 'Move to Trash'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
