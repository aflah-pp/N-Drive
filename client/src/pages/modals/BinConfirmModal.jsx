import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const COPY = {
  restore: {
    title: (ctx) => (ctx?.name ? `Restore “${ctx.name}”?` : 'Restore item?'),
    description: (ctx) =>
      ctx?.name
        ? `“${ctx.name}” will be restored to your drive and removed from Trash.`
        : 'This item will be restored to your drive.',
    action: 'Restore',
    tone: 'primary',
  },
  restoreAll: {
    title: () => 'Restore everything?',
    description: (ctx) =>
      `${ctx?.count ?? 0} item${(ctx?.count ?? 0) === 1 ? '' : 's'} will be restored to your drive and removed from Trash.`,
    action: 'Restore all',
    tone: 'primary',
  },
  clear: {
    title: () => 'Empty the Trash?',
    description: (ctx) =>
      `${ctx?.count ?? 0} item${(ctx?.count ?? 0) === 1 ? '' : 's'} will be permanently deleted. This cannot be undone.`,
    action: 'Empty trash',
    tone: 'danger',
  },
};

export function BinConfirmDialog({ intent, context, onClose, onConfirm, busy }) {
  const conf = intent ? COPY[intent] : null;

  return (
    <AlertDialog open={!!intent} onOpenChange={(v) => !v && !busy && onClose()}>
      <AlertDialogContent>
        {conf && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>{conf.title(context)}</AlertDialogTitle>
              <AlertDialogDescription>{conf.description(context)}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={busy}
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
                className={conf.tone === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
              >
                {busy ? 'Working…' : conf.action}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
