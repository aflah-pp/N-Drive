import { Check, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import PageHead from './PageHead';

const plans = [
  {
    id: 1,
    name: 'starter',
    featured: false,
    desc: 'Perfect for freelancers and individuals getting started.',
    price: 0,
    storage: '5 GB storage space',
    upload: 'Up to 1000 MB per file upload',
    chat: false,
    images: false,
    days: 28,
  },
  {
    id: 2,
    name: 'pro',
    featured: true,
    desc: 'Built for growing professionals who need more speed and space.',
    price: 29,
    storage: '100 GB storage space',
    upload: 'Up to 2 GB per file upload',
    chat: true,
    images: true,
    days: 28,
  },
  {
    id: 3,
    name: 'team',
    featured: false,
    desc: 'Ideal for collaborative squads needing shared team workflows.',
    price: 59,
    storage: '500 GB storage space',
    upload: 'Up to 10 GB per file upload',
    chat: true,
    images: true,
    days: 28,
  },
];

const PlansPage = ({ selected = 'pro', onSelect = () => {} }) => {
  const scrollContainerRef = useRef(null);
  const [scrollPercent, setScrollPercent] = useState(0);

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
    el.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (isCarousel) handleScroll();
  }, [isCarousel]);

  const renderCard = (plan) => {
    const isCurrentPlan = selected === plan.name;

    const cardSizeClasses = isCarousel ? 'w-[78vw] max-w-[290px] sm:w-[320px] shrink-0 snap-start' : 'w-full';

    return (
      <article
        key={plan.name}
        className={`border rounded-[var(--radius)] p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-200 bg-[var(--card)] text-[var(--card-foreground)] ${cardSizeClasses} ${
          plan.featured
            ? 'border-[var(--primary)] shadow-md ring-2 ring-[var(--ring)] ring-offset-1 sm:ring-offset-2 ring-offset-[var(--background)]'
            : 'border-[var(--border)] shadow-sm'
        }`}
        data-testid={`card-plan-${plan.name}`}
      >
        {isCurrentPlan && (
          <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold font-mono uppercase tracking-wider bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            Your plan
          </span>
        )}

        <div className="mb-3">
          <div className="font-bold text-xs sm:text-sm font-manrope uppercase tracking-wide text-[var(--primary)]">
            {plan.name}
          </div>
          <p className="text-[11px] sm:text-xs leading-relaxed min-h-[30px] sm:min-h-[36px] mt-1 mb-2.5 text-[var(--muted-foreground)] line-clamp-2">
            {plan.desc}
          </p>
          <div className="font-extrabold text-2xl sm:text-3xl font-manrope tracking-tight flex items-baseline">
            {plan.price === 0 ? 'Free' : `$${plan.price}`}
            <small className="font-medium text-[11px] sm:text-xs tracking-normal ml-1 text-[var(--muted-foreground)]">
              {plan.price > 0 ? ' / 28 days' : ''}
            </small>
          </div>

          <ul className="list-none my-3 p-0 grid gap-2 text-[11px] sm:text-xs">
            {[
              plan.storage,
              plan.upload,
              plan.chat ? 'Assistant chat included' : 'Assistant chat not included',
              plan.images ? 'Image previews included' : 'Image generation not included',
              `${plan.days} days validity`,
            ].map((feature, index) => {
              const isFeatureDisabled = (!plan.chat && index === 2) || (!plan.images && index === 3);
              return (
                <li key={`${plan.name}-feat-${index}`} className="flex items-center gap-2">
                  <Check
                    size={13}
                    className={
                      plan.featured ? 'text-[var(--primary)] shrink-0' : 'text-[var(--muted-foreground)] shrink-0'
                    }
                  />
                  <span
                    className={`truncate ${
                      isFeatureDisabled
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
          className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors duration-200 shadow-sm active:scale-[0.99] ${
            isCurrentPlan
              ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)] cursor-default'
              : plan.featured
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
                : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'
          }`}
          onClick={() => onSelect(plan.name)}
          disabled={isCurrentPlan}
          data-testid={`button-select-plan-${plan.name}`}
        >
          {isCurrentPlan ? 'Current plan' : `Choose ${plan.name}`}
        </button>
      </article>
    );
  };

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
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <strong className="block font-bold text-xs sm:text-sm font-manrope truncate">
              Current · <span className="capitalize text-[var(--primary)]">{selected}</span>
            </strong>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate">
              Renews every 28 days
            </div>
          </div>
        </div>
        <span className="shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
          ACTIVE
        </span>
      </div>

      {isCarousel && (
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

      {isCarousel ? (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex-1 w-full overflow-x-auto overflow-y-visible overscroll-x-contain pb-3 flex gap-3 sm:gap-5 items-stretch snap-x snap-proximity scrollbar-none"
        >
          {plans.map(renderCard)}
        </div>
      ) : (
        <div
          className={`grid gap-3 sm:gap-5 items-stretch w-full mx-auto ${gridMaxWidth}`}
          style={{ gridTemplateColumns: `repeat(${planCount}, minmax(0, 1fr))` }}
        >
          {plans.map(renderCard)}
        </div>
      )}

      <div className="border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg p-2 text-[10px] sm:text-[11px] mt-1 shrink-0 leading-tight">
        Plan information reflects demo structure. Choosing a plan updates local state only.
      </div>
    </div>
  );
};

export default PlansPage;
