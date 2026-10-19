import { ArrowRight, Check, Cloud, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHead from './PageHead';

const dummyProfile = {
  first: 'Aanya',
  last: 'Mehta',
  username: 'aanyamehta',
  email: 'aanya.mehta@example.in',
  phone: '+91 98765 43210',
};

const TABS = ['Profile', 'Plan & usage', 'Privacy'];

export function SettingsPage({
  profile: profileProp,
  setProfile: setProfileProp,
  tab: tabProp,
  setTab: setTabProp,
  notify = () => {},
}) {
  const isControlled = profileProp && typeof setProfileProp === 'function' && typeof setTabProp === 'function';

  const [localProfile, setLocalProfile] = useState(dummyProfile);
  const [localTab, setLocalTab] = useState('Profile');

  const profile = isControlled ? profileProp : localProfile;
  const setProfile = isControlled ? setProfileProp : setLocalProfile;
  const tab = isControlled ? (tabProp ?? 'Profile') : localTab;
  const setTab = isControlled ? setTabProp : setLocalTab;

  const update = (key, value) => setProfile((old) => ({ ...old, [key]: value }));

  const inputCls =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow';
  const labelCls =
    'block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-1';

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
              data-testid={`settings-tab-${name.toLowerCase().replaceAll(' ', '-')}`}
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
                    Your account information. This is a local demo profile.
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)] font-bold font-manrope text-[12px] sm:text-[13px]">
                  {(profile.first?.[0] ?? '') + (profile.last?.[0] ?? '')}
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
                    data-testid="input-first-name"
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
                    data-testid="input-last-name"
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
                  data-testid="input-username"
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
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelCls}>
                    Phone number
                  </label>
                  <input
                    id="phone"
                    className={inputCls}
                    value={profile.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-[var(--border)] pt-3 mt-3 sm:mt-4">
                <button
                  type="button"
                  onClick={() => notify('Profile saved in this demo session')}
                  data-testid="button-save-profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  <Check size={13} /> Save changes
                </button>
              </div>
            </>
          ) : tab === 'Plan & usage' ? (
            <>
              <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">
                Plan &amp; usage
              </h2>
              <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">
                Your Plus subscription is active until 12 June 2025.
              </p>

              <div className="border border-[var(--border)] bg-[var(--background)] rounded-lg p-3 sm:p-4">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-2">
                  Storage used
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <strong className="font-extrabold font-manrope text-xl sm:text-2xl text-[var(--foreground)] tracking-tight">
                    4.8 GB
                  </strong>
                  <span className="text-[11px] sm:text-xs text-[var(--muted-foreground)]">of 9 GB</span>
                </div>
                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '53.3%' }} />
                </div>
                <div className="flex justify-between text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-2">
                  <span>4.2 GB available</span>
                  <span>53%</span>
                </div>
              </div>

              <Link
                href="/plans"
                data-testid="link-settings-plans"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98]"
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
                A few useful notes about this demo profile.
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 border border-[var(--border)] bg-[var(--background)] rounded-lg p-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={15} />
                  </div>
                  <div className="min-w-0">
                    <strong className="block font-semibold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)]">
                      Frontend-only workspace
                    </strong>
                    <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug">
                      Profile edits are held in local UI state; nothing is sent to a server.
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
                      Files and creative tools shown here use demo content and local previews.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => notify('Sign out is not available in this demo')}
                data-testid="button-sign-out"
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
