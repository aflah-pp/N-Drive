import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileImage,
  FileText,
  Folder,
  LayoutGrid,
  Loader2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useBin } from '@/hooks/use-bin';
import { BinConfirmDialog } from '../modals/BinConfirmModal';
import PageHead from '../shared/PageHead';

const FILE_STYLES = {
  pdf: { Icon: FileText, cls: 'bg-rose-500/10 text-rose-500' },
  doc: { Icon: FileText, cls: 'bg-blue-500/10 text-blue-500' },
  img: { Icon: FileImage, cls: 'bg-emerald-500/10 text-emerald-500' },
  fig: { Icon: LayoutGrid, cls: 'bg-violet-500/10 text-violet-500' },
  folder: { Icon: Folder, cls: 'bg-amber-500/10 text-amber-500' },
};

const EXT_MAP = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
  txt: 'doc',
  rtf: 'doc',
  png: 'img',
  jpg: 'img',
  jpeg: 'img',
  gif: 'img',
  webp: 'img',
  svg: 'img',
  fig: 'fig',
  sketch: 'fig',
  xd: 'fig',
};

const getFileType = (filename = '') => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MAP[ext] ?? 'doc';
};

const formatSize = (value) => {
  if (value == null) return '—';
  if (typeof value === 'string' && /[a-zA-Z]/.test(value)) return value;
  const n = Number(value) || 0;
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = n;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[i]}`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function FileGlyph({ type }) {
  const { Icon, cls } = FILE_STYLES[type] ?? FILE_STYLES.doc;
  return (
    <div
      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center shrink-0 ${cls}`}
      aria-hidden="true"
    >
      <Icon size={15} />
    </div>
  );
}

function Empty({ icon: Icon = CheckCircle2, title, copy }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-10 sm:py-14 px-4"
      data-testid="empty-state"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
        <Icon size={22} />
      </div>
      <h3 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed">{copy}</p>
    </div>
  );
}

const transformFile = (raw) => ({
  id: raw.id,
  kind: 'file',
  name: raw.filename,
  type: getFileType(raw.filename),
  size: formatSize(raw.size),
  date: formatDate(raw.deleted_at ?? raw.uploaded_at),
  raw,
});

const transformFolder = (raw) => {
  const files = (raw.files ?? []).map(transformFile);
  const fileCount = files.length;
  return {
    id: raw.id,
    kind: 'folder',
    name: raw.name,
    type: 'folder',
    size: `${fileCount} item${fileCount === 1 ? '' : 's'}`,
    date: formatDate(raw.deleted_at ?? raw.created_at),
    files,
    raw,
  };
};

