/* eslint-disable no-unused-vars */
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileImage,
  FileText,
  Folder,
  FolderPlus,
  LayoutGrid,
  MoreHorizontal,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import PageHead from './PageHead';

const FILE_STYLES = {
  pdf: { Icon: FileText, cls: 'bg-rose-500/10 text-rose-500' },
  doc: { Icon: FileText, cls: 'bg-blue-500/10 text-blue-500' },
  img: { Icon: FileImage, cls: 'bg-emerald-500/10 text-emerald-500' },
  fig: { Icon: LayoutGrid, cls: 'bg-violet-500/10 text-violet-500' },
  folder: { Icon: Folder, cls: 'bg-amber-500/10 text-amber-500' },
};

function FileGlyph({ type, size = 15 }) {
  const { Icon, cls } = FILE_STYLES[type] ?? FILE_STYLES.doc;
  return (
    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${cls}`} aria-hidden="true">
      <Icon size={size} />
    </div>
  );
}

function Empty({ icon: Icon = Folder, title, copy, action }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-10 sm:py-14 px-4"
      data-testid="empty-state"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
        <Icon size={22} />
      </div>
      <h3 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed mb-3">{copy}</p>
      {action}
    </div>
  );
}

const dummyFiles = [
  { id: 'f-1', name: 'Q2 brand direction.pdf', type: 'pdf', size: '8.4 MB', date: 'Today, 10:42 AM', folder: 'root' },
  { id: 'f-2', name: 'Product launch notes.docx', type: 'doc', size: '1.2 MB', date: 'Today, 9:18 AM', folder: 'root' },
  { id: 'f-3', name: 'monsoon-campaign.jpg', type: 'img', size: '4.8 MB', date: 'Yesterday', folder: 'root' },
  { id: 'f-4', name: 'invoice-april-2025.pdf', type: 'pdf', size: '284 KB', date: 'May 12, 2025', folder: 'root' },
  { id: 'f-5', name: 'Homepage wireframes.fig', type: 'fig', size: '16.7 MB', date: 'May 10, 2025', folder: 'root' },
  { id: 'f-6', name: 'Research synthesis.pdf', type: 'pdf', size: '3.1 MB', date: 'May 8, 2025', folder: 'root' },
  { id: 'f-7', name: 'Interview highlights.docx', type: 'doc', size: '960 KB', date: 'May 7, 2025', folder: 'root' },
  { id: 'f-8', name: 'Field-notes-mumbai.pdf', type: 'pdf', size: '5.2 MB', date: 'May 6, 2025', folder: 'root' },
  { id: 'f-9', name: 'April moodboard.png', type: 'img', size: '6.3 MB', date: 'May 2, 2025', folder: 'root' },
];

const dummyFolders = [
  { id: 'folder-projects', name: 'Projects', date: 'May 14, 2025', count: 8 },
  { id: 'folder-research', name: 'Research', date: 'May 8, 2025', count: 3 },
  { id: 'folder-inspo', name: 'Inspiration', date: 'May 2, 2025', count: 5 },
  { id: 'folder-personal', name: 'Personal', date: 'Apr 28, 2025', count: 12 },
  { id: 'folder-archive', name: 'Archive 2024', date: 'Apr 20, 2025', count: 24 },
  { id: 'folder-clients', name: 'Client work', date: 'Apr 15, 2025', count: 7 },
];

export function FilesPage({
  files = dummyFiles,
  folders = dummyFolders,
  activeFolder = null,
  setActiveFolder = () => {},
  onFolder = () => {},
  onUpload = () => {},
  onDelete = () => {},
  onOpenFolder = () => {},
  onAction = () => {},
  onBack = () => {},
}) {
  const [view, setView] = useState('All items');
  const shownFolders = activeFolder ? [] : folders;
  const visibleFiles = view === 'Folders' ? [] : files;

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
              onClick={onFolder}
              data-testid="button-new-folder"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
            >
              <FolderPlus size={14} /> New folder
            </button>
            <button
              type="button"
              onClick={onUpload}
              data-testid="button-upload-files"
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
            onClick={onBack}
            data-testid="button-back-root"
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
              data-testid={`filter-${label.toLowerCase()}`}
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
          data-testid="button-grid-view"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-95"
        >
          <LayoutGrid size={14} />
        </button>
      </div>

      {shownFolders.length > 0 && view !== 'Files' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
          {shownFolders.map((folder) => (
            <div
              key={folder.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenFolder(folder)}
              onKeyDown={(e) => e.key === 'Enter' && onOpenFolder(folder)}
              data-testid={`card-folder-${folder.id}`}
              className="group border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-[var(--primary)]/40 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500">
                  <Folder size={18} />
                </div>
                <button
                  type="button"
                  aria-label={`Folder options ${folder.name}`}
                  data-testid={`button-folder-options-${folder.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(folder);
                  }}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-colors active:scale-95 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <MoreHorizontal size={15} />
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
              {files.length} {files.length === 1 ? 'item' : 'items'} · stored in your personal drive
            </div>
          </div>
          <button
            type="button"
            onClick={() => setView(view === 'All items' ? 'Files' : 'All items')}
            data-testid="button-sort-files"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity shrink-0"
          >
            Last modified <ChevronDown size={12} />
          </button>
        </div>

        {visibleFiles.length === 0 ? (
          <Empty
            icon={Folder}
            title="Nothing here just yet"
            copy="Your files will show up here when you add them to this space."
            action={
              <button
                type="button"
                onClick={onUpload}
                data-testid="button-empty-upload"
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
                  <th className="px-3 sm:px-4 py-2 font-semibold whitespace-nowrap hidden md:table-cell">Location</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleFiles.map((file) => (
                  <tr
                    key={file.id}
                    data-testid={`row-file-${file.id}`}
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
                        <button
                          type="button"
                          aria-label={`Preview ${file.name}`}
                          data-testid={`button-preview-${file.id}`}
                          onClick={() => onAction(file, 'preview')}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Download ${file.name}`}
                          data-testid={`button-download-${file.id}`}
                          onClick={() => onAction(file, 'download')}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Share ${file.name}`}
                          data-testid={`button-share-${file.id}`}
                          onClick={() => onAction(file, 'share')}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${file.name} to trash`}
                          data-testid={`button-delete-${file.id}`}
                          onClick={() => onDelete(file)}
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

      <div className="mt-2 sm:mt-3 shrink-0 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2.5 py-1.5 leading-tight">
        Demo workspace · Files you select are shown locally for this session and are not uploaded to a server.
      </div>
    </div>
  );
}

export default FilesPage;
