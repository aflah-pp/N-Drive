import { AlertTriangle, Bell, BellOff, CheckCircle2, FileText, Info, Sparkles, Trash2, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const KIND_STYLES = {
  info: { Icon: Info, cls: 'bg-blue-500/10 text-blue-500', label: 'Info' },
  success: { Icon: CheckCircle2, cls: 'bg-emerald-500/10 text-emerald-500', label: 'Success' },
  warning: { Icon: AlertTriangle, cls: 'bg-amber-500/10 text-amber-500', label: 'Warning' },
  error: { Icon: XCircle, cls: 'bg-red-500/10 text-red-500', label: 'Error' },
  file: { Icon: FileText, cls: 'bg-violet-500/10 text-violet-500', label: 'File' },
  ai: { Icon: Sparkles, cls: 'bg-fuchsia-500/10 text-fuchsia-500', label: 'AI' },
};

export const dummyNotifications = [
  {
    id: 'n-1',
    kind: 'success',
    title: 'Q2 brand direction.pdf uploaded',
    body: 'The file is now available in My files.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'n-2',
    kind: 'ai',
    title: 'Your image preview is ready',
    body: '“A quiet monsoon morning” was added to your gallery.',
    time: '18 min ago',
    read: false,
  },
  {
    id: 'n-3',
    kind: 'warning',
    title: 'Storage is 53% full',
    body: 'You have 4.2 GB remaining on the Plus plan.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 'n-4',
    kind: 'info',
    title: 'Plus plan renews in 24 days',
    body: '₹210.50 will be charged on 12 Jun 2025.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n-5',
    kind: 'file',
    title: 'You were invited to a shared folder',
    body: 'Research · shared by Priya Kulkarni.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n-6',
    kind: 'error',
    title: 'Payment failed',
    body: 'We couldn’t process your last attempt. No charge was made.',
    time: '2 days ago',
    read: true,
  },
];

export function NotificationBell({ count = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Notifications${count ? `, ${count} unread` : ''}`}
      data-testid="button-notifications"
      className="relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-95"
    >
      <Bell size={15} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold font-mono flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

function Row({ item, onMarkRead, onDismiss }) {
  const { Icon, cls } = KIND_STYLES[item.kind] ?? KIND_STYLES.info;
  return (
    <div
      className={`group relative flex items-start gap-2.5 px-3 sm:px-4 py-2.5 border-b border-[var(--border)] last:border-0 transition-colors ${
        item.read ? 'bg-transparent' : 'bg-[var(--primary)]/[0.04]'
      } hover:bg-[var(--muted)]/50`}
      data-testid={`notification-${item.id}`}
    >
      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${cls}`} aria-hidden="true">
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1.5">
          {!item.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />}
          <strong className="font-semibold text-[12px] sm:text-[13px] text-[var(--foreground)] leading-snug">
            {item.title}
          </strong>
        </div>
        <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{item.body}</p>
        <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-1 font-mono">
          {item.time}
        </span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {!item.read && (
          <button
            type="button"
            onClick={() => onMarkRead(item.id)}
            aria-label={`Mark “${item.title}” as read`}
            data-testid={`button-mark-read-${item.id}`}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-emerald-500 transition-colors active:scale-95"
          >
            <CheckCircle2 size={13} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          aria-label={`Dismiss “${item.title}”`}
          data-testid={`button-dismiss-${item.id}`}
          className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-colors active:scale-95"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export function NotificationModal({
  open: openProp,
  onClose,
  notifications: notificationsProp,
  onMarkAllRead,
  onClearAll,
}) {
  const isControlled = typeof openProp === 'boolean';
  const [openState, setOpenState] = useState(false);
  const open = isControlled ? openProp : openState;
  const close = () => {
    if (isControlled) onClose?.();
    else setOpenState(false);
  };
  const openModal = () => {
    if (isControlled) return;
    setOpenState(true);
  };

  const [localItems, setLocalItems] = useState(dummyNotifications);
  const items = notificationsProp ?? localItems;

  const [filter, setFilter] = useState('All');
  const unreadCount = items.filter((n) => !n.read).length;

  const visible = useMemo(() => (filter === 'Unread' ? items.filter((n) => !n.read) : items), [items, filter]);

  const markRead = (id) => {
    if (notificationsProp) return;
    setLocalItems((old) => old.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const markAllRead = () => {
    if (onMarkAllRead) return onMarkAllRead();
    setLocalItems((old) => old.map((n) => ({ ...n, read: true })));
  };
  const dismiss = (id) => {
    setLocalItems((old) => old.filter((n) => n.id !== id));
  };
  const clearAll = () => {
    if (onClearAll) return onClearAll();
    setLocalItems([]);
  };

  const backdropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!isControlled && <NotificationBell count={unreadCount} onClick={openModal} />}

      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4"
          onMouseDown={(e) => e.target === backdropRef.current && close()}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notif-title"
            className="w-full max-w-md max-h-[85vh] bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-[var(--radius)] shadow-xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                  <Bell size={15} />
                </div>
                <div className="min-w-0">
                  <h2
                    id="notif-title"
                    className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] truncate"
                  >
                    Notifications
                  </h2>
                  <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close notifications"
                data-testid="button-close-notifications"
                className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-[var(--border)] shrink-0">
              <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                {['All', 'Unread'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFilter(label)}
                    data-testid={`filter-notifications-${label.toLowerCase()}`}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      filter === label
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  data-testid="button-mark-all-read"
                  className="px-2 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={items.length === 0}
                  aria-label="Clear all notifications"
                  data-testid="button-clear-notifications"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
                    <BellOff size={22} />
                  </div>
                  <h3 className="font-bold font-manrope text-sm text-[var(--foreground)] mb-1">
                    {filter === 'Unread' ? 'No unread notifications' : 'All clear'}
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] max-w-[220px] leading-relaxed">
                    {filter === 'Unread'
                      ? 'Switch to “All” to see your history.'
                      : 'We’ll let you know when something happens.'}
                  </p>
                </div>
              ) : (
                visible.map((item) => <Row key={item.id} item={item} onMarkRead={markRead} onDismiss={dismiss} />)
              )}
            </div>

            {/* Footer */}
            <div className="px-3 sm:px-4 py-2 border-t border-[var(--border)] text-center shrink-0">
              <span className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)]">
                Notifications are stored locally in this demo.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationModal;
