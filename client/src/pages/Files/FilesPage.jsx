/* eslint-disable no-unused-vars */
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Download,
  Eye,
  Folder,
  FolderPlus,
  LayoutGrid,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { useStorageFiles } from '@/hooks/use-storage';
import { CreateFolderDialog } from '../modals/CreateFolderModal';
import { DeleteConfirmDialog } from '../modals/DeleteFileModal';
import { UploadFileDialog } from '../modals/UploadFileModal';
import PageHead from '../shared/PageHead';
import FileGlyph from './FileGlyphs';

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
  if (value == null) return '0 B';
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
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today - target) / 86_400_000);
  if (diffDays === 0) {
    const t = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `Today, ${t}`;
  }
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const transformFile = (raw) => ({
  id: raw.id,
  name: raw.filename,
  type: getFileType(raw.filename),
  size: formatSize(raw.size),
  date: formatDate(raw.uploaded_at),
  raw,
});

const transformFolder = (raw) => ({
  id: raw.id,
  name: raw.name,
  date: formatDate(raw.created_at),
  count: raw.files?.length ?? 0,
  files: (raw.files ?? []).map(transformFile),
  raw,
});

function Empty({ icon: Icon = Folder, title, copy, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 sm:py-14 px-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
        <Icon size={22} />
      </div>
      <h3 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed mb-3">{copy}</p>
      {action}
    </div>
  );
}

export function FilesPage() {
  const { data, isLoading, isError, refetch } = useStorageFiles();
  const [view, setView] = useState('All items');
  const [sort, setSort] = useState('recent');
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const folders = useMemo(() => (data?.folders ?? []).map(transformFolder), [data]);
  const rootFiles = useMemo(() => (data?.files ?? []).map(transformFile), [data]);

  const activeFolder = activeFolderId ? (folders.find((f) => f.id === activeFolderId) ?? null) : null;

  const visibleFiles = activeFolder ? activeFolder.files : rootFiles;
  const shownFolders = activeFolder || view === 'Files' ? [] : folders;
  const shownFiles = view === 'Folders' ? [] : visibleFiles;

  const sortedFiles = useMemo(() => {
    const copy = [...shownFiles];
    if (sort === 'name') {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      copy.sort((a, b) => (b.raw.uploaded_at ?? '').localeCompare(a.raw.uploaded_at ?? ''));
    }
    return copy;
  }, [shownFiles, sort]);

  const openFolder = (folder) => {
    setActiveFolderId(folder.id);
    setView('All items');
  };

  const goBack = () => setActiveFolderId(null);

  const handleUploadClose = (open) => {
    setUploadOpen(open);
    if (!open) refetch();
  };

  const handleFolderClose = (open) => {
    setFolderOpen(open);
    if (!open) refetch();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Your workspace"
        title={activeFolder ? activeFolder.name : 'My files'}
        subtitle={
          activeFolder
            ? 'Everything you’ve placed in this folder.'
            : 'A home for the work, ideas and keepsakes you want to keep.'
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => setFolderOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
            >
              <FolderPlus size={14} /> New folder
            </button>
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <Upload size={14} /> Upload files
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-3 shrink-0">
        {activeFolder && (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
          >
            <ArrowLeft size={13} /> All files
          </button>
        )}

        <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          {['All items', 'Files', 'Folders'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setView(label)}
              className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors ${
                view === label
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          aria-label="Grid view"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-95"
        >
          <LayoutGrid size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
        </div>
      ) : isError ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-3">Couldn’t load your files.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <>
          {shownFolders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
              {shownFolders.map((folder) => (
                <div
                  key={folder.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openFolder(folder)}
                  onKeyDown={(e) => e.key === 'Enter' && openFolder(folder)}
                  className="group border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-[var(--primary)]/40 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500">
                      <Folder size={18} />
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete ${folder.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({
                          id: folder.id,
                          name: folder.name,
                          kind: 'folder',
                        });
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-colors active:scale-95 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <strong className="block font-semibold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
                    {folder.name}
                  </strong>
                  <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">
                    {folder.count} items · Updated {folder.date}
                  </span>
                </div>
              ))}
            </div>
          )}

          <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
              <div className="min-w-0">
                <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">
                  {activeFolder ? 'Folder contents' : 'Recently updated'}
                </h2>
                <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  {shownFiles.length} {shownFiles.length === 1 ? 'file' : 'files'} · stored in your personal drive
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSort(sort === 'recent' ? 'name' : 'recent')}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity shrink-0"
              >
                {sort === 'recent' ? 'Last modified' : 'Name'}
                <ChevronDown size={12} />
              </button>
            </div>

            {sortedFiles.length === 0 ? (
              <Empty
                icon={Folder}
                title="Nothing here just yet"
                copy="Your files will show up here when you add them to this space."
                action={
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98]"
                  >
                    <Upload size={13} /> Add a file
                  </button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold bg-[var(--muted)]/40">
                      <th className="px-3 sm:px-4 py-2 font-semibold">Name</th>
                      <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Size</th>
                      <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap">Modified</th>
                      <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap hidden md:table-cell">
                        Location
                      </th>
                      <th className="px-3 sm:px-4 py-2 font-semibold text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors"
                      >
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileGlyph type={file.type} />
                            <span className="font-medium text-[var(--foreground)] truncate max-w-[160px] sm:max-w-none">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--muted-foreground)] whitespace-nowrap font-mono">
                          {file.size}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                          {file.date}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[var(--muted-foreground)] whitespace-nowrap hidden md:table-cell">
                          {activeFolder?.name || 'My drive'}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <a
                              href={file.raw.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Preview ${file.name}`}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
                            >
                              <Eye size={14} />
                            </a>
                            <a
                              href={file.raw.unique_link_url}
                              aria-label={`Download ${file.name}`}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
                            >
                              <Download size={14} />
                            </a>
                            <button
                              type="button"
                              aria-label={`Copy link for ${file.name}`}
                              onClick={() => {
                                navigator.clipboard?.writeText(file.raw.unique_link_url);
                              }}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${file.name}`}
                              onClick={() =>
                                setDeleteTarget({
                                  id: file.id,
                                  name: file.name,
                                  kind: 'file',
                                })
                              }
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-colors active:scale-95"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <div className="mt-2 sm:mt-3 shrink-0 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2.5 py-1.5 leading-tight">
        Files are stored on the server. Uploads and deletions refresh storage in the background.
      </div>

      <UploadFileDialog open={uploadOpen} onOpenChange={handleUploadClose} folderId={activeFolder?.id ?? null} />
      <CreateFolderDialog open={folderOpen} onOpenChange={handleFolderClose} />
      <DeleteConfirmDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          if (deleteTarget?.kind === 'folder' && deleteTarget.id === activeFolderId) {
            setActiveFolderId(null);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default FilesPage;
