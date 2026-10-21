import { Download, Loader2, Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { downloadReceipt, useTransactions } from '@/hooks/use-billing';

import { TransactionDetailModal } from '../modals/TransactionDetailModal';
import PageHead from '../shared/PageHead';

const inr = (value) => `₹${(Number(value) || 0).toFixed(2)}`;

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeStatus = (raw) => {
  const s = String(raw ?? '').toLowerCase();
  if (['success', 'succeeded', 'paid', 'completed'].includes(s)) return 'completed';
  if (['failed', 'declined', 'error'].includes(s)) return 'failed';
  if (['pending', 'processing'].includes(s)) return 'pending';
  return s || 'completed';
};

const STATUS_STYLE = {
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  failed: 'bg-red-500/10 text-red-600 dark:text-red-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

function Empty({ icon: Icon = Receipt, title, copy }) {
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

export function BillingPage() {
  const { data: rawTransactions, isLoading, isError, refetch } = useTransactions();
  const [filter, setFilter] = useState('All');
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  const transactions = useMemo(
    () =>
      (rawTransactions ?? []).map((t) => ({
        id: t.id,
        ref: t.ref ?? t.id.slice(0, 8),
        packageName: t.package?.name ?? '—',
        date: formatDate(t.subscription?.active_from),
        amount: Number(t.amount ?? 0),
        status: normalizeStatus(t.status),
        raw: t,
      })),
    [rawTransactions],
  );

  const visible = useMemo(
    () => transactions.filter((t) => filter === 'All' || t.status === filter.toLowerCase()),
    [transactions, filter],
  );

  const latest = transactions[0];
  const activeSubscription = useMemo(() => {
    const now = new Date();
    return transactions.find((t) => {
      const from = t.raw.subscription?.active_from;
      const to = t.raw.subscription?.active_to;
      if (!from || !to) return false;
      return now >= new Date(from) && now <= new Date(to);
    });
  }, [transactions]);

  const handleDownload = async (row, e) => {
    e?.stopPropagation();
    if (!row?.id) return;
    setDownloadingId(row.id);
    try {
      const filename = await downloadReceipt(row.id);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not download receipt',
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="The paperwork, sorted"
        title="Billing & receipts"
        subtitle="A clear record of your plan payments. No surprises."
        actions={
          <button
            type="button"
            onClick={(e) => latest && handleDownload(latest, e)}
            disabled={!latest || downloadingId === latest.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingId === latest?.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Latest receipt
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            Current package
          </span>
          <strong className="block font-extrabold font-manrope text-lg sm:text-xl text-[var(--foreground)] mt-1 capitalize">
            {activeSubscription?.packageName ?? latest?.packageName ?? '—'}
          </strong>
        </div>
        <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            Next renewal
          </span>
          <strong className="block font-extrabold font-manrope text-lg sm:text-xl text-[var(--foreground)] mt-1">
            {activeSubscription ? formatDate(activeSubscription.raw.subscription?.active_to) : '—'}
          </strong>
        </div>
        <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            Last paid
          </span>
          <strong className="block font-extrabold font-manrope text-lg sm:text-xl text-[var(--primary)] mt-1">
            {latest ? inr(latest.amount) : '—'}
          </strong>
        </div>
      </div>

      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Transactions</h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Click any row to see full details.
            </div>
          </div>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
            {['All', 'Completed', 'Failed'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setFilter(label)}
                className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors ${
                  filter === label
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Couldn’t load transactions.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
              >
                Try again
              </button>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <Empty
            icon={Receipt}
            title={transactions.length === 0 ? 'No transactions yet' : 'No transactions match'}
            copy={
              transactions.length === 0
                ? 'Your first payment will appear here.'
                : 'Try another filter to see your payment history.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold bg-[var(--muted)]/40">
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Reference</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Package</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Date</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Amount</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Status</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold text-right whitespace-nowrap">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const busy = downloadingId === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedTx(row.raw)}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
                    >
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-[10px] sm:text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">
                        {row.ref}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--foreground)] whitespace-nowrap capitalize">
                        {row.packageName}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-[var(--foreground)] whitespace-nowrap">
                        {inr(row.amount)}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                        <span
                          className={`inline-flex items-center text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md uppercase ${
                            STATUS_STYLE[row.status] ?? STATUS_STYLE.completed
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                        <button
                          type="button"
                          aria-label={`Download receipt ${row.ref}`}
                          onClick={(e) => handleDownload(row, e)}
                          disabled={busy}
                          className="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                        >
                          {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-2 sm:mt-3 shrink-0 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2.5 py-1.5 leading-tight">
        Receipts are generated server-side as PDF files and downloaded directly to your device.
      </div>

      <TransactionDetailModal
        transaction={selectedTx}
        open={!!selectedTx}
        onOpenChange={(v) => !v && setSelectedTx(null)}
      />
    </div>
  );
}

export default BillingPage;
