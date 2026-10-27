import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  Home,
  Receipt,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

const STATUS_CONF = {
  success: {
    eyebrow: 'Payment confirmed',
    title: 'You’re all set',
    subtitle: 'Your plan is active and a receipt has been sent to your email.',
    CTA: 'Go to dashboard',
    CTALink: '/',
  },
  failed: {
    eyebrow: 'Payment not completed',
    title: 'That didn’t go through',
    subtitle: 'Nothing was charged. Double-check your card details and try again.',
    CTA: 'Try again',
    CTALink: '/plans',
  },
};

const inr = (value) => {
  const n = Number(value) || 0;
  return `₹${n.toFixed(2)}`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const { refreshUser, user } = useAuth();

  const orderId = params.get('order_id');
  const statusParam = (params.get('status') ?? 'success').toLowerCase();
  const isSuccess = statusParam === 'success';
  const conf = STATUS_CONF[isSuccess ? 'success' : 'failed'];

  useEffect(() => {
    if (isSuccess && refreshUser) {
      refreshUser().catch(() => {});
    }
  }, [isSuccess]);

  const receipt = useMemo(() => {
    const sub = user?.subscription;
    const pkg = sub?.package;
    return {
      plan: pkg?.name ?? '—',
      cycle: pkg?.plan_validity ? `Billed every ${pkg.plan_validity} days` : '',
      amount: pkg?.amount ?? '-',
      reference: orderId ?? '—',
      date: formatDate(sub?.created_at),
      method: 'Card',
    };
  }, [user, orderId]);

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center text-[var(--foreground)] bg-[var(--background)] antialiased">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div
          className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4"
          style={{ animation: 'result-pop 500ms cubic-bezier(.2,.9,.3,1.3) both' }}
        >
          <span
            className={`absolute inset-0 rounded-full ${isSuccess ? 'bg-emerald-500/25' : 'bg-red-500/25'}`}
            style={{ animation: 'result-pulse 1.6s ease-out infinite' }}
            aria-hidden="true"
          />
          <span
            className={`absolute inset-2 rounded-full ${isSuccess ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}
            style={{ animation: 'result-pulse 1.6s ease-out 0.3s infinite' }}
            aria-hidden="true"
          />

          <div
            className={`relative w-full h-full rounded-full flex items-center justify-center shadow-lg ${
              isSuccess ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
            style={isSuccess ? undefined : { animation: 'result-shake 500ms 400ms both' }}
          >
            {isSuccess ? (
              <svg viewBox="0 0 52 52" className="w-12 h-12 sm:w-14 sm:h-14">
                <circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path
                  d="M14 27 L23 35 L38 19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="40"
                  strokeDashoffset="40"
                  style={{ animation: 'result-draw 600ms 300ms forwards ease-out' }}
                />
              </svg>
            ) : (
              <svg viewBox="0 0 52 52" className="w-12 h-12 sm:w-14 sm:h-14">
                <circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path
                  d="M17 17 L35 35 M35 17 L17 35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="30"
                  strokeDashoffset="30"
                  style={{ animation: 'result-draw 500ms 300ms forwards ease-out' }}
                />
              </svg>
            )}
          </div>

          {isSuccess &&
            Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-sm"
                style={{
                  background: ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#60a5fa'][i % 5],
                  animation: `result-confetti 1.4s ${i * 0.06 + 0.1}s ease-out forwards`,
                  transform: `rotate(${i * 36}deg)`,
                  '--dx': `${Math.cos(i * 36 * (Math.PI / 180)) * 60}px`,
                  '--dy': `${Math.sin(i * 36 * (Math.PI / 180)) * 60}px`,
                }}
                aria-hidden="true"
              />
            ))}
        </div>

        <div style={{ animation: 'result-up 400ms 200ms both ease-out' }}>
          <div
            className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold mb-1 ${
              isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {conf.eyebrow}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-manrope tracking-tight text-[var(--foreground)] mb-1.5">
            {conf.title}
          </h1>
          <p className="text-[12px] sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-sm mx-auto">
            {conf.subtitle}
          </p>
        </div>

        <div
          className="w-full mt-5 border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden text-left"
          style={{ animation: 'result-up 400ms 350ms both ease-out' }}
        >
          <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {isSuccess ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block font-bold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)]">
                {isSuccess ? 'Transaction receipt' : 'What happened'}
              </strong>
              <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                {isSuccess ? 'Keep this for your records' : 'No amount has been debited'}
              </span>
            </div>
            <span
              className={`text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md uppercase ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {isSuccess ? 'paid' : 'failed'}
            </span>
          </div>

          <dl className="divide-y divide-[var(--border)] text-[11px] sm:text-xs">
            <Row icon={Receipt} label="Plan" value={receipt.plan} sub={receipt.cycle} />
            <Row icon={ShieldCheck} label="Amount" value={inr(receipt.amount)} sub="See billing for details" />
            <Row icon={Clock3} label="Reference" value={receipt.reference} mono sub={receipt.date} />
            <Row icon={Receipt} label="Method" value={receipt.method} />
          </dl>
        </div>

        <div
          className="w-full mt-4 flex flex-col sm:flex-row gap-2"
          style={{ animation: 'result-up 400ms 500ms both ease-out' }}
        >
          <Link
            to={conf.CTALink}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            {isSuccess ? <Home size={14} /> : <RotateCcw size={14} />}
            {conf.CTA}
          </Link>

          {isSuccess ? (
            <Link
              to="/invoice"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
            >
              <Download size={14} /> View receipt
            </Link>
          ) : (
            <Link
              to="/help"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
            >
              Contact support <ArrowRight size={13} />
            </Link>
          )}
        </div>

        <div
          className="mt-4 text-[10px] sm:text-[11px] text-[var(--muted-foreground)]"
          style={{ animation: 'result-up 400ms 650ms both ease-out' }}
        >
          <Link to="/invoice" className="hover:text-[var(--foreground)] underline underline-offset-2">
            See all transactions
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes result-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes result-pulse { 0% { transform: scale(0.9); opacity: 0.55; } 80% { transform: scale(1.6); opacity: 0; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes result-draw { to { stroke-dashoffset: 0; } }
        @keyframes result-shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
        @keyframes result-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes result-confetti { 0% { transform: translate(0,0) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(var(--dx), calc(var(--dy) + 80px)) rotate(360deg); opacity: 0; } }
      `}</style>
    </div>
  );
}

function Row({ icon: Icon, label, value, sub, mono }) {
  return (
    <div className="flex items-start gap-2.5 px-3 sm:px-4 py-2.5">
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[var(--muted)] text-[var(--muted-foreground)]">
        <Icon size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">{label}</div>
        <div
          className={`text-[12px] sm:text-[13px] font-medium text-[var(--foreground)] mt-0.5 truncate ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </div>
        {sub && <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  );
}

export default PaymentResultPage;
