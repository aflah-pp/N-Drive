import { AlertCircle, Send, Sparkles, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import PageHead from './PageHead';

const looksLikeCode = (text) => {
  if (!text || text.length < 3) return false;
  const patterns = [
    /```[\s\S]*```/,
    /`[^`\n]+`/,
    /\b(function|const|let|var|class|def|async|await|return|import|export|public|private)\b/,
    /=>\s*[{(]/,
    /<\/?[a-zA-Z][^>]*>/,
    /;\s*$/m,
    /^\s*(#include|#define|package\s+\w+|using\s+namespace)/m,
    /[{}]\s*;/,
    /^\s*def\s+\w+\s*\(/m,
    /\bconsole\.(log|warn|error)\b/,
    /\bprintf\s*\(/,
  ];
  return patterns.some((re) => re.test(text));
};

const DUMMY_REPLIES = [
  "Here's a useful place to begin: make the next step small enough to finish today. Start with one clear outcome, then trim anything that doesn't serve it.",
  "Good prompt. I'd break this into three parts: what you know, what you're guessing, and what you need to find out. That last column is where the real work lives.",
  "One way to think about it: write the version you'd send a friend, then the version you'd send a boss. The truth usually sits between them.",
  'Try sketching the smallest possible answer first. You can always add layers once the shape is right — the reverse is much harder.',
];

const pickReply = () => DUMMY_REPLIES[Math.floor(Math.random() * DUMMY_REPLIES.length)];

const prompts = ['Help me outline a project', 'Tidy up this idea', 'Write a thoughtful follow-up'];

export function Assistant({ messages: messagesProp, input: inputProp, setInput: setInputProp, onSend: onSendProp }) {
  const isControlled = Array.isArray(messagesProp);

  const [localMessages, setLocalMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I’m a local demo assistant. What would you like to work through today?',
    },
  ]);
  const [localInput, setLocalInput] = useState('');
  const [pasteWarning, setPasteWarning] = useState(false);

  const messages = isControlled ? messagesProp : localMessages;
  const input = isControlled ? inputProp : localInput;
  const setInput = isControlled ? setInputProp : setLocalInput;

  const endRef = useRef(null);
  const warningTimer = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  useEffect(() => () => clearTimeout(warningTimer.current), []);

  const send = (value) => {
    if (isControlled) {
      onSendProp?.(value);
      return;
    }
    const text = (value ?? input ?? '').trim();
    if (!text) return;
    setLocalMessages((old) => [...old, { role: 'user', text }, { role: 'assistant', text: pickReply() }]);
    setLocalInput('');
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData?.getData('text') ?? '';
    if (looksLikeCode(pasted)) {
      e.preventDefault();
      setPasteWarning(true);
      clearTimeout(warningTimer.current);
      warningTimer.current = setTimeout(() => setPasteWarning(false), 5000);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Your thinking partner"
        title="Assistant"
        subtitle="A private space to get unstuck, sketch ideas and find the next step."
      />

      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <strong className="block font-bold font-manrope text-xs sm:text-sm text-[var(--foreground)] truncate">
              N-drive assistant
            </strong>
            <span className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate">
              {isControlled ? 'Connected to your handler' : 'Local demo · replies are generated in the browser'}
            </span>
          </div>
          <span className="ml-auto shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
            PRIVATE
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex items-start gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                data-testid={`message-${msg.role}-${i}`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--secondary)] text-[var(--secondary-foreground)]'
                  }`}
                  aria-hidden="true"
                >
                  {isUser ? <UserRound size={14} /> : <Sparkles size={14} />}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 text-[12px] sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-sm'
                      : 'bg-[var(--muted)] text-[var(--foreground)] rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="border-t border-[var(--border)] p-2.5 sm:p-3 space-y-2 shrink-0">
          {pasteWarning && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 px-2.5 py-1.5 text-[11px] sm:text-xs leading-snug"
            >
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span className="flex-1">
                Code is not allowed in this chat. Please describe your question in plain language.
              </span>
              <button
                type="button"
                onClick={() => setPasteWarning(false)}
                className="shrink-0 hover:opacity-70"
                aria-label="Dismiss warning"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {prompts.map((prompt, i) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                className="text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-[0.97]"
                data-testid={`prompt-${i}`}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 focus-within:ring-2 focus-within:ring-[var(--ring)] transition-shadow"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask anything, or start with a thought…"
              aria-label="Message assistant"
              data-testid="input-chat-message"
              className="flex-1 resize-none bg-transparent outline-none text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] px-2 py-1.5 max-h-32"
            />
            <button
              type="submit"
              aria-label="Send message"
              data-testid="button-send-message"
              className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!input?.trim()}
            >
              <Send size={14} />
            </button>
          </form>

          <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2 py-1 leading-tight">
            {isControlled
              ? 'Replies come from your onSend handler.'
              : 'Frontend demo only. Replies are picked at random from a small local list — no AI service is connected.'}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Assistant;
