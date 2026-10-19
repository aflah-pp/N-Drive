import { Download, Receipt } from 'lucide-react';
import { useState } from 'react';
import PageHead from './PageHead';

const dummyTransactions = [
  { id: 'TXN-250514-84KQ', package: 'Plus · 28 days', date: '14 May 2025', amount: 210.5, status: 'completed' },
  { id: 'TXN-250416-3LM2', package: 'Plus · 28 days', date: '16 Apr 2025', amount: 210.5, status: 'completed' },
  { id: 'TXN-250319-9FWA', package: 'Plus · 28 days', date: '19 Mar 2025', amount: 210.5, status: 'completed' },
  { id: 'TXN-250218-0PXL', package: 'Plus · 28 days', date: '18 Feb 2025', amount: 210.5, status: 'failed' },
  { id: 'TXN-250119-7QRT', package: 'Plus · 28 days', date: '19 Jan 2025', amount: 210.5, status: 'completed' },
  { id: 'TXN-241220-5YHN', package: 'Plus · 28 days', date: '20 Dec 2024', amount: 210.5, status: 'completed' },
];

// eslint-disable-next-line no-unused-vars
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

export function BillingPage({
  transactions = dummyTransactions,
  filter: filterProp,
  setFilter: setFilterProp,
  onInvoice = () => {},
}) {
  const [localFilter, setLocalFilter] = useState('All');
  const filter = filterProp ?? localFilter;
  const setFilter = setFilterProp ?? setLocalFilter;

  const visible = transactions.filter((t) => filter === 'All' || t.status === filter.toLowerCase());

  const latest = transactions[0];

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="The paperwork, sorted"
        title="Billing & receipts"
        subtitle="A clear record of your plan payments. No surprises."
        actions={
          <button
            type="button"
            onClick={() => onInvoice(latest)}
            data-testid="button-download-latest"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
          >
            <Download size={14} /> Latest receipt
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            Current package
          </span>
          <strong className="block font-extrabold font-manrope text-lg sm:text-xl text-[var(--foreground)] mt-1">
            Plus
          </strong>
        </div>
        <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            Next renewal
          </span>
          <strong className="block font-extrabold font-manrope text-lg sm:text-xl text-[var(--foreground)] mt-1">
            12 Jun 2025
          </strong>
        </div>
        <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            Renewal amount
          </span>
          <strong className="block font-extrabold font-manrope text-lg sm:text-xl text-[var(--primary)] mt-1">
            ₹210.50
          </strong>
        </div>
      </div>

      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Transactions</h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Receipts and payment history for your account.
            </div>
          </div>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
            {['All', 'Completed', 'Failed'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setFilter(label)}
                data-testid={`filter-transactions-${label.toLowerCase()}`}
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

        {visible.length === 0 ? (
          <Empty icon={Receipt} title="No transactions here" copy="Try another filter to see your payment history." />
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
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    data-testid={`row-transaction-${row.id}`}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors"
                  >
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-[10px] sm:text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">
                      {row.id}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--foreground)] whitespace-nowrap">
                      {row.package}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-[var(--foreground)] whitespace-nowrap">
                      ₹{row.amount.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                      <span
                        className={`inline-flex items-center text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md uppercase ${
                          row.status === 'failed'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                      <button
                        type="button"
                        aria-label={`Download receipt ${row.id}`}
                        data-testid={`button-invoice-${row.id}`}
                        onClick={() => onInvoice(row)}
                        className="w-7 h-7 rounded-md inline-flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-2 sm:mt-3 shrink-0 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2.5 py-1.5 leading-tight">
        Receipt buttons show a local download affordance only. No invoice PDF or payment service is connected in this
        frontend demo.
      </div>
    </div>
  );
}

export default BillingPage;
