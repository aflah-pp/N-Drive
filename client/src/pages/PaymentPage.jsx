import { ArrowLeft, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHead from './PageHead';

export const PLANS = {
  starter: { name: 'Starter', price: 0, cycle: 'Forever free' },
  pro: { name: 'Pro', price: 29, cycle: 'Billed every 28 days' },
  team: { name: 'Team', price: 59, cycle: 'Billed every 28 days' },
  studio: { name: 'Studio', price: 99, cycle: 'Billed every 28 days' },
};

const TAX_RATE = 0.18;

const formatCard = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const formatCVV = (v) => v.replace(/\D/g, '').slice(0, 4);

export function PaymentPage({ plan = 'pro' }) {
  const navigate = useNavigate();
  const selected = PLANS[plan] ?? PLANS.pro;

  const [form, setForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    save: true,
  });
  const [status, setStatus] = useState('idle'); // idle | processing
  const [errors, setErrors] = useState({});

  const subtotal = selected.price;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const update = (key, value) => {
    setForm((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.number.replace(/\s/g, '').length < 16) e.number = 'Enter the 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'MM/YY';
    if (form.cvv.length < 3) e.cvv = '3–4 digits';
    if (!form.name.trim()) e.name = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pay = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('processing');
    const forceFail = form.number.replace(/\s/g, '').endsWith('0000');
    await new Promise((r) => setTimeout(r, 2000));
    navigate(forceFail ? '/payment/failed' : '/payment/success');
  };

  const cardDigits = form.number.padEnd(19, '•').slice(0, 19);
  const cardName = form.name.trim() || 'YOUR NAME';
  const cardExpiry = form.expiry || 'MM/YY';

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Secure checkout"
        title="Payment"
        subtitle="Your card details are used only for this demo transaction."
        actions={
          <Link
            to="/plans"
            data-testid="link-back-plans"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98]"
          >
            <ArrowLeft size={14} /> Back to plans
          </Link>
        }
      />

      {/* Progress */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 shrink-0">
        {['Plan', 'Payment', 'Confirmation'].map((step, i) => {
          const active = i === 1;
          const done = i < 1;
          return (
            <div key={step} className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold ${
                  active
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : done
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
              >
                {done && <CheckCircle2 size={11} />}
                {step}
              </span>
              {i < 2 && <span className="w-4 sm:w-6 h-px bg-[var(--border)]" aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3 sm:gap-4">
        {/* Card form */}
        <form
          onSubmit={pay}
          noValidate
          className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-5 shadow-sm flex flex-col gap-3 sm:gap-4"
        >
          {/* Live card preview */}
          <div
            className="relative aspect-[1.6/1] w-full max-w-[340px] self-center rounded-2xl p-4 sm:p-5 overflow-hidden shadow-lg select-none"
            style={{
              background: 'linear-gradient(135deg, #1f3d33 0%, #2e5c4a 45%, #6b9082 100%)',
            }}
          >
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-12 w-44 h-44 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-white/90" />
                <span className="text-[10px] font-bold tracking-widest text-white/90">N-DRIVE</span>
              </div>
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-sm" />
            </div>
            <div className="relative mt-6 sm:mt-8 font-mono text-white text-[15px] sm:text-[17px] tracking-wider">
              {cardDigits.match(/.{1,4}/g)?.join(' ')}
            </div>
            <div className="relative mt-4 flex items-end justify-between">
              <div className="min-w-0">
                <div className="text-[8px] uppercase tracking-widest text-white/60 mb-0.5">Cardholder</div>
                <div className="text-[11px] font-semibold text-white truncate max-w-[150px] tracking-wide">
                  {cardName.toUpperCase()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] uppercase tracking-widest text-white/60 mb-0.5">Expires</div>
                <div className="text-[11px] font-semibold text-white font-mono">{cardExpiry}</div>
              </div>
            </div>
          </div>

          {/* Number */}
          <Field
            label="Card number"
            hint="Try 4242 4242 4242 4242 · ends in 0000 to force a failure"
            error={errors.number}
          >
            <div className="relative">
              <CreditCard
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
              />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={form.number}
                onChange={(e) => update('number', formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                data-testid="input-card-number"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 py-2 text-[12px] sm:text-[13px] font-mono tracking-wider text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
              />
            </div>
          </Field>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <Field label="Expiry" error={errors.expiry}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={form.expiry}
                onChange={(e) => update('expiry', formatExpiry(e.target.value))}
                placeholder="MM/YY"
                data-testid="input-card-expiry"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] font-mono tracking-wider text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
              />
            </Field>
            <Field label="CVV" error={errors.cvv}>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={form.cvv}
                onChange={(e) => update('cvv', formatCVV(e.target.value))}
                placeholder="•••"
                data-testid="input-card-cvv"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] font-mono tracking-wider text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
              />
            </Field>
          </div>

          {/* Name */}
          <Field label="Cardholder name" error={errors.name}>
            <input
              type="text"
              autoComplete="cc-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Name on card"
              data-testid="input-card-name"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.save}
              onChange={(e) => update('save', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[var(--border)] accent-[var(--primary)]"
              data-testid="checkbox-save-card"
            />
            <span className="text-[11px] sm:text-xs text-[var(--muted-foreground)]">
              Save this card for future payments
            </span>
          </label>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-1">
            <Lock size={11} />
            <span>Encrypted demo checkout · No real charge is made</span>
          </div>
        </form>

        {/* Order summary */}
        <aside className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm h-fit lg:sticky lg:top-4 flex flex-col">
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-2">
            Order summary
          </div>

          <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[var(--border)]">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block font-bold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)] truncate">
                {selected.name} plan
              </strong>
              <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                {selected.cycle}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
              PLAN
            </span>
          </div>

          <dl className="space-y-1.5 text-[11px] sm:text-xs">
            <div className="flex justify-between text-[var(--muted-foreground)]">
              <dt>Subtotal</dt>
              <dd className="font-mono text-[var(--foreground)]">₹{subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-[var(--muted-foreground)]">
              <dt>GST (18%)</dt>
              <dd className="font-mono text-[var(--foreground)]">₹{tax.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between pt-2 mt-2 border-t border-[var(--border)]">
              <dt className="font-bold text-[var(--foreground)]">Total due</dt>
              <dd className="font-mono font-bold text-[var(--foreground)]">₹{total.toFixed(2)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            onClick={pay}
            disabled={status === 'processing'}
            data-testid="button-pay"
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait"
          >
            {status === 'processing' ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Lock size={14} /> Pay ₹{total.toFixed(2)}
              </>
            )}
          </button>

          <div className="mt-2 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] text-center leading-snug">
            By paying you agree to the demo terms. Cancel anytime from your plan page.
          </div>

          <div className="mt-3 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2 py-1.5 leading-tight">
            Demo gateway · Fill any valid-format card. Card ending <strong className="font-mono">0000</strong> forces a
            failed result.
          </div>
        </aside>
      </div>

      {/* Processing overlay */}
      {status === 'processing' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Processing payment"
          data-testid="processing-overlay"
        >
          <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] shadow-xl p-6 w-[280px] flex flex-col items-center text-center">
            <div className="relative w-14 h-14 mb-3">
              <span className="absolute inset-0 rounded-full bg-[var(--primary)]/15 animate-ping" />
              <div className="relative w-14 h-14 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--secondary-foreground)]">
                <Lock size={20} />
              </div>
            </div>
            <strong className="font-bold font-manrope text-sm text-[var(--foreground)]">Processing payment</strong>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-1 leading-relaxed">
              Please don’t close this window…
            </p>
            <div className="w-full h-1 bg-[var(--muted)] rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[var(--primary)] rounded-full"
                style={{ animation: 'pay-progress 2s ease-in-out forwards' }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pay-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-1">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[10px] text-red-500 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-[10px] text-[var(--muted-foreground)] mt-1 leading-snug">{hint}</p>
      ) : null}
    </div>
  );
}

export default PaymentPage;
