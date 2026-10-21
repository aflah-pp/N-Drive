import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { storageKeys } from '@/lib/query-keys';
import { createFolder } from '@/service/endpoints/file';

export function CreateFolderDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  const reset = () => setName('');

  const mutation = useMutation({
    mutationFn: (folderName) => createFolder({ name: folderName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.all });
      toast.success('Folder created');
      reset();
      onOpenChange(false);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not create folder';
      toast.error(msg);
    },
  });

  const submit = (e) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Enter a folder name');
      return;
    }
    mutation.mutate(trimmed);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!mutation.isPending) {
          if (!v) reset();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create folder</DialogTitle>
          <DialogDescription>Give this space a name that makes it easy to find later.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <label
            htmlFor="folder-name"
            className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-1"
          >
            Folder name
          </label>
          <input
            id="folder-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="For example, Weekend sketches"
            disabled={mutation.isPending}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow disabled:opacity-60"
          />
        </form>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={mutation.isPending || !name.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <FolderPlus size={13} />
            {mutation.isPending ? 'Creating…' : 'Create folder'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
