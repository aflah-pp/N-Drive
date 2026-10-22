import { Download } from 'lucide-react';
import { toast } from 'sonner';

const FileDownloadButton = ({ file }) => {
  const handleDownload = (e) => {
    e.preventDefault();
    const targetUrl = file?.raw?.file_url;
    if (!targetUrl) return;
    const forcedDownloadUrl = targetUrl.replace('/upload/', '/upload/fl_attachment/');
    const hiddenLink = document.createElement('a');
    hiddenLink.href = forcedDownloadUrl;
    hiddenLink.download = file?.name || file?.raw?.filename || 'download';

    document.body.appendChild(hiddenLink);
    hiddenLink.click();
    document.body.removeChild(hiddenLink);
    toast.success('File Downloading');
  };

  return (
    <button
      onClick={handleDownload}
      aria-label={`Download ${file?.name}`}
      className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
    >
      <Download size={14} />
    </button>
  );
};

export default FileDownloadButton;
