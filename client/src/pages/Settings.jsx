import { ArrowRight, Check, Cloud, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { useUpdateCurrentUser } from '@/hooks/use-user';
import useAuthStore from '@/service/store/authStore';
import PageHead from './shared/PageHead';
import PlanCard from './shared/PlanCard';
import { StorageCard } from './shared/StorageCard';

const TABS = ['Profile', 'Plan & usage', 'Privacy'];

const buildProfileFromUser = (user) => {
  const full = (user?.full_name ?? '').trim();
  const parts = full.split(/\s+/);
  return {
    first: parts[0] ?? '',
    last: parts.slice(1).join(' ') || '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  };
};

export function SettingsPage() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const updateUser = useUpdateCurrentUser();

  const [tab, setTab] = useState('Profile');
  const [profile, setProfile] = useState(() => buildProfileFromUser(user));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setProfile(buildProfileFromUser(user));
    setDirty(false);
  }, [user]);

  const update = (key, value) => {
    setProfile((old) => ({ ...old, [key]: value }));
    setDirty(true);
  };

  const initials = useMemo(() => {
    const a = profile.first?.[0] ?? '';
    const b = profile.last?.[0] ?? '';
    return (a + b).toUpperCase() || (user?.username?.[0]?.toUpperCase() ?? 'U');
  }, [profile.first, profile.last, user]);

  const validate = () => {
    if (!profile.username.trim()) return 'Username is required';
    if (!profile.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return 'Enter a valid email address';
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      return;
    }

    const fullName = `${profile.first.trim()} ${profile.last.trim()}`.trim();
    const payload = {
      full_name: fullName,
      username: profile.username.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
    };

    try {
      await updateUser.mutateAsync(payload);
      setDirty(false);
    } catch {
      /* handled by hook toast */
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* handled by auth provider */
    }
  };

  const inputCls =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed';
  const labelCls =
    'block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-1';

  const isSaving = updateUser.isPending;

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Your details, your way"
        title="Settings"
        subtitle="Keep your profile and workspace information up to date."
      />

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] gap-2.5 sm:gap-3 flex-1">
        <nav className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-1.5 shadow-sm h-fit flex flex-row md:flex-col gap-1 overflow-x-auto">
          {TABS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTab(name)}
              className={`flex-1 md:flex-none text-left px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap ${
                tab === name
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              {name}
            </button>
          ))}
        </nav>

        <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-5 shadow-sm">
          {tab === 'Profile' ? (
            <>
              <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-[var(--border)]">
                <div className="min-w-0">
                  <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">
                    Personal details
                  </h2>
                  <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    Your account information, synced with the server.
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)] font-bold font-manrope text-[12px] sm:text-[13px]">
                  {initials}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label htmlFor="first-name" className={labelCls}>
                    First name
                  </label>
                  <input
                    id="first-name"
                    className={inputCls}
                    value={profile.first}
                    onChange={(e) => update('first', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className={labelCls}>
                    Last name
                  </label>
                  <input
                    id="last-name"
                    className={inputCls}
                    value={profile.last}
                    onChange={(e) => update('last', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="mt-2.5 sm:mt-3">
                <label htmlFor="username" className={labelCls}>
                  Username
                </label>
                <input
                  id="username"
                  className={inputCls}
                  value={profile.username}
                  onChange={(e) => update('username', e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-2.5 sm:mt-3">
                <div>
                  <label htmlFor="email" className={labelCls}>
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={inputCls}
                    value={profile.email}
                    onChange={(e) => update('email', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelCls}>
                    Phone number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={inputCls}
                    value={profile.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3 mt-3 sm:mt-4">
                <span className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)]">
                  {dirty ? 'Unsaved changes' : user ? 'Saved to your account' : 'Loading profile…'}
                </span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !dirty}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save changes
                    </>
                  )}
                </button>
              </div>
            </>
          ) : tab === 'Plan & usage' ? (
            <>
              <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-5">
                Plan &amp; usage
              </h2>
              <PlanCard />
              <br />
              <StorageCard />
              <Link
                to="/plans"
                className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                View all plans <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">
                Privacy &amp; workspace
              </h2>
              <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">
                How your data is handled on N-drive.
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 border border-[var(--border)] bg-[var(--background)] rounded-lg p-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={15} />
                  </div>
                  <div className="min-w-0">
                    <strong className="block font-semibold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)]">
                      Encrypted account
                    </strong>
                    <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug">
                      Profile data and chat history are stored encrypted on our servers and never shared with third
                      parties.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border border-[var(--border)] bg-[var(--background)] rounded-lg p-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
                    <Cloud size={15} />
                  </div>
                  <div className="min-w-0">
                    <strong className="block font-semibold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)]">
                      Personal cloud workspace
                    </strong>
                    <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug">
                      Files, images, and chat history stay tied to your account. Delete or export anything from its
                      page.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors active:scale-[0.98]"
              >
                <LogOut size={13} /> Sign out
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
