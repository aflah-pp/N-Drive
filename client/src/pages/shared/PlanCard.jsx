import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../service/store/authStore';

function PlanCard() {
  const { user } = useAuthStore();
  return (
    <>
      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Your membership</h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              A few details, all in one place.
            </div>
          </div>
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={16} />
          </div>
        </div>
        <div className="mt-1">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            Current plan
          </div>
          <div className="font-extrabold font-manrope text-xl text-[var(--foreground)] mt-1">
            {(user?.subscription && user?.subscription?.package?.name) || 'Free'}
          </div>
          <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">
            {user?.subscription ? (
              <>
                Active From{' '}
                <strong className="text-[var(--foreground)] font-semibold">{user?.subscription?.active_from}</strong> -{' '}
                <strong className="text-[var(--foreground)] font-semibold">{user?.subscription?.active_to}</strong>
              </>
            ) : (
              'Free'
            )}
          </div>
        </div>
        <Link
          to={'/plans'}
          data-testid="link-manage-plan"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity"
        >
          Manage plan <ArrowRight size={12} />
        </Link>
      </section>
    </>
  );
}

export default PlanCard;
