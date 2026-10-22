import {
  ArrowRight,
  ChevronRight,
  Clock3,
  FileText,
  Folder,
  HardDrive,
  MessageCircle,
  MoreHorizontal,
  Receipt,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStorageUsage } from '../hooks/use-storage';
import useAuthStore from '../service/store/authStore';
import FileGlyph from './Files/FileGlyphs';
import PageHead from './shared/PageHead';
import PlanCard from './shared/PlanCard';
import Stat from './shared/Stats';
import { StorageCard } from './shared/StorageCard';

export function Overview({ files = [], folders = [], notify = () => {} }) {
  const { user } = useAuthStore();
  const { data: usage } = useStorageUsage();

  const recentFiles = files.slice(0, 4);
  const recentFolders = folders.slice(0, 4);

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Tuesday, 20 May 2025"
        title={`Good morning, ${user?.username}`}
        subtitle="Your space is ready. Pick up where you left off."
        actions={
          <>
            <Link
              to={'/files'}
              data-testid="link-view-files"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
            >
              <Folder size={14} /> Browse files
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        <Stat label="Files in your drive" value="28" note="Across 4 folders" icon={FileText} />
        <Stat label="Storage used" value={`${usage?.used_storage}`} note={`${usage?.total_storage}`} icon={HardDrive} />
        <Stat label="Images created" value="12" note="3 this month" icon={Sparkles} />
        <Stat label="Plan renews" value={`${user?.subscription?.active_to || 'Free'}`} icon={Clock3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        <StorageCard />
        <PlanCard />
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
              to={'/files'}
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
              to={'/files'}
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
                to={'/files'}
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
          to={'/ai/chat'}
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
          to={'/ai/studio'}
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
          to={'/invoice'}
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
