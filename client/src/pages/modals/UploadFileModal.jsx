import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Upload, X, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
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
import { uploadFile } from '@/service/endpoints/file';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 ? 0 : 1)} ${units[i]}`;
};

const makeEntry = (file) => ({
  id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
  file,
  status: 'pending',
  progress: 0,
  error: null,
});

export function UploadFileDialog({ open, onOpenChange, folderId }) {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEntries([]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const addFiles = (list) => {
    setEntries((old) => [...old, ...Array.from(list).map(makeEntry)]);
  };

  const removeAt = (id) => {
    if (busy) return;
    setEntries((old) => old.filter((e) => e.id !== id));
  };

  const updateEntry = (id, patch) => {
    setEntries((old) => old.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const submit = async () => {
    if (busy) return;
    const pending = entries.filter((e) => e.status === 'pending');
    if (!pending.length) {
      toast.error('Pick at least one file');
      return;
    }

    setBusy(true);

    let successCount = 0;
    let failCount = 0;

    for (const entry of pending) {
      updateEntry(entry.id, { status: 'uploading', progress: 0 });

      try {
        await uploadFile({
          file: entry.file,
          folderId: folderId ?? null,
          onProgress: (percent) => {
            updateEntry(entry.id, { progress: percent });
          },
        });
        updateEntry(entry.id, { status: 'success', progress: 100 });
        successCount++;
      } catch (err) {
        const message = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Upload failed';
        updateEntry(entry.id, {
          status: 'error',
          error: message,
          progress: 0,
        });
        failCount++;
      }
    }

    setBusy(false);

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: storageKeys.all });
      toast.success(`${successCount} file${successCount === 1 ? '' : 's'} uploaded`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} file${failCount === 1 ? '' : 's'} failed to upload`);
    }

    if (successCount > 0 && failCount === 0) {
      setTimeout(() => {
        reset();
        onOpenChange(false);
      }, 600);
    }
  };

  const totalSize = entries.reduce((sum, e) => sum + e.file.size, 0);
  const pendingCount = entries.filter((e) => e.status === 'pending').length;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (busy) return;
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            {folderId ? 'Files will be added to this folder.' : 'Files will be added to your drive root.'}
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (busy) return;
            if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
          }}
          onClick={() => !busy && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && !busy && inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            busy
              ? 'border-[var(--border)] opacity-50 cursor-not-allowed'
              : dragging
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-[var(--border)] hover:border-[var(--primary)]/40'
          }`}
        >
          <Upload size={22} className="mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-xs sm:text-sm font-medium text-[var(--foreground)]">Click to choose or drag &amp; drop</p>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Multiple files supported</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>

        {entries.length > 0 && (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
            {entries.map((entry) => (
              <FileRow key={entry.id} entry={entry} onRemove={() => removeAt(entry.id)} busy={busy} />
            ))}
          </div>
        )}

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
          >
            {entries.some((e) => e.status === 'success') ? 'Close' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || pendingCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload size={13} />
                Upload{pendingCount ? ` (${pendingCount})` : ''}
              </>
            )}
          </button>
        </DialogFooter>

        {entries.length > 0 && (
          <p className="text-[10px] text-[var(--muted-foreground)] text-center">
            Total: {formatBytes(totalSize)} · {entries.length} {entries.length === 1 ? 'file' : 'files'}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FileRow({ entry, onRemove, busy }) {
  const { file, status, progress, error } = entry;

  const statusIcon = () => {
    if (status === 'success') return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
    if (status === 'error') return <XCircle size={14} className="text-red-500 shrink-0" />;
    if (status === 'uploading') return <Loader2 size={14} className="animate-spin text-[var(--primary)] shrink-0" />;
    return null;
  };

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-2">
      <div className="flex items-center gap-2">
        {statusIcon()}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-medium truncate text-[var(--foreground)]">{file.name}</p>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            {status === 'error'
              ? error || 'Upload failed'
              : status === 'success'
                ? `Uploaded · ${formatBytes(file.size)}`
                : status === 'uploading'
                  ? `${progress}% · ${formatBytes((file.size * progress) / 100)} of ${formatBytes(file.size)}`
                  : formatBytes(file.size)}
          </p>
        </div>

        {!busy && status === 'pending' && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {(status === 'uploading' || status === 'success' || status === 'error') && (
        <div className="mt-1.5 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ease-out ${
              status === 'error' ? 'bg-red-500' : status === 'success' ? 'bg-emerald-500' : 'bg-[var(--primary)]'
            }`}
            style={{
              width: status === 'error' ? '100%' : `${Math.max(2, Math.min(100, progress))}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
