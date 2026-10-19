import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  LifeBuoy,
  Mail,
  MessageCircle,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import PageHead from './PageHead';

const helpTopics = [
  {
    id: 'topic-chat',
    title: 'Live chat',
    desc: 'Get a reply from a human in under 5 minutes.',
    meta: 'Mon–Fri · 9am–6pm IST',
    icon: MessageCircle,
    accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    cta: 'Start a chat',
  },
  {
    id: 'topic-email',
    title: 'Email us',
    desc: 'Write to the team for anything that needs detail.',
    meta: 'Replies within 24 hours',
    icon: Mail,
    accent: 'bg-blue-500/10 text-blue-500',
    cta: 'Send an email',
  },
  {
    id: 'topic-docs',
    title: 'Documentation',
    desc: 'Guides, API references and best practices.',
    meta: '150+ articles',
    icon: BookOpen,
    accent: 'bg-violet-500/10 text-violet-500',
    cta: 'Browse docs',
  },
  {
    id: 'topic-community',
    title: 'Community',
    desc: 'Ask other builders, share ideas, find answers.',
    meta: '2,800+ members',
    icon: Users,
    accent: 'bg-amber-500/10 text-amber-500',
    cta: 'Join community',
  },
];

const dummyFaqs = [
  {
    id: 'faq-1',
    question: 'How do I upload files?',
    answer:
      'Open My files from the left sidebar, then click “Upload files” in the top-right corner. You can drag and drop multiple files at once — up to the size limit of your current plan.',
    category: 'Files',
  },
  {
    id: 'faq-2',
    question: 'What happens when I empty the trash?',
    answer:
      'Items in Trash are permanently removed from your workspace for this session. Once cleared, they cannot be restored — so double-check before emptying.',
    category: 'Files',
  },
  {
    id: 'faq-3',
    question: 'How do I change my plan?',
    answer:
      'Go to Plans & packages from the sidebar. Pick a plan that fits and click “Choose …”. You can upgrade or downgrade at any time; the change takes effect on your next renewal.',
    category: 'Billing',
  },
  {
    id: 'faq-4',
    question: 'Where can I find my receipts?',
    answer:
      'Every payment is listed under Billing & receipts. Click the download icon next to any transaction to save a copy of that receipt.',
    category: 'Billing',
  },
  {
    id: 'faq-5',
    question: 'Is the Assistant private?',
    answer:
      'Yes. Conversations in the Assistant stay local to your browser in this demo. No messages are sent to any server, and no AI service is connected.',
    category: 'Assistant',
  },
  {
    id: 'faq-6',
    question: 'How do I contact support directly?',
    answer:
      'Use the live chat tile above for a fast reply, or email support@n-drive.example. Both channels are monitored Mon–Fri, 9am–6pm IST.',
    category: 'Support',
  },
  {
    id: 'faq-7',
    question: 'Can I recover a deleted folder?',
    answer:
      'Deleted folders stay in Trash until you empty it. Click “Restore” next to any item to bring it back to the root of My files.',
    category: 'Files',
  },
  {
    id: 'faq-8',
    question: 'What’s the maximum file size I can upload?',
    answer:
      'Free plans support up to 25 MB per file, Plus allows 90 MB, and Studio goes up to 900 MB. See Plans for the full breakdown.',
    category: 'Files',
  },
];

function TopicCard({ topic, onClick }) {
  const Icon = topic.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`help-topic-${topic.id}`}
      className="group text-left border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-[var(--primary)]/40 transition-all active:scale-[0.99] flex flex-col gap-2"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${topic.accent}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <strong className="block font-bold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)]">
          {topic.title}
        </strong>
        <p className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug line-clamp-2">
          {topic.desc}
        </p>
        <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-1.5 font-mono">
          {topic.meta}
        </span>
      </div>
      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] group-hover:opacity-80 transition-opacity">
        {topic.cta} <ArrowRight size={11} />
      </span>
    </button>
  );
}

