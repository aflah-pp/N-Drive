// import { ChartAreaInteractive } from '@/components/chart-area-interactive';
// import { DataTable } from '@/components/data-table';
// import { SectionCards } from '@/components/section-cards';
// import data from './data.json';

// export default function Page() {
//   return (
//     <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//       <SectionCards />
//       <div className="px-4 lg:px-6">
//         <ChartAreaInteractive />
//       </div>
//       <DataTable data={data} />
//     </div>
//   );
// }

import {
  ArrowRight,
  ChevronRight,
  Clock3,
  FileImage,
  FileText,
  Folder,
  HardDrive,
  LayoutGrid,
  MessageCircle,
  MoreHorizontal,
  Receipt,
  ShieldCheck,
  Sparkles,
  Upload,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHead from './pages/PageHead';

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
    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${cls}`} aria-hidden="true">
      <Icon size={15} />
    </div>
  );
}

function Stat({ label, value, note, icon: Icon }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold truncate">
          {label}
        </span>
        <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
          <Icon size={14} />
        </span>
      </div>
      <div className="font-extrabold font-manrope text-lg sm:text-xl text-[var(--foreground)] tracking-tight">
        {value}
      </div>
      <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">{note}</div>
    </div>
  );
}

export function Overview({ files = [], folders = [], notify = () => {} }) {
  const recentFiles = files.slice(0, 4);
  const recentFolders = folders.slice(0, 4);

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Tuesday, 20 May 2025"
        title="Good morning, Aanya"
        subtitle="Your space is ready. Pick up where you left off."
        actions={
          <>
            <Link
              href="/files"
              data-testid="link-view-files"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
            >
              <Folder size={14} /> Browse files
            </Link>
            <Link
              href="/files"
              data-testid="link-upload-file"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <Upload size={14} /> Add files
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        <Stat label="Files in your drive" value="28" note="Across 4 folders" icon={FileText} />
        <Stat label="Storage used" value="4.8 GB" note="Of 9 GB available" icon={HardDrive} />
        <Stat label="Images created" value="12" note="3 this month" icon={Sparkles} />
        <Stat label="Plan renews" value="12 Jun" note="Plus · ₹210.50 / 28 days" icon={Clock3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm flex flex-col">
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-2">
            Your cloud space
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <strong className="font-extrabold font-manrope text-xl sm:text-2xl text-[var(--foreground)] tracking-tight">
              4.8 GB
            </strong>
            <span className="text-[11px] sm:text-xs text-[var(--muted-foreground)]">of 9 GB used</span>
          </div>
          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '53.3%' }} />
          </div>
          <div className="flex justify-between text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-2">
            <span>53% used</span>
            <span>4.2 GB remaining</span>
          </div>
          <Link
            href="/plans"
            data-testid="link-upgrade-storage"
            className="mt-3 self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
          >
            Explore more space <ArrowRight size={13} />
          </Link>
        </section>

        <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Your membership</h2>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                A few details, all in one place.
              </div>
            </div>
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
              Current plan
            </div>
            <div className="font-extrabold font-manrope text-xl text-[var(--foreground)] mt-1">Plus</div>
            <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">
              Active until <strong className="text-[var(--foreground)] font-semibold">12 June 2025</strong>
            </div>
          </div>
          <Link
            href="/plans"
            data-testid="link-manage-plan"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            Manage plan <ArrowRight size={12} />
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
            <div className="min-w-0">
              <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Recently added</h2>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                The latest from your workspace
              </div>
            </div>
            <Link
              href="/files"
              data-testid="link-recent-all"
              className="text-[11px] font-semibold text-[var(--primary)] hover:opacity-80 inline-flex items-center gap-1 shrink-0"
            >
              See all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                data-testid={`row-recent-${file.id}`}
                className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 hover:bg-[var(--muted)]/40 transition-colors"
              >
                <FileGlyph type={file.type} />
                <div className="min-w-0 flex-1">
                  <strong className="block font-medium text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
                    {file.name}
                  </strong>
                  <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                    {file.date}
                  </span>
                </div>
                <span className="shrink-0 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] font-mono whitespace-nowrap">
                  {file.size}
                </span>
                <button
                  type="button"
                  aria-label={`More actions for ${file.name}`}
                  data-testid={`button-recent-${file.id}`}
                  onClick={() => notify(`Opened ${file.name}`)}
                  className="shrink-0 w-7 h-7 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center transition-colors active:scale-95"
                >
                  <MoreHorizontal size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
            <div className="min-w-0">
              <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Your folders</h2>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                A little order goes a long way.
              </div>
            </div>
            <Link
              href="/files"
              data-testid="link-folders-all"
              className="text-[11px] font-semibold text-[var(--primary)] hover:opacity-80 inline-flex items-center gap-1 shrink-0"
            >
              Browse <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentFolders.map((folder) => (
              <Link
                key={folder.id}
                href="/files"
                data-testid={`row-folder-${folder.id}`}
                className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 hover:bg-[var(--muted)]/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500">
                  <Folder size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block font-medium text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
                    {folder.name}
                  </strong>
                  <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                    {folder.count} items · updated {folder.date}
                  </span>
                </div>
                <ChevronRight size={14} className="shrink-0 text-[var(--muted-foreground)]" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
        <Link
          href="/assistant"
          data-testid="tile-assistant"
          className="group border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            <MessageCircle size={17} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
              Think it through
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug line-clamp-2">
              Open a private demo conversation with N-drive assistant.
            </p>
          </div>
        </Link>
        <Link
          href="/images"
          data-testid="tile-images"
          className="group border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-500">
            <WandSparkles size={17} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
              Make something visual
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug line-clamp-2">
              Turn a good prompt into a local image preview.
            </p>
          </div>
        </Link>
        <Link
          href="/billing"
          data-testid="tile-billing"
          className="group border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Receipt size={17} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
              Find a receipt
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug line-clamp-2">
              All your subscription transactions, neatly kept.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Overview;
