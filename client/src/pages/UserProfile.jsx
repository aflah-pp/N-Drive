import {
  Calendar,
  Check,
  ChevronRight,
  Cloud,
  CreditCard,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useStorageFiles, useStorageUsage } from '@/hooks/use-storage';
import useAuthStore from '@/service/store/authStore';
import PageHead from './shared/PageHead';

const inr = (v) => {
  const n = Number(v) || 0;
  return n === 0 ? 'Free' : `₹${n.toFixed(2)}`;
};

const formatDate = (iso, opts = {}) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
};

const daysBetween = (a, b) => {
  const MS = 86_400_000;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / MS));
};

const sizeMb = (value) => {
  if (value == null) return 0;
  if (typeof value === 'string') {
    const m = value.trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
    if (!m) return 0;
    const n = Number(m[1]) || 0;
    const unit = (m[2] || 'MB').toUpperCase();
    return unit === 'GB' ? n * 1024 : unit === 'KB' ? n / 1024 : unit === 'B' ? n / (1024 * 1024) : n;
  }
  return Number(value) || 0;
};

const formatMb = (mb) => {
  const n = Number(mb) || 0;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} GB`;
  if (n >= 1) return `${n.toFixed(1)} MB`;
  return `${Math.round(n * 1024)} KB`;
};

function Donut({ segments, size = 120, stroke = 14, centerLabel, centerSub }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const length = (s.value / total) * circ;
          const dashArray = `${length} ${circ - length}`;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-lg sm:text-xl font-extrabold font-manrope text-[var(--foreground)]">{centerLabel}</div>
          {centerSub && (
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
              {centerSub}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeatureBars({ items }) {
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-medium text-[var(--foreground)] truncate">{it.label}</span>
            <span
              className={`text-[10px] sm:text-[11px] font-mono shrink-0 ml-2 ${
                it.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--muted-foreground)]'
              }`}
            >
              {it.enabled ? 'Included' : 'Not included'}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                it.enabled ? 'bg-emerald-500' : 'bg-[var(--border)]'
              }`}
              style={{ width: it.enabled ? '100%' : '30%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuthStore();
  const { data: usage } = useStorageUsage();
  const { data: filesData } = useStorageFiles();

  const sub = user?.subscription;
  const pkg = sub?.package;

  const initials = useMemo(() => {
    const name = user?.full_name || user?.username || 'U';
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }, [user]);

  const isActive =
    String(sub?.status ?? '').toUpperCase() === 'ACTIVE' && sub?.active_to && new Date(sub.active_to) > new Date();

  const cycle = useMemo(() => {
    if (!sub?.active_from || !sub?.active_to) return null;
    const total = daysBetween(sub.active_from, sub.active_to);
    const elapsed = Math.min(total, Math.max(0, daysBetween(sub.active_from, new Date())));
    const remaining = Math.max(0, total - elapsed);
    const pct = total > 0 ? Math.round((elapsed / total) * 100) : 0;
    return { total, elapsed, remaining, pct };
  }, [sub]);

  const storage = useMemo(() => {
    const used = sizeMb(usage?.used_storage);
    const remaining = sizeMb(usage?.remaining_storage);
    const trash = sizeMb(usage?.on_bin);
    const total = sizeMb(usage?.total_storage) || used + remaining;
    return {
      used,
      remaining,
      trash,
      total,
      pct: total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0,
    };
  }, [usage]);

  const fileCount = useMemo(() => {
    if (!filesData) return 0;
    const root = filesData.files?.length ?? 0;
    const inFolders = (filesData.folders ?? []).reduce((sum, f) => sum + (f.files?.length ?? 0), 0);
    return root + inFolders;
  }, [filesData]);

  const folderCount = filesData?.folders?.length ?? 0;

  const features = pkg
    ? [
        { label: 'Assistant chat', enabled: Boolean(pkg.chat_enabled) },
        { label: 'Image generation', enabled: Boolean(pkg.image_gen_enabled) },
        {
          label: `Max upload (${formatMb((pkg.max_upload_size ?? 0) / 1024 / 1024)})`,
          enabled: true,
        },
        {
          label: `Validity (${pkg.plan_validity ?? '—'} days)`,
          enabled: true,
        },
      ]
    : [];

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Your profile"
        title="Account overview"
        subtitle="Everything about your account, at a glance."
        actions={
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
          >
            Edit profile <ChevronRight size={13} />
          </Link>
        }
      />

      <section className="relative border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden mb-2.5 sm:mb-3">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(46,92,74,0.06), rgba(107,144,130,0.02))',
          }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 bg-[var(--primary)] text-[var(--primary-foreground)] font-extrabold font-manrope text-xl sm:text-2xl shadow-sm">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold font-manrope text-lg sm:text-xl text-[var(--foreground)] truncate">
              {user?.full_name || user?.username || 'Your account'}
            </h1>
            <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] truncate">
              @{user?.username || '—'}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-[var(--muted-foreground)]">
                <Mail size={11} />
                {user?.email || '—'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-[var(--muted-foreground)]">
                <Phone size={11} />
                {user?.phone || '—'}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-1 rounded-md uppercase ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              <ShieldCheck size={10} />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
        <Stat label="Files" value={fileCount} sub="In your drive" icon={Cloud} />
        <Stat label="Folders" value={folderCount} sub="Organized" icon={FolderSafe} />
        <Stat label="Storage used" value={formatMb(storage.used)} sub={`of ${formatMb(storage.total)}`} icon={Cloud} />
        <Stat
          label="Plan"
          value={pkg?.name ? pkg.name : '—'}
          sub={isActive ? `Ends ${formatDate(sub?.active_to)}` : 'No active plan'}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
        <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Storage</h2>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Where your space is going
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
              {storage.pct}% USED
            </span>
          </div>

          <div className="flex items-center gap-4 flex-1">
            <Donut
              size={130}
              stroke={16}
              segments={[
                { value: storage.used - storage.trash || 0.001, color: 'var(--primary)' },
                { value: storage.trash, color: '#f59e0b' },
                { value: storage.remaining, color: 'var(--muted)' },
              ]}
              centerLabel={formatMb(storage.used)}
              centerSub={`of ${formatMb(storage.total)}`}
            />

            <div className="flex-1 space-y-2">
              <Legend
                color="var(--primary)"
                label="Files"
                value={formatMb(Math.max(0, storage.used - storage.trash))}
              />
              <Legend color="#f59e0b" label="Trash" value={formatMb(storage.trash)} />
              <Legend color="var(--muted-foreground)" label="Available" value={formatMb(storage.remaining)} />
            </div>
          </div>

          <div className="mt-3 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/50 border border-[var(--border)] rounded-md px-2 py-1.5 leading-tight">
            Empty Trash to immediately reclaim space.
          </div>
        </section>

        <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Subscription</h2>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                {pkg?.name ?? 'No plan'}
                {pkg?.price != null && ` · ${inr(pkg.price)}`}
              </div>
            </div>
            <span
              className={`text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md uppercase ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {cycle ? (
            <>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                  {cycle.remaining} day{cycle.remaining === 1 ? '' : 's'} left
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                  {cycle.elapsed}/{cycle.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-700"
                  style={{ width: `${cycle.pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-1.5">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(sub?.active_from)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(sub?.active_to)}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-2">
                  Plan features
                </div>
                <FeatureBars items={features} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-2">
                <ShieldCheck size={18} />
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mb-3 max-w-[220px]">
                No subscription on file. Pick a plan to unlock storage and AI features.
              </p>
              <Link
                to="/plans"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
              >
                View plans <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </section>
      </div>

      {pkg && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-2.5 sm:mt-3">
          <FeatureChip icon={MessageCircle} label="Assistant" enabled={pkg.chat_enabled} />
          <FeatureChip icon={ImageIcon} label="Image gen" enabled={pkg.image_gen_enabled} />
          <FeatureChip icon={Cloud} label={`${formatMb((pkg.max_upload_size ?? 0) / 1024 / 1024)} max`} enabled />
          <FeatureChip icon={Calendar} label={`${pkg.plan_validity ?? '—'} day cycle`} enabled />
        </div>
      )}
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
      <span className="text-[11px] sm:text-xs text-[var(--foreground)] flex-1 truncate">{label}</span>
      <span className="text-[10px] sm:text-[11px] font-mono text-[var(--muted-foreground)] shrink-0">{value}</span>
    </div>
  );
}

function FeatureChip({ icon: Icon, label, enabled }) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${
        enabled
          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
          : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]'
      }`}
    >
      <Icon size={13} className="shrink-0" />
      <span className="text-[11px] sm:text-xs font-semibold truncate flex-1">{label}</span>
      {enabled ? <Check size={12} /> : <X size={12} />}
    </div>
  );
}

import { Folder as FolderIcon } from 'lucide-react';
import Stat from './shared/Stats';
function FolderSafe(props) {
  return <FolderIcon {...props} />;
}

export default ProfilePage;