function FaqRow({ item, open, onToggle }) {
  return (
    <div className="border-b border-[var(--border)] last:border-0" data-testid={`faq-${item.id}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-panel-${item.id}`}
        data-testid={`button-faq-${item.id}`}
        className="w-full flex items-start gap-2.5 px-3 sm:px-4 py-3 text-left hover:bg-[var(--muted)]/40 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
              {item.category}
            </span>
          </div>
          <strong className="block font-semibold font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)] leading-snug">
            {item.question}
          </strong>
        </div>
        <ChevronDown
          size={15}
          className={`shrink-0 mt-1 text-[var(--muted-foreground)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div id={`faq-panel-${item.id}`} className="px-3 sm:px-4 pb-3 -mt-1">
          <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export function HelpPage({ faqs = dummyFaqs, topics = helpTopics, onSubmit = () => {}, notify = () => {} }) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const filteredFaqs = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  const handleTopic = (topic) => {
    notify(`“${topic.title}” is a demo placeholder`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    onSubmit(form);
    setSent(true);
    notify('Message received in this demo');
    setForm({ subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="We’re here to help"
        title="Get help"
        subtitle="Find answers fast, or reach a real person — whichever you prefer."
      />

      {/* ── Hero / search ─────────────────────────────── */}
      <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-4 sm:p-6 mb-3 sm:mb-4 shrink-0 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            <LifeBuoy size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">
              How can we help today?
            </h2>
            <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
              Search the knowledge base or pick a channel below.
            </p>
          </div>
        </div>

        <label
          htmlFor="help-search"
          className="relative flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] focus-within:ring-2 focus-within:ring-[var(--ring)] transition-shadow"
        >
          <Search size={15} className="absolute left-3 text-[var(--muted-foreground)]" />
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs — try “upload”, “plan”, “trash”…"
            data-testid="input-help-search"
            className="w-full bg-transparent outline-none text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] pl-9 pr-3 py-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            >
              <X size={13} />
            </button>
          )}
        </label>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-4 shrink-0">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onClick={() => handleTopic(topic)} />
        ))}
      </div>

      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden mb-3 sm:mb-4 flex flex-col">
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">
              Frequently asked questions
            </h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'answer' : 'answers'}
              {query ? ` matching “${query}”` : ' ready to help'}
            </div>
          </div>
          <span className="shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
            FAQ
          </span>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 sm:py-14 px-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
              <CircleHelp size={22} />
            </div>
            <h3 className="font-bold font-manrope text-sm text-[var(--foreground)] mb-1">No answers matched</h3>
            <p className="text-[11px] text-[var(--muted-foreground)] max-w-[240px] leading-relaxed">
              Try a broader search, or reach us directly with the form below.
            </p>
          </div>
        ) : (
          <div>
            {filteredFaqs.map((item) => (
              <FaqRow
                key={item.id}
                item={item}
                open={openId === item.id}
                onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            <Mail size={15} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Still need a hand?</h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Send a message and we’ll reply within 24 hours.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-2.5">
          <div>
            <label
              htmlFor="help-subject"
              className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-1"
            >
              Subject
            </label>
            <input
              id="help-subject"
              type="text"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="A one-line summary of your issue"
              data-testid="input-help-subject"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="help-message"
              className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-1"
            >
              Message
            </label>
            <textarea
              id="help-message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Share any relevant details, what you tried, and what you expected to happen."
              data-testid="input-help-message"
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
              <Clock3 size={12} /> Typical reply in a few hours
            </span>
            <button
              type="submit"
              disabled={!form.subject.trim() || !form.message.trim() || sent}
              data-testid="button-help-submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sent ? (
                <>
                  <CheckCircle2 size={13} /> Sent
                </>
              ) : (
                <>
                  <Send size={13} /> Send message
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <div className="mt-2 sm:mt-3 shrink-0 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2.5 py-1.5 leading-tight">
        This is a local demo · Messages and searches are held in state only. Nothing is sent to a server.
      </div>
    </div>
  );
}

export default HelpPage;
