/* eslint-disable no-unused-vars */
import {
  ArrowRight,
  FileImage,
  FileText,
  Folder,
  Image as ImageIcon,
  LayoutGrid,
  Receipt,
  Search as SearchIcon,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHead from './PageHead';

const dummySearchIndex = {
  files: [
    { id: 'f-1', name: 'Q2 brand direction.pdf', type: 'pdf', size: '8.4 MB', date: 'Today, 10:42 AM', href: '/files' },
    {
      id: 'f-2',
      name: 'Product launch notes.docx',
      type: 'doc',
      size: '1.2 MB',
      date: 'Today, 9:18 AM',
      href: '/files',
    },
    { id: 'f-3', name: 'monsoon-campaign.jpg', type: 'img', size: '4.8 MB', date: 'Yesterday', href: '/files' },
    { id: 'f-4', name: 'invoice-april-2025.pdf', type: 'pdf', size: '284 KB', date: 'May 12, 2025', href: '/files' },
    { id: 'f-5', name: 'Homepage wireframes.fig', type: 'fig', size: '16.7 MB', date: 'May 10, 2025', href: '/files' },
    { id: 'f-6', name: 'Research synthesis.pdf', type: 'pdf', size: '3.1 MB', date: 'May 8, 2025', href: '/files' },
    { id: 'f-7', name: 'Interview highlights.docx', type: 'doc', size: '960 KB', date: 'May 7, 2025', href: '/files' },
    { id: 'f-8', name: 'Field-notes-mumbai.pdf', type: 'pdf', size: '5.2 MB', date: 'May 6, 2025', href: '/files' },
    { id: 'f-9', name: 'April moodboard.png', type: 'img', size: '6.3 MB', date: 'May 2, 2025', href: '/files' },
  ],
  folders: [
    { id: 'folder-projects', name: 'Projects', count: 8, date: 'May 14, 2025', href: '/files' },
    { id: 'folder-research', name: 'Research', count: 3, date: 'May 8, 2025', href: '/files' },
    { id: 'folder-inspo', name: 'Inspiration', count: 5, date: 'May 2, 2025', href: '/files' },
    { id: 'folder-personal', name: 'Personal', count: 12, date: 'Apr 28, 2025', href: '/files' },
    { id: 'folder-archive', name: 'Archive 2024', count: 24, date: 'Apr 20, 2025', href: '/files' },
  ],
  images: [
    { id: 'img-1', title: 'A quiet monsoon morning', date: 'Today · 11:08 AM', style: 'art-one', href: '/images' },
    { id: 'img-2', title: 'Objects in soft light', date: 'Yesterday · 4:42 PM', style: 'art-two', href: '/images' },
    { id: 'img-3', title: 'The botanical archive', date: 'May 12 · 2:17 PM', style: 'art-three', href: '/images' },
    { id: 'img-4', title: 'Terracotta rooftops at dusk', date: 'May 10 · 9:31 AM', style: 'art-one', href: '/images' },
  ],
  transactions: [
    {
      id: 'TXN-250514-84KQ',
      package: 'Plus · 28 days',
      amount: 210.5,
      date: '14 May 2025',
      status: 'completed',
      href: '/billing',
    },
    {
      id: 'TXN-250416-3LM2',
      package: 'Plus · 28 days',
      amount: 210.5,
      date: '16 Apr 2025',
      status: 'completed',
      href: '/billing',
    },
    {
      id: 'TXN-250319-9FWA',
      package: 'Plus · 28 days',
      amount: 210.5,
      date: '19 Mar 2025',
      status: 'completed',
      href: '/billing',
    },
    {
      id: 'TXN-250218-0PXL',
      package: 'Plus · 28 days',
      amount: 210.5,
      date: '18 Feb 2025',
      status: 'failed',
      href: '/billing',
    },
  ],
};

const RECENT_SEARCHES = ['brand direction', 'invoice', 'monsoon', 'TXN-2505', 'wireframe'];

const FILE_ICON = {
  pdf: { Icon: FileText, cls: 'bg-rose-500/10 text-rose-500' },
  doc: { Icon: FileText, cls: 'bg-blue-500/10 text-blue-500' },
  img: { Icon: FileImage, cls: 'bg-emerald-500/10 text-emerald-500' },
  fig: { Icon: LayoutGrid, cls: 'bg-violet-500/10 text-violet-500' },
};

const PALETTES = {
  'art-one': 'linear-gradient(150deg,#6b9082,#d6a67d 47%,#ba6d58)',
  'art-two': 'linear-gradient(130deg,#d1d7c5,#75988b 44%,#374f4b)',
  'art-three': 'linear-gradient(130deg,#798d78,#e9dfc4 48%,#bf7964)',
};

const FILTERS = ['All', 'Files', 'Folders', 'Images', 'Transactions'];

function Highlight({ text, query }) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[var(--primary)]/20 text-[var(--foreground)] rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function FileRow({ item, query }) {
  const { Icon, cls } = FILE_ICON[item.type] ?? FILE_ICON.doc;
  return (
    <Link
      href={item.href}
      data-testid={`search-file-${item.id}`}
      className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors"
    >
      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${cls}`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <strong className="block font-medium text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
          <Highlight text={item.name} query={query} />
        </strong>
        <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">{item.date}</span>
      </div>
      <span className="shrink-0 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] font-mono">{item.size}</span>
    </Link>
  );
}

function FolderRow({ item, query }) {
  return (
    <Link
      href={item.href}
      data-testid={`search-folder-${item.id}`}
      className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500">
        <Folder size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <strong className="block font-medium text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
          <Highlight text={item.name} query={query} />
        </strong>
        <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
          {item.count} items · updated {item.date}
        </span>
      </div>
      <ArrowRight size={13} className="shrink-0 text-[var(--muted-foreground)]" />
    </Link>
  );
}

function ImageRow({ item, query }) {
  return (
    <Link
      href={item.href}
      data-testid={`search-image-${item.id}`}
      className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors"
    >
      <div
        className="w-10 h-10 rounded-md shrink-0"
        style={{ background: PALETTES[item.style] ?? PALETTES['art-one'] }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <strong className="block font-medium text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
          <Highlight text={item.title} query={query} />
        </strong>
        <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
          {item.date} · local preview
        </span>
      </div>
      <Sparkles size={13} className="shrink-0 text-fuchsia-500" />
    </Link>
  );
}

function TransactionRow({ item, query }) {
  const failed = item.status === 'failed';
  return (
    <Link
      href={item.href}
      data-testid={`search-transaction-${item.id}`}
      className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Receipt size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <strong className="block font-mono text-[11px] sm:text-[12px] text-[var(--foreground)] truncate">
          <Highlight text={item.id} query={query} />
        </strong>
        <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
          {item.package} · {item.date}
        </span>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[11px] sm:text-xs font-bold text-[var(--foreground)]">₹{item.amount.toFixed(2)}</div>
        <span
          className={`inline-block mt-0.5 text-[9px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
            failed
              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {item.status}
        </span>
      </div>
    </Link>
  );
}

function Group({ title, count, icon: Icon, children }) {
  if (count === 0) return null;
  return (
    <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
          <Icon size={14} />
        </div>
        <h2 className="font-bold font-manrope text-sm text-[var(--foreground)]">{title}</h2>
        <span className="ml-auto text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
          {count}
        </span>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function SearchPage({ index = dummySearchIndex, recentSearches: recentProp }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [recents, setRecents] = useState(recentProp ?? RECENT_SEARCHES);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const q = query.toLowerCase().trim();

  const match = (text) => q && text.toLowerCase().includes(q);

  const results = useMemo(() => {
    const files = index.files.filter((f) => match(f.name));
    const folders = index.folders.filter((f) => match(f.name));
    const images = index.images.filter((i) => match(i.title));
    const transactions = index.transactions.filter((t) => match(t.id) || match(t.package) || match(t.status));
    return { files, folders, images, transactions };
  }, [index, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = {
    files: results.files.length,
    folders: results.folders.length,
    images: results.images.length,
    transactions: results.transactions.length,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const show = (key) => filter === 'All' || filter === key;
  const noQuery = q.length === 0;
  const noResults = !noQuery && total === 0;

  const commitRecent = (term) => {
    const t = term.trim();
    if (!t) return;
    setRecents((old) => [t, ...old.filter((r) => r !== t)].slice(0, 6));
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Find anything, fast"
        title="Search"
        subtitle="Search across your files, folders, images, and billing history."
      />

      <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 mb-2.5 sm:mb-3 shrink-0 shadow-sm">
        <label
          htmlFor="search-input"
          className="relative flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] focus-within:ring-2 focus-within:ring-[var(--ring)] transition-shadow"
        >
          <SearchIcon size={15} className="absolute left-3 text-[var(--muted-foreground)]" />
          <input
            id="search-input"
            ref={inputRef}
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRecent(query);
            }}
            onBlur={() => commitRecent(query)}
            placeholder="Search files, folders, images, transactions…"
            data-testid="input-search"
            className="w-full bg-transparent outline-none text-[13px] sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] pl-9 pr-20 py-2.5"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="absolute right-2 hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-[var(--muted-foreground)] px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)]/50">
              ⌘K
            </span>
          )}
        </label>

        {noQuery && recents.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mr-1">
              Recent
            </span>
            {recents.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                data-testid={`recent-${term}`}
                className="text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-[0.97]"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {!noQuery && (
        <div className="flex items-center gap-2 mb-2.5 sm:mb-3 shrink-0 flex-wrap">
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--card)]">
            {FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setFilter(label)}
                data-testid={`search-filter-${label.toLowerCase()}`}
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
          <span className="ml-auto text-[11px] sm:text-xs text-[var(--muted-foreground)]">
            {total} {total === 1 ? 'result' : 'results'}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {noQuery && (
          <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4 border border-dashed border-[var(--border)] rounded-[var(--radius)] bg-[var(--card)]/50">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
              <SearchIcon size={22} />
            </div>
            <h3 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">
              Start typing to search
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed">
              Search matches file names, folder names, image titles and transaction references.
            </p>
          </div>
        )}

        {noResults && (
          <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4 border border-dashed border-[var(--border)] rounded-[var(--radius)] bg-[var(--card)]/50">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
              <SearchIcon size={22} />
            </div>
            <h3 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">
              No matches for “{query}”
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed">
              Try a shorter term, or search a different category.
            </p>
          </div>
        )}

        {!noQuery && !noResults && (
          <>
            {show('Files') && (
              <Group title="Files" count={counts.files} icon={FileText}>
                {results.files.map((f) => (
                  <FileRow key={f.id} item={f} query={query} />
                ))}
              </Group>
            )}

            {show('Folders') && (
              <Group title="Folders" count={counts.folders} icon={Folder}>
                {results.folders.map((f) => (
                  <FolderRow key={f.id} item={f} query={query} />
                ))}
              </Group>
            )}

            {show('Images') && (
              <Group title="Images" count={counts.images} icon={ImageIcon}>
                {results.images.map((i) => (
                  <ImageRow key={i.id} item={i} query={query} />
                ))}
              </Group>
            )}

            {show('Transactions') && (
              <Group title="Transactions" count={counts.transactions} icon={Receipt}>
                {results.transactions.map((t) => (
                  <TransactionRow key={t.id} item={t} query={query} />
                ))}
              </Group>
            )}
          </>
        )}
      </div>

      <div className="mt-2 sm:mt-3 shrink-0 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2.5 py-1.5 leading-tight">
        Search runs locally against demo content. Press{' '}
        <kbd className="font-mono text-[10px] bg-[var(--card)] border border-[var(--border)] rounded px-1">⌘K</kbd>{' '}
        anywhere to focus the input.
      </div>
    </div>
  );
}

export default SearchPage;
