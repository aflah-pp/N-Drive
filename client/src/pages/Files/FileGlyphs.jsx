import { FileImage, FileText, Folder, LayoutGrid } from 'lucide-react';

const FILE_STYLES = {
  pdf: { Icon: FileText, cls: 'bg-rose-500/10 text-rose-500' },
  doc: { Icon: FileText, cls: 'bg-blue-500/10 text-blue-500' },
  img: { Icon: FileImage, cls: 'bg-emerald-500/10 text-emerald-500' },
  fig: { Icon: LayoutGrid, cls: 'bg-violet-500/10 text-violet-500' },
  folder: { Icon: Folder, cls: 'bg-amber-500/10 text-amber-500' },
};

const FileGlyph = ({ type, size = 15 }) => {
  const { Icon, cls } = FILE_STYLES[type] ?? FILE_STYLES.doc;
  return (
    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${cls}`} aria-hidden="true">
      <Icon size={size} />
    </div>
  );
};

export default FileGlyph;
