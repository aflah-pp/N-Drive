import {
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  Package,
  Receipt,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { downloadReceipt } from '@/hooks/use-billing';

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

const formatBytes = (bytes) => {
  const n = Number(bytes) || 0;
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = n;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[i]}`;
};

const STATUS_META = {
  completed: {
    Icon: CheckCircle2,
    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'Completed',
  },
  failed: {
    Icon: XCircle,
    cls: 'bg-red-500/10 text-red-600 dark:text-red-400',
    label: 'Failed',
  },
  pending: {
    Icon: Clock3,
    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Pending',
  },
};

function Row({ label, value, mono, sub }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold shrink-0 pt-0.5">
        {label}
      </span>
      <div className="text-right min-w-0">
        <div
          className={`text-[12px] sm:text-[13px] font-medium text-[var(--foreground)] break-all ${
            mono ? 'font-mono text-[11px] sm:text-[12px]' : ''
          }`}
        >
          {value}
        </div>
        {sub && <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export function TransactionDetailModal({ transaction: tx, open, onOpenChange }) {
  const [downloading, setDownloading] = useState(false);
  if (!tx) return null;

  const pkg = tx.package ?? {};
  const sub = tx.subscription ?? {};
  const features = Array.isArray(pkg.description?.features) ? pkg.description.features : [];

  const status = String(tx.status ?? '').toLowerCase();
  const meta = STATUS_META[status] ?? STATUS_META.completed;

  const now = new Date();
  const activeFrom = sub.active_from ? new Date(sub.active_from) : null;
  const activeTo = sub.active_to ? new Date(sub.active_to) : null;
  const isActive = activeFrom && activeTo && now >= activeFrom && now <= activeTo;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const filename = await downloadReceipt(tx.id);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not download receipt',
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={16} className="text-[var(--primary)]" />
            Transaction details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] sm:text-xs font-semibold ${meta.cls}`}
          >
            <meta.Icon size={14} />
            <span>Payment {meta.label.toLowerCase()}</span>
            <span className="ml-auto font-mono">{inr(tx.amount)}</span>
          </div>

          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                <Package size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold font-manrope text-[var(--foreground)] capitalize">
                  {pkg.name ?? '—'} plan
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  {pkg.price != null ? `${inr(pkg.price)} / 28 days` : ''}
                </div>
              </div>
            </div>

            {pkg.max_upload_size != null && (
              <div className="text-[10px] text-[var(--muted-foreground)] mb-2">
                Max file upload:{' '}
                <strong className="text-[var(--foreground)]">{formatBytes(pkg.max_upload_size)}</strong>
              </div>
            )}

            {features.length > 0 && (
              <ul className="space-y-1.5 mt-2">
                {features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-[11px] sm:text-xs text-[var(--foreground)]">
                    <Sparkles size={11} className="text-[var(--primary)] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                <Calendar size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold font-manrope text-[var(--foreground)]">Subscription window</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  {isActive ? 'Active' : 'Not currently active'}
                </div>
              </div>
              <span
                className={`shrink-0 text-[9px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md uppercase ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
              >
                {isActive ? 'active' : 'ended'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                  Active from
                </div>
                <div className="text-[12px] font-medium text-[var(--foreground)] mt-0.5">
                  {formatDate(sub.active_from)}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                  Active to
                </div>
                <div className="text-[12px] font-medium text-[var(--foreground)] mt-0.5">
                  {formatDate(sub.active_to)}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[var(--border)] rounded-lg px-3">
            <Row label="Reference" value={tx.ref ?? tx.id} mono />
            <Row label="Transaction ID" value={tx.id} mono />
            <Row label="User ID" value={tx.user ?? '—'} mono />
            <Row label="Amount" value={inr(tx.amount)} />
            <Row label="Status" value={meta.label} />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
            <ShieldCheck size={11} />
            <span>Receipts are generated server-side as PDFs.</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X size={13} /> Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {downloading ? 'Preparing…' : 'Download receipt'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
