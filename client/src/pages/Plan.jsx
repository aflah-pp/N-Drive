import { Check, ChevronLeft, ChevronRight, Clock3, Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useInitiatePayment } from '@/hooks/use-payment';
import { usePlans } from '@/hooks/use-plans';
import useAuthStore from '@/service/store/authStore';
import PageHead from './shared/PageHead';

const FALLBACK_FEATURES = (raw) => {
  const out = [];
  if (raw?.description?.features?.length) {
    out.push(...raw.description.features);
    return out;
  }
  if (raw?.max_upload_size) {
    const mb = raw.max_upload_size / 1024 / 1024;
    const label = mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
    out.push(`Up to ${label} per file upload`);
  }
  if (raw?.chat_enabled) out.push('Assistant chat included');
  if (raw?.image_gen_enabled) out.push('Image generation included');
  if (raw?.plan_validity) out.push(`${raw.plan_validity} days validity`);
  return out;
};

const inr = (value) => {
  const n = Number(value) || 0;
  return n === 0 ? 'Free' : `₹${n.toFixed(2)}`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const transformPlan = (raw, index) => {
  const features = FALLBACK_FEATURES(raw);
  return {
    id: raw.id,
    name: raw.name,
    raw,
    featured: index === 1 && raw?.id !== 1,
    desc:
      raw.description?.tagline ??
      raw.description?.summary ??
      (features.length > 0
        ? `${features[0]}${features[1] ? ` · ${features[1]}` : ''}`
        : 'A simple plan to get started.'),
    price: Number(raw.price) || 0,
    days: raw.plan_validity ?? 28,
    features,
    chat: Boolean(raw.chat_enabled),
    images: Boolean(raw.image_gen_enabled),
    isFreeTier: Boolean(raw.is_free),
  };
};

function getPlanAction({ plan, current, isSubscriptionActive }) {
  const isCurrent = current?.name?.toLowerCase() === plan.name?.toLowerCase();

  if (plan.isFreeTier) {
    return { label: 'Current plan', disabled: true, tone: 'muted' };
  }

  if (isCurrent) {
    if (isSubscriptionActive) {
      return { label: 'Current plan', disabled: true, tone: 'muted' };
    }
    return { label: `Renew ${plan.name}`, disabled: false, tone: 'primary' };
  }

  if (current && !current.isFreeTier && isSubscriptionActive) {
    const currentPrice = Number(current.raw?.price ?? current.price ?? 0);
    const planPrice = Number(plan.price ?? 0);
    const endsOn = formatDate(current.activeTo);

    if (planPrice > currentPrice) {
      return {
        label: endsOn ? `Available after ${endsOn}` : 'Available after renewal',
        disabled: true,
        tone: 'warn',
        tooltip: `Your ${current.name} plan is active until ${endsOn}. You can upgrade once it ends.`,
      };
    }

    return {
      label: endsOn ? `Unavailable until ${endsOn}` : 'Unavailable',
      disabled: true,
      tone: 'warn',
      tooltip: `Your ${current.name} plan is already active. Wait until ${endsOn} to switch.`,
    };
  }

  return { label: `Buy ${plan.name}`, disabled: false, tone: 'primary' };
}

const PlansPage = () => {
  const { data: rawPlans, isLoading, isError, refetch } = usePlans();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const initiate = useInitiatePayment();

  const scrollContainerRef = useRef(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  const plans = useMemo(() => (rawPlans ?? []).map(transformPlan), [rawPlans]);

  const subscription = user?.subscription;
  const currentPackage = subscription?.package;
  const currentPlanName = currentPackage?.name ?? null;
  const currentIsFree = Boolean(currentPackage?.is_free);
  const currentStatus = (subscription?.status ?? '').toUpperCase();

  const isSubscriptionActive = useMemo(() => {
    if (!subscription) return false;
    if (currentStatus !== 'ACTIVE') return false;
    if (!subscription.active_to) return false;
    return new Date(subscription.active_to) > new Date();
  }, [subscription, currentStatus]);

  const currentPlan = useMemo(() => {
    if (!currentPlanName) return null;

    const match = plans.find((p) => p.name?.toLowerCase() === currentPlanName.toLowerCase());

    if (match) {
      return {
        ...match,
        isFreeTier: currentIsFree || match.isFreeTier,
        activeTo: subscription?.active_to ?? null,
      };
    }

    return {
      name: currentPlanName,
      price: Number(currentPackage?.price ?? 0),
      raw: currentPackage ?? {},
      isFreeTier: currentIsFree,
      activeTo: subscription?.active_to ?? null,
    };
  }, [plans, currentPlanName, currentIsFree, currentPackage, subscription]);

  const isCarousel = plans.length > 3;
  const planCount = Math.max(1, plans.length);
  const gridMaxWidth = plans.length === 1 ? 'max-w-md' : plans.length === 2 ? 'max-w-3xl' : 'w-full';

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollPercent(100);
      return;
    }
    const current = (el.scrollLeft / maxScroll) * 100;
    setScrollPercent(Math.min(100, Math.max(0, current)));
  };

  const scrollByAmount = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isCarousel) handleScroll();
  }, [isCarousel]);

  // ── Kick off payment for a plan ───────────────────────────
  const handlePurchase = async (plan) => {
    if (initiate.isPending) return;
    try {
      const res = await initiate.mutateAsync({ packageId: plan.id });
      const link = res?.result?.payment_link;
      if (!link) {
        throw new Error('No payment link returned from server');
      }
      // Backend returns "/payment?order_id=order_xxx&amount=…"
      navigate(link);
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not start payment',
      );
    }
  };

  const renderCard = (plan) => {
    const isCurrentPlan = currentPlanName?.toLowerCase() === plan.name?.toLowerCase();

    const action = getPlanAction({
      plan,
      current: currentPlan,
      isSubscriptionActive,
    });

    const isThisCardProcessing = initiate.isPending && initiate.variables?.packageId === plan.id;

    const cardSizeClasses = isCarousel ? 'w-[78vw] max-w-[290px] sm:w-[320px] shrink-0 snap-start' : 'w-full';

    const featureRows = [
      ...plan.features,
      plan.chat ? 'Assistant chat included' : 'Assistant chat not included',
      plan.images ? 'Image generation included' : 'Image generation not included',
    ];

    const buttonCls = (() => {
      if (isThisCardProcessing) {
        return 'bg-[var(--primary)] text-[var(--primary-foreground)] cursor-wait opacity-90';
      }
      if (action.disabled) {
        if (action.tone === 'warn') {
          return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 cursor-not-allowed';
        }
        return 'bg-[var(--secondary)] text-[var(--secondary-foreground)] cursor-not-allowed opacity-90';
      }
      if (action.tone === 'muted') {
        return 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90';
      }
      return 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90';
    })();

    return (
      <article
        key={plan.id ?? plan.name}
        className={`border rounded-[var(--radius)] p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-200 bg-[var(--card)] text-[var(--card-foreground)] ${cardSizeClasses} ${
          plan.featured
            ? 'border-[var(--primary)] shadow-md ring-2 ring-[var(--ring)] ring-offset-1 sm:ring-offset-2 ring-offset-[var(--background)]'
            : 'border-[var(--border)] shadow-sm'
        }`}
      >
        {isCurrentPlan && isSubscriptionActive && (
          <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold font-mono uppercase tracking-wider bg-[var(--primary)] text-[var(--primary-foreground)]">
            Active
          </span>
        )}

        {isCurrentPlan && !isSubscriptionActive && (
          <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold font-mono uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300">
            Expired
          </span>
        )}

        <div className="mb-3">
          <div className="font-bold text-xs sm:text-sm font-manrope uppercase tracking-wide text-[var(--primary)] capitalize">
            {plan.name}
          </div>
          <p className="text-[11px] sm:text-xs leading-relaxed min-h-[30px] sm:min-h-[36px] mt-1 mb-2.5 text-[var(--muted-foreground)] line-clamp-2">
            {plan.desc}
          </p>
          <div className="font-extrabold text-2xl sm:text-3xl font-manrope tracking-tight flex items-baseline flex-wrap gap-1">
            {inr(plan.price)}
            <small className="font-medium text-[11px] sm:text-xs tracking-normal text-[var(--muted-foreground)]">
              {plan.price > 0 ? ` / ${plan.days} days` : ''}
            </small>
          </div>

          <ul className="list-none my-3 p-0 grid gap-2 text-[11px] sm:text-xs">
            {featureRows.map((feature, index) => {
              const isChatRow = index === plan.features.length;
              const isImageRow = index === plan.features.length + 1;
              const isDisabled = (isChatRow && !plan.chat) || (isImageRow && !plan.images);

              return (
                <li key={`${plan.id}-feat-${index}`} className="flex items-center gap-2">
                  <Check
                    size={13}
                    className={
                      plan.featured ? 'text-[var(--primary)] shrink-0' : 'text-[var(--muted-foreground)] shrink-0'
                    }
                  />
                  <span
                    className={`truncate ${
                      isDisabled
                        ? 'text-[var(--muted-foreground)] line-through opacity-50'
                        : 'text-[var(--card-foreground)]'
                    }`}
                  >
                    {feature}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors duration-200 shadow-sm active:scale-[0.99] inline-flex items-center justify-center gap-1.5 ${buttonCls}`}
          onClick={() => !action.disabled && !isThisCardProcessing && handlePurchase(plan)}
          disabled={action.disabled || isThisCardProcessing || initiate.isPending}
          title={action.tooltip}
        >
          {isThisCardProcessing ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Starting…
            </>
          ) : (
            action.label
          )}
        </button>
      </article>
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-3">Couldn’t load plans.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    if (plans.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-sm text-[var(--muted-foreground)]">No plans available right now.</p>
        </div>
      );
    }

    if (isCarousel) {
      return (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex-1 w-full overflow-x-auto overflow-y-visible overscroll-x-contain pb-3 flex gap-3 sm:gap-5 items-stretch snap-x snap-proximity scrollbar-none"
        >
          {plans.map(renderCard)}
        </div>
      );
    }

    return (
      <div
        className={`grid gap-3 sm:gap-5 items-stretch w-full mx-auto ${gridMaxWidth}`}
        style={{ gridTemplateColumns: `repeat(${planCount}, minmax(0, 1fr))` }}
      >
        {plans.map(renderCard)}
      </div>
    );
  };

  const bannerName = currentPlan?.name ?? currentPlanName ?? 'Free';
  const bannerSub = (() => {
    if (!subscription) return 'No active subscription';
    if (currentIsFree) return 'Free plan · no renewal';
    if (isSubscriptionActive) {
      return `Active until ${formatDate(subscription.active_to)}`;
    }
    return `Expired on ${formatDate(subscription.active_to)}`;
  })();

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Make room for more"
        title="Plans & packages"
        subtitle="A small set of plans, made to fit the way you work."
      />

      <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-2.5 sm:p-3 mb-2 sm:mb-3 flex flex-row items-center justify-between gap-2.5 shadow-sm shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            {isSubscriptionActive && !currentIsFree ? <ShieldCheck size={16} /> : <Clock3 size={16} />}
          </div>
          <div className="min-w-0">
            <strong className="block font-bold text-xs sm:text-sm font-manrope truncate">
              Current · <span className="capitalize text-[var(--primary)]">{bannerName}</span>
            </strong>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate">{bannerSub}</div>
          </div>
        </div>
        <span
          className={`shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md ${
            isSubscriptionActive
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
          }`}
        >
          {isSubscriptionActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      {isCarousel && !isLoading && !isError && plans.length > 0 && (
        <div className="flex items-center justify-between gap-3 mb-2 shrink-0 px-0.5">
          <div className="flex items-center gap-2 flex-1 max-w-[200px] sm:max-w-xs">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[var(--muted-foreground)] tracking-wide whitespace-nowrap">
              {Math.round(scrollPercent)}%
            </span>
            <div className="relative flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] transition-all duration-150 ease-out rounded-full"
                style={{ width: `${scrollPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollByAmount('left')}
              className="p-1 sm:p-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors active:scale-95"
              aria-label="Previous plans"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              className="p-1 sm:p-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors active:scale-95"
              aria-label="Next plans"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {renderBody()}

      <div className="border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg p-2 text-[10px] sm:text-[11px] mt-1 shrink-0 leading-tight">
        Plan information is loaded from the server. Choosing a plan opens the payment page.
      </div>
    </div>
  );
};

export default PlansPage;
