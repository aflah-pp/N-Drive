import { useStorageUsage } from '@/hooks/use-storage';

function parsePercent(value) {
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace('%', '').trim());
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0;
}

export function StorageCard() {
  const { data: usage, isLoading, isError } = useStorageUsage();

  const isOverQuota = String(usage?.used_percentage ?? '').toLowerCase() === 'over quota';
  const pct = isOverQuota ? 100 : parsePercent(usage?.used_percentage);

  return (
    <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm flex flex-col">
      <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-2">
        Your cloud space
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-2">
          <div className="h-6 w-32 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-2 bg-[var(--muted)] rounded-full" />
          <div className="flex justify-between">
            <div className="h-3 w-14 bg-[var(--muted)] rounded animate-pulse" />
            <div className="h-3 w-20 bg-[var(--muted)] rounded animate-pulse" />
          </div>
        </div>
      ) : isError || !usage ? (
        <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-6">Couldn’t load storage right now.</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mt-6">
            <strong className="font-extrabold font-manrope text-xl sm:text-2xl text-[var(--foreground)] tracking-tight">
              {usage.used_storage}
            </strong>
            <span className="text-[11px] sm:text-xs text-[var(--muted-foreground)]">of {usage.total_storage} used</span>
          </div>

          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isOverQuota ? 'bg-red-500' : 'bg-[var(--primary)]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-2">
            <span>{isOverQuota ? 'Over quota' : `${usage.used_percentage} used`}</span>
            <span>{usage.remaining_storage} remaining</span>
          </div>

          {usage.on_bin && (
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-1">
              {usage.on_bin} in Trash
            </div>
          )}
        </>
      )}
    </section>
  );
}