export function TrashPage() {
  const { data, isLoading, isError, refetch, restoreOne, restoreAll, clear } = useBin();

  const [openFolders, setOpenFolders] = useState(() => new Set());
  const [confirmIntent, setConfirmIntent] = useState(null);
  const [confirmContext, setConfirmContext] = useState(null);

  const rows = useMemo(() => {
    if (!data) return [];
    const folders = (data.folders ?? []).map(transformFolder);
    const files = (data.files ?? []).map(transformFile);
    return [...folders, ...files].sort((a, b) => {
      const ta = new Date(a.raw.deleted_at ?? a.raw.uploaded_at ?? a.raw.created_at ?? 0).getTime();
      const tb = new Date(b.raw.deleted_at ?? b.raw.uploaded_at ?? b.raw.created_at ?? 0).getTime();
      return tb - ta;
    });
  }, [data]);

  const totalCount = useMemo(() => {
    // Include children so "Empty trash" reflects real total
    return rows.reduce((sum, item) => sum + (item.kind === 'folder' ? 1 + item.files.length : 1), 0);
  }, [rows]);

  const isEmpty = rows.length === 0;
  const busy = restoreOne.isPending || restoreAll.isPending || clear.isPending;

  const toggleFolder = (id) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const askConfirm = (intent, context) => {
    if (busy) return;
    setConfirmIntent(intent);
    setConfirmContext(context);
  };

  const closeConfirm = () => {
    setConfirmIntent(null);
    setConfirmContext(null);
  };

  const runRestoreOne = (item) => {
    restoreOne.mutate(
      { itemType: item.kind, id: item.id },
      {
        onSuccess: () => {
          toast.success(`${item.name} restored`);
          closeConfirm();
        },
        onError: (err) => {
          toast.error(err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Restore failed');
          closeConfirm();
        },
      },
    );
  };

  const runRestoreAll = () => {
    restoreAll.mutate(undefined, {
      onSuccess: () => {
        toast.success('All items restored');
        closeConfirm();
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Restore failed');
        closeConfirm();
      },
    });
  };

  const runClear = () => {
    clear.mutate(undefined, {
      onSuccess: () => {
        toast.success('Trash emptied');
        closeConfirm();
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not empty Trash',
        );
        closeConfirm();
      },
    });
  };

  const confirmBusy =
    (confirmIntent === 'restore' && restoreOne.isPending) ||
    (confirmIntent === 'restoreAll' && restoreAll.isPending) ||
    (confirmIntent === 'clear' && clear.isPending);

  const handleConfirm = () => {
    if (confirmIntent === 'restore' && confirmContext?.item) {
      runRestoreOne(confirmContext.item);
    } else if (confirmIntent === 'restoreAll') {
      runRestoreAll();
    } else if (confirmIntent === 'clear') {
      runClear();
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Second chances"
        title="Trash"
        subtitle="Items here are out of your way, not quite gone."
        actions={
          <>
            <button
              type="button"
              onClick={() => askConfirm('restoreAll', { count: totalCount })}
              disabled={isEmpty || busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} /> Restore all
            </button>
            <button
              type="button"
              onClick={() => askConfirm('clear', { count: totalCount })}
              disabled={isEmpty || busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} /> Empty trash
            </button>
          </>
        }
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 p-2.5 sm:p-3 mb-2 sm:mb-3 text-[11px] sm:text-xs leading-relaxed shrink-0">
        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Heads up:</strong> items in Trash still count toward your storage. Emptying
          Trash frees up space permanently.
        </div>
      </div>

      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Recently deleted</h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              {rows.length} {rows.length === 1 ? 'item' : 'items'} in Trash
            </div>
          </div>
          {!isEmpty && (
            <span className="shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
              {rows.length} ITEM{rows.length === 1 ? '' : 'S'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Couldn’t load Trash.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
              >
                Try again
              </button>
            </div>
          </div>
        ) : isEmpty ? (
          <Empty icon={CheckCircle2} title="All clear" copy="Nothing in the bin. Your workspace is looking tidy." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold bg-[var(--muted)]/40">
                  <th className="px-3 sm:px-4 py-2 font-semibold">Name</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Size</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Uploaded</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const isFolder = item.kind === 'folder';
                  const open = isFolder && openFolders.has(item.id);
                  const rowBusy = restoreOne.isPending && restoreOne.variables?.id === item.id;

                  return (
                    <>
                      <tr
                        key={`${item.kind}-${item.id}`}
                        className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors"
                      >
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isFolder ? (
                              <button
                                type="button"
                                onClick={() => toggleFolder(item.id)}
                                aria-label={open ? 'Collapse folder' : 'Expand folder'}
                                className="w-5 h-5 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] shrink-0"
                              >
                                {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                              </button>
                            ) : (
                              <span className="w-5 shrink-0" aria-hidden="true" />
                            )}
                            <FileGlyph type={item.type} />
                            <span className="font-medium text-[var(--card-foreground)] truncate max-w-[180px] sm:max-w-none">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                          {item.size}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                          <button
                            type="button"
                            onClick={() => askConfirm('restore', { item, name: item.name })}
                            disabled={rowBusy || busy}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] transition-colors active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <RotateCcw size={12} className={rowBusy ? 'animate-spin' : ''} />
                            {rowBusy ? 'Restoring…' : 'Restore'}
                          </button>
                        </td>
                      </tr>

                      {isFolder &&
                        open &&
                        item.files.map((child) => {
                          const childBusy = restoreOne.isPending && restoreOne.variables?.id === child.id;
                          return (
                            <tr
                              key={`child-${child.id}`}
                              className="border-b border-[var(--border)] last:border-0 bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40 transition-colors"
                            >
                              <td className="px-3 sm:px-4 py-2">
                                <div className="flex items-center gap-2.5 min-w-0 pl-7">
                                  <FileGlyph type={child.type} />
                                  <span className="font-medium text-[var(--card-foreground)] truncate max-w-[160px] sm:max-w-none">
                                    {child.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-[var(--muted-foreground)] whitespace-nowrap">
                                {child.size}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-[var(--muted-foreground)] whitespace-nowrap">
                                {child.date}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    askConfirm('restore', {
                                      item: child,
                                      name: child.name,
                                    })
                                  }
                                  disabled={childBusy || busy}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <RotateCcw size={11} className={childBusy ? 'animate-spin' : ''} />
                                  {childBusy ? '…' : 'Restore'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <BinConfirmDialog
        intent={confirmIntent}
        context={confirmContext}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        busy={confirmBusy}
      />
    </div>
  );
}

export default TrashPage;
