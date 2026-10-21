import { AlertCircle, Loader2, RotateCcw, Send, Sparkles, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useChatHistory, useResetChat, useSendChat } from '@/hooks/use-chat';
import PageHead from '../shared/PageHead';

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

const STARTER_PROMPTS = ['Help me outline a project', 'Tidy up this idea', 'Write a thoughtful follow-up'];

const EMPTY_REPLY = 'Hello! I’m your N-drive assistant. What would you like to work through today?';

const safeText = (msg) => {
  if (!msg) return '';
  if (typeof msg.text === 'string') return msg.text;
  if (typeof msg.content === 'string') return msg.content;
  return '';
};

export function Assistant() {
  const history = useChatHistory();
  const send = useSendChat();
  const reset = useResetChat();

  const [input, setInput] = useState('');
  const [pasteWarning, setPasteWarning] = useState(false);

  const endRef = useRef(null);
  const warningTimer = useRef(null);
  const messages = useMemo(() => {
    const list = history.data ?? [];

    if (history.isLoading) return [];
    if (list.length === 0) {
      return [{ role: 'assistant', text: EMPTY_REPLY }];
    }
    return list;
  }, [history.data, history.isLoading]);

  const isBusy = send.isPending;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isBusy]);

  useEffect(() => () => clearTimeout(warningTimer.current), []);

  const submit = async (value) => {
    const text = (value ?? input ?? '').trim();
    if (!text || isBusy) return;

    setInput('');
    try {
      await send.mutateAsync(text);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not reach the assistant';
      toast.error(msg);
      setInput(text);
    }
  };

  const handleReset = async () => {
    if (isBusy || reset.isPending) return;
    try {
      await reset.mutateAsync();
      toast.success('Chat cleared');
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not reset chat');
    }
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

  const renderMessages = () => {
    if (history.isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center py-16">
          <Loader2 className="size-5 animate-spin text-[var(--muted-foreground)]" />
        </div>
      );
    }

    if (history.isError) {
      return (
        <div className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="text-center max-w-xs">
            <p className="text-sm text-[var(--muted-foreground)] mb-3">Couldn’t load your chat history.</p>
            <button
              type="button"
              onClick={() => history.refetch()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const text = msg.text ?? '';
          return (
            <div key={i} className={`flex items-start gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
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
                {text || '\u00A0'}
              </div>
            </div>
          );
        })}

        {isBusy && (
          <div className="flex items-start gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
              <Sparkles size={14} />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-3 py-2 bg-[var(--muted)] text-[var(--muted-foreground)] text-[12px] sm:text-[13px] inline-flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              Thinking…
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Your thinking partner"
        title="Assistant"
        subtitle="A private space to get unstuck, sketch ideas and find the next step."
        actions={
          <button
            type="button"
            onClick={handleReset}
            disabled={reset.isPending || isBusy || messages.length <= 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} className={reset.isPending ? 'animate-spin' : ''} />
            {reset.isPending ? 'Resetting…' : 'New chat'}
          </button>
        }
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
              Private · end-to-end encrypted history
            </span>
          </div>
          <span className="ml-auto shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
            PRIVATE
          </span>
        </div>

        {renderMessages()}

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

          {messages.length <= 1 && !isBusy && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submit(prompt)}
                  className="text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-[0.97]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
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
                  submit();
                }
              }}
              rows={1}
              placeholder="Ask anything, or start with a thought…"
              aria-label="Message assistant"
              disabled={isBusy || history.isError}
              className="flex-1 resize-none bg-transparent outline-none text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] px-2 py-1.5 max-h-32 disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!input.trim() || isBusy || history.isError}
            >
              {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>

          <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2 py-1 leading-tight">
            Your conversation is stored encrypted on the server. Use “New chat” to start fresh.
          </div>
        </div>
      </section>
    </div>
  );
}

export default Assistant;
