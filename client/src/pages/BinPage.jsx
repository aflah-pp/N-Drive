import { AlertTriangle, CheckCircle2, FileImage, FileText, Folder, LayoutGrid, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import PageHead from './PageHead';

const FILE_STYLES = {
  pdf: { Icon: FileText, cls: 'bg-rose-500/10 text-rose-500' },
  doc: { Icon: FileText, cls: 'bg-blue-500/10 text-blue-500' },
  img: { Icon: FileImage, cls: 'bg-emerald-500/10 text-emerald-500' },
  fig: { Icon: LayoutGrid, cls: 'bg-violet-500/10 text-violet-500' },
  folder: { Icon: Folder, cls: 'bg-amber-500/10 text-amber-500' },
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

// eslint-disable-next-line no-unused-vars
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

const dummyTrash = [
  { id: 'trash-1', name: 'old-campaign-final.png', type: 'img', size: '3.4 MB', date: '3 May 2025, 2:14 PM' },
  { id: 'trash-2', name: 'Untitled folder', type: 'folder', size: '2 items', date: '29 Apr 2025, 9:02 AM' },
  { id: 'trash-3', name: 'Q1-budget-draft.xlsx', type: 'doc', size: '128 KB', date: '27 Apr 2025, 6:41 PM' },
  { id: 'trash-4', name: 'brand-guidelines-v1.pdf', type: 'pdf', size: '12.6 MB', date: '24 Apr 2025, 11:18 AM' },
  { id: 'trash-5', name: 'wireframe-exploration.fig', type: 'fig', size: '22.1 MB', date: '20 Apr 2025, 4:55 PM' },
  { id: 'trash-6', name: 'screenshot-2025-04-18.png', type: 'img', size: '892 KB', date: '18 Apr 2025, 10:03 AM' },
  { id: 'trash-7', name: 'meeting-notes-march.docx', type: 'doc', size: '64 KB', date: '15 Apr 2025, 7:22 PM' },
  { id: 'trash-8', name: 'client-invoice-042.pdf', type: 'pdf', size: '284 KB', date: '12 Apr 2025, 1:09 PM' },
  { id: 'trash-9', name: 'Archive 2024', type: 'folder', size: '18 items', date: '8 Apr 2025, 8:45 AM' },
  { id: 'trash-10', name: 'promo-banner-alt.jpg', type: 'img', size: '5.1 MB', date: '4 Apr 2025, 3:31 PM' },
];

export const TrashPage = ({
  trash: trashProp,
  onRestore: onRestoreProp,
  onClear: onClearProp,
  onRestoreAll: onRestoreAllProp,
}) => {
  const isControlled = Array.isArray(trashProp);

  const [localTrash, setLocalTrash] = useState(dummyTrash);

  const trash = isControlled ? trashProp : localTrash;

  const onRestore = isControlled
    ? onRestoreProp
    : (item) => {
        setLocalTrash((prev) => prev.filter((t) => t.id !== item.id));

        console.log('[demo] restore →', item.name);
      };

  const onRestoreAll = isControlled
    ? onRestoreAllProp
    : () => {
        console.log(
          '[demo] restore all →',
          trash.map((t) => t.name),
        );
        setLocalTrash([]);
      };

  const onClear = isControlled
    ? onClearProp
    : () => {
        console.log('[demo] empty trash →', trash.length, 'items');
        setLocalTrash([]);
      };

  const isEmpty = trash.length === 0;

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
              onClick={onRestoreAll}
              disabled={isEmpty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="button-restore-all"
            >
              <RotateCcw size={14} /> Restore all
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={isEmpty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="button-clear-trash"
            >
              <Trash2 size={14} /> Empty trash
            </button>
          </>
        }
      />

      {/* Warning note */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 p-2.5 sm:p-3 mb-2 sm:mb-3 text-[11px] sm:text-xs leading-relaxed shrink-0">
        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Heads up:</strong> this is a local demo. Emptying Trash clears the sample
          items from this browser session.
        </div>
      </div>

      {/* Panel */}
      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Recently deleted</h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              {trash.length} {trash.length === 1 ? 'item' : 'items'} in Trash
            </div>
          </div>
          {!isEmpty && (
            <span className="shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
              {trash.length} ITEM{trash.length === 1 ? '' : 'S'}
            </span>
          )}
        </div>

        {isEmpty ? (
          <Empty icon={CheckCircle2} title="All clear" copy="Nothing in the bin. Your workspace is looking tidy." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold bg-[var(--muted)]/40">
                  <th className="px-3 sm:px-4 py-2 font-semibold">Name</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Size</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Deleted</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {trash.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors"
                    data-testid={`row-trash-${item.id}`}
                  >
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
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
                        onClick={() => onRestore(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] transition-colors active:scale-[0.97]"
                        data-testid={`button-restore-${item.id}`}
                      >
                        <RotateCcw size={12} /> Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default TrashPage;
