"use client";

import * as React from "react";
import {
  AlignRight,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  List,
  MessageSquare,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  SquarePen,
  ThumbsDown,
  ThumbsUp,
  Video,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type QuizQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

type CopilotPayload = {
  reply: string;
  quiz: QuizQuestion[];
  recommendations: string[];
  sources: string[];
  suggestions: string[];
};

type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; payload: CopilotPayload };

type StoredConversation = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

type StoredBookmark = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

const CREDIT_INITIAL = 3000;
const CREDIT_COST = 159;
const MAX_CONVERSATIONS = 30;

const KEY_CREDITS = "bdd_copilot_credits";
const KEY_CONVERSATIONS = "bdd_copilot_conversations";
const KEY_BOOKMARKS = "bdd_copilot_bookmarks";
const KEY_PROMO = "bdd_copilot_promo_dismissed";

const SUGGESTIONS: string[] = [
  "Minta panduan belajar supaya nilai ku naik",
  "Buatkan latihan soal!",
  "Jelaskan apa itu fotosintesis dengan bahasa bayi",
];

function formatCredits(n: number): string {
  return n.toLocaleString("id-ID");
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function GeminiCopilot() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [credits, setCredits] = React.useState(CREDIT_INITIAL);
  const [creditMenuOpen, setCreditMenuOpen] = React.useState(false);

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarTab, setSidebarTab] = React.useState<"riwayat" | "bookmark">(
    "riwayat"
  );
  const [search, setSearch] = React.useState("");

  const [promoDismissed, setPromoDismissed] = React.useState(false);
  const [conversations, setConversations] = React.useState<
    StoredConversation[]
  >([]);
  const [bookmarks, setBookmarks] = React.useState<StoredBookmark[]>([]);
  const [currentId, setCurrentId] = React.useState<string>("");

  const [showScrollDown, setShowScrollDown] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const hydrated = React.useRef(false);

  /* --- hydrate from localStorage once ---
     setState here is intentional: reading storage in a lazy useState
     initializer would run during SSR and cause a hydration mismatch, so we
     sync from the external store after mount instead. */
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCredits(readLocal<number>(KEY_CREDITS, CREDIT_INITIAL));
    setConversations(readLocal<StoredConversation[]>(KEY_CONVERSATIONS, []));
    setBookmarks(readLocal<StoredBookmark[]>(KEY_BOOKMARKS, []));
    setPromoDismissed(readLocal<boolean>(KEY_PROMO, false));
    setCurrentId(newId());
    /* eslint-enable react-hooks/set-state-in-effect */
    hydrated.current = true;
  }, []);

  /* --- persist primitive bits --- */
  React.useEffect(() => {
    if (hydrated.current) writeLocal(KEY_CREDITS, credits);
  }, [credits]);
  React.useEffect(() => {
    if (hydrated.current) writeLocal(KEY_PROMO, promoDismissed);
  }, [promoDismissed]);
  React.useEffect(() => {
    if (hydrated.current) writeLocal(KEY_BOOKMARKS, bookmarks);
  }, [bookmarks]);
  React.useEffect(() => {
    if (hydrated.current) writeLocal(KEY_CONVERSATIONS, conversations);
  }, [conversations]);

  /* --- upsert current conversation whenever messages change --- */
  React.useEffect(() => {
    if (!hydrated.current || !currentId || messages.length === 0) return;
    const firstUser = messages.find((m) => m.role === "user");
    const title =
      firstUser && firstUser.role === "user"
        ? firstUser.content.slice(0, 60)
        : "Percakapan baru";
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== currentId);
      next.unshift({ id: currentId, title, messages, updatedAt: Date.now() });
      return next.slice(0, MAX_CONVERSATIONS);
    });
  }, [messages, currentId]);

  /* --- autoscroll --- */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distance > 240);
  }

  function scrollToBottom() {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  /* --- send a message --- */
  const send = React.useCallback(
    async (text: string, base: Message[]) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      setError(null);
      const userMsg: Message = { id: newId(), role: "user", content: trimmed };
      const next = [...base, userMsg];
      setMessages(next);
      setInput("");
      setSending(true);

      const history = next.map((m) =>
        m.role === "user"
          ? { role: "user" as const, content: m.content }
          : { role: "assistant" as const, content: m.payload.reply }
      );

      try {
        const res = await fetch("/api/gemini/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = (await res.json().catch(() => ({}))) as Partial<
          CopilotPayload
        > & { error?: string };
        if (!res.ok || typeof data.reply !== "string") {
          setError(data.error ?? "Gagal mengirim pesan.");
          return;
        }
        const payload: CopilotPayload = {
          reply: data.reply,
          quiz: data.quiz ?? [],
          recommendations: data.recommendations ?? [],
          sources: data.sources ?? [],
          suggestions: data.suggestions ?? [],
        };
        setMessages([
          ...next,
          { id: newId(), role: "assistant", payload },
        ]);
        setCredits((c) => Math.max(0, c - CREDIT_COST));
      } catch {
        setError("Tidak dapat terhubung ke server.");
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [sending]
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input, messages);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input, messages);
    }
  }

  function retry() {
    let idx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        idx = i;
        break;
      }
    }
    if (idx < 0) return;
    const userMsg = messages[idx];
    if (userMsg.role !== "user") return;
    void send(userMsg.content, messages.slice(0, idx));
  }

  function startNewChat() {
    setMessages([]);
    setCurrentId(newId());
    setError(null);
    setSidebarOpen(false);
    setInput("");
  }

  function loadConversation(conv: StoredConversation) {
    setMessages(conv.messages);
    setCurrentId(conv.id);
    setSidebarOpen(false);
    setError(null);
  }

  function toggleBookmark(messageId: string, payload: CopilotPayload) {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === messageId)) {
        return prev.filter((b) => b.id !== messageId);
      }
      return [
        {
          id: messageId,
          title: payload.reply.slice(0, 70),
          content: payload.reply,
          createdAt: Date.now(),
        },
        ...prev,
      ];
    });
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="relative flex h-[calc(100dvh-5rem)] min-h-[560px] flex-col">
      {/* top bar */}
      <div className="flex shrink-0 items-center justify-end pb-2">
        <div className="flex items-center gap-2">
          <CreditPill
            credits={credits}
            open={creditMenuOpen}
            onToggle={() => setCreditMenuOpen((o) => !o)}
            onClose={() => setCreditMenuOpen(false)}
          />
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Riwayat percakapan"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <AlignRight className="size-5" />
          </button>
          <button
            type="button"
            onClick={startNewChat}
            aria-label="Chat baru"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <SquarePen className="size-5" />
          </button>
        </div>
      </div>

      {/* scrollable body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        <div className="mx-auto w-full max-w-3xl px-1 py-4">
          {isEmpty ? (
            <EmptyState
              promoDismissed={promoDismissed}
              onDismissPromo={() => setPromoDismissed(true)}
              onPickSuggestion={(s) => void send(s, messages)}
              disabled={sending}
            />
          ) : (
            <ul className="flex flex-col gap-7">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <li key={msg.id} className="flex justify-end">
                    <div className="animate-enter-up max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-sm leading-relaxed text-primary-foreground">
                      {msg.content}
                    </div>
                  </li>
                ) : (
                  <li key={msg.id}>
                    <AssistantTurn
                      payload={msg.payload}
                      onRetry={retry}
                      bookmarked={bookmarks.some((b) => b.id === msg.id)}
                      onToggleBookmark={() =>
                        toggleBookmark(msg.id, msg.payload)
                      }
                      onPick={(s) => void send(s, messages)}
                      disabled={sending}
                    />
                  </li>
                )
              )}
              {sending ? (
                <li>
                  <div className="flex items-center gap-3">
                    <Avatar loading />
                    <span className="animate-pulse text-sm text-muted-foreground">
                      Sedang berpikir...
                    </span>
                  </div>
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </div>

      {/* error */}
      {error ? (
        <p
          className="mx-auto w-full max-w-3xl px-1 pb-1 text-center text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {/* composer */}
      <div className="relative shrink-0 pt-2">
        {showScrollDown && !isEmpty ? (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label="Gulir ke bawah"
            className="absolute -top-6 left-1/2 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <ArrowDown className="size-4" />
          </button>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-3xl rounded-2xl border border-border-strong bg-card/60 p-3 transition-colors focus-within:border-primary/50"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Lagi butuh bantuan apa sobat?"
            rows={1}
            maxLength={2000}
            disabled={sending}
            className="max-h-40 w-full resize-none bg-transparent px-2 pt-1 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-full bg-elevated text-muted-foreground"
              >
                <Plus className="size-4" />
              </span>
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-full bg-elevated text-sm font-medium text-muted-foreground"
              >
                √x
              </span>
            </div>
            <button
              type="submit"
              disabled={sending || input.trim().length === 0}
              aria-label="Kirim"
              className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </form>
        <p className="pt-3 text-center text-xs text-muted-foreground">
          *Gemini bisa salah, tolong cek lagi yaa!
        </p>
      </div>

      {/* sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tab={sidebarTab}
        onTab={setSidebarTab}
        search={search}
        onSearch={setSearch}
        conversations={conversations}
        bookmarks={bookmarks}
        onNewChat={startNewChat}
        onOpenConversation={loadConversation}
        onRemoveBookmark={(id) =>
          setBookmarks((prev) => prev.filter((b) => b.id !== id))
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Credit pill + popover                                               */
/* ------------------------------------------------------------------ */

function CreditPill({
  credits,
  open,
  onToggle,
  onClose,
}: {
  credits: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full border border-border-strong bg-card/70 px-3.5 py-1.5 text-sm font-semibold transition-colors hover:bg-elevated"
      >
        <Sparkles className="size-4 text-amber-400" />
        <span className="text-[#ef5a3c]">{formatCredits(credits)}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 animate-enter-up rounded-2xl border border-border-strong bg-popover p-5 shadow-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Sparkles className="size-4 text-amber-400" />
              Credit Balance
            </div>
            <p className="text-3xl font-extrabold text-[#ef5a3c]">
              {formatCredits(credits)}
            </p>
            <button
              type="button"
              className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Top Up Credit
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

function EmptyState({
  promoDismissed,
  onDismissPromo,
  onPickSuggestion,
  disabled,
}: {
  promoDismissed: boolean;
  onDismissPromo: () => void;
  onPickSuggestion: (s: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-8 pt-6 md:pt-10">
      <h1 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl">
        Lagi butuh bantuan apa?
      </h1>

      {!promoDismissed ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-border-strong bg-card/80 p-5 pr-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_88%_-10%,rgba(250,204,21,0.14),transparent_55%)]"
          />
          <button
            type="button"
            onClick={onDismissPromo}
            aria-label="Tutup"
            className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
          >
            <X className="size-4" />
          </button>
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <PencilLine className="mt-0.5 size-6 shrink-0 text-amber-400" />
              <div className="flex flex-col gap-0.5">
                <p className="font-bold tracking-tight">
                  Hai! Kamu belum pernah ikut Try Out ya
                </p>
                <p className="text-sm text-muted-foreground">
                  Yuk coba Try out biar Copilot bisa kasih rekomendasi yang
                  lebih pas.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl border border-border-strong bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-elevated"
            >
              Coba Try Out
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex w-full max-w-xl flex-wrap justify-center gap-3">
        {SUGGESTIONS.map((s, index) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onPickSuggestion(s)}
            style={{ animationDelay: `${index * 70}ms` }}
            className="animate-enter-up flex w-[260px] items-center gap-3 rounded-2xl border border-border-strong bg-card/70 px-4 py-3.5 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookOpen className="size-5 shrink-0 text-primary-light" />
            <span>{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Assistant turn                                                      */
/* ------------------------------------------------------------------ */

function Avatar({ loading = false }: { loading?: boolean }) {
  return (
    <div className="relative size-8 shrink-0">
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#7c5cff,#3aa0c9,#b6a6f3,#7c5cff)]",
          loading && "animate-spin"
        )}
      />
      <div className="absolute inset-[2px] flex items-center justify-center rounded-full bg-background">
        <Bot className="size-4 text-primary-light" />
      </div>
    </div>
  );
}

function AssistantTurn({
  payload,
  onRetry,
  bookmarked,
  onToggleBookmark,
  onPick,
  disabled,
}: {
  payload: CopilotPayload;
  onRetry: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onPick: (s: string) => void;
  disabled: boolean;
}) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Avatar />
        <p className="whitespace-pre-wrap pt-1 text-sm leading-relaxed text-foreground">
          {payload.reply}
        </p>
      </div>

      <div className="pl-11">
        {payload.quiz.length > 0 ? <QuizBlock quiz={payload.quiz} /> : null}

        {payload.recommendations.length > 0 ? (
          <RecommendationCards
            titles={payload.recommendations}
            onPick={onPick}
            disabled={disabled}
          />
        ) : null}

        {/* feedback row */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onRetry}
            disabled={disabled}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <button
              type="button"
              aria-label="Suka"
              onClick={() => setVote((v) => (v === "up" ? null : "up"))}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground",
                vote === "up" && "text-primary-light"
              )}
            >
              <ThumbsUp className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Tidak suka"
              onClick={() => setVote((v) => (v === "down" ? null : "down"))}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground",
                vote === "down" && "text-destructive"
              )}
            >
              <ThumbsDown className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Bookmark"
              onClick={onToggleBookmark}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground",
                bookmarked && "text-primary-light"
              )}
            >
              <Bookmark
                className={cn("size-4", bookmarked && "fill-current")}
              />
            </button>
          </div>
        </div>

        {payload.sources.length > 0 ? (
          <SourcesAccordion sources={payload.sources} />
        ) : null}

        {payload.suggestions.length > 0 ? (
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Saran buat kamu:</p>
            <div className="flex flex-col gap-3">
              {payload.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(s)}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border-strong bg-card/50 px-4 py-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-elevated disabled:opacity-50"
                >
                  <span>{s}</span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary-light" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quiz block                                                          */
/* ------------------------------------------------------------------ */

function QuizBlock({ quiz }: { quiz: QuizQuestion[] }) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<Record<number, number>>({});
  const [revealed, setRevealed] = React.useState<Record<number, boolean>>({});

  const q = quiz[index];
  const total = quiz.length;
  const sel = selected[index];
  const reveal = revealed[index] ?? false;

  return (
    <div className="rounded-2xl border border-border-strong bg-elevated/50 p-5 md:p-6">
      <div className="mb-3 flex justify-end">
        <span className="text-xs text-muted-foreground">
          {index + 1} dari {total}
        </span>
      </div>

      <p className="mb-5 text-base font-medium leading-relaxed">{q.question}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {q.choices.map((choice, i) => {
          const isSelected = sel === i;
          const isCorrect = i === q.correctIndex;
          let tone =
            "border-border-strong bg-card/40 hover:border-primary/50";
          if (reveal && isCorrect) {
            tone = "border-emerald-500/70 bg-emerald-500/10 text-emerald-300";
          } else if (reveal && isSelected && !isCorrect) {
            tone = "border-red-500/70 bg-red-500/10 text-red-300";
          } else if (isSelected) {
            tone = "border-primary bg-primary/10";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                setSelected((prev) => ({ ...prev, [index]: i }))
              }
              className={cn(
                "rounded-xl border px-4 py-4 text-center text-sm leading-relaxed transition-colors",
                tone
              )}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {reveal && q.explanation ? (
        <p className="mt-4 rounded-xl bg-card/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {q.explanation}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            setRevealed((prev) => ({ ...prev, [index]: !reveal }))
          }
          className="flex items-center gap-1 text-sm font-medium text-primary-light transition-opacity hover:opacity-80"
        >
          Lihat Jawaban
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              reveal && "rotate-180"
            )}
          />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="flex items-center gap-1 rounded-xl bg-elevated px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Sebelumnya
          </button>
          <button
            type="button"
            disabled={index >= total - 1}
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Lanjut
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Recommendation cards                                                */
/* ------------------------------------------------------------------ */

function RecommendationCards({
  titles,
  onPick,
  disabled,
}: {
  titles: string[];
  onPick: (s: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="mt-5 flex gap-4 overflow-x-auto scrollbar-hide">
      {titles.map((title) => (
        <button
          key={title}
          type="button"
          disabled={disabled}
          onClick={() => onPick(`Aku mau belajar tentang ${title}`)}
          className="flex aspect-[4/3] w-[200px] shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#6d4ad6_0%,#3b8fb0_48%,#0c1b34_100%)] p-5 text-center text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {title}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sources accordion                                                   */
/* ------------------------------------------------------------------ */

function SourcesAccordion({ sources }: { sources: string[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border-strong bg-card/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-elevated"
      >
        <List className="size-4 text-muted-foreground" />
        {sources.length} Sumber
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="mt-3 flex flex-col gap-1 rounded-2xl border border-border-strong bg-card/50 p-2">
          {sources.map((src) => (
            <div
              key={src}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-elevated"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated text-muted-foreground">
                <Video className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium">{src}</span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar (history + bookmarks)                                       */
/* ------------------------------------------------------------------ */

function ChatSidebar({
  open,
  onClose,
  tab,
  onTab,
  search,
  onSearch,
  conversations,
  bookmarks,
  onNewChat,
  onOpenConversation,
  onRemoveBookmark,
}: {
  open: boolean;
  onClose: () => void;
  tab: "riwayat" | "bookmark";
  onTab: (t: "riwayat" | "bookmark") => void;
  search: string;
  onSearch: (s: string) => void;
  conversations: StoredConversation[];
  bookmarks: StoredBookmark[];
  onNewChat: () => void;
  onOpenConversation: (c: StoredConversation) => void;
  onRemoveBookmark: (id: string) => void;
}) {
  const term = search.trim().toLowerCase();
  const filteredConversations = term
    ? conversations.filter((c) => c.title.toLowerCase().includes(term))
    : conversations;
  const filteredBookmarks = term
    ? bookmarks.filter((b) => b.title.toLowerCase().includes(term))
    : bookmarks;

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(92vw,420px)] flex-col bg-sidebar transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={onNewChat}
            aria-label="Chat baru"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <SquarePen className="size-5" />
          </button>
        </div>

        <div className="px-5">
          <div className="flex items-center gap-2 rounded-full border border-border-strong bg-card/60 px-4 py-2.5">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Cari percakapan"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex border-b border-border px-5">
          {(["riwayat", "bookmark"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTab(t)}
              className={cn(
                "relative flex-1 pb-3 text-sm font-semibold capitalize transition-colors",
                tab === t ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t === "riwayat" ? "Riwayat" : "Bookmark"}
              {tab === t ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
          {tab === "riwayat" ? (
            filteredConversations.length === 0 ? (
              <EmptySidebar
                icon={<MessageSquare className="size-10" />}
                title="Kamu belum pernah memulai percakapan"
                subtitle="Riwayat percakapanmu dengan Copilot AI akan tersimpan di sini"
              />
            ) : (
              <ul className="flex flex-col gap-1">
                {filteredConversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onOpenConversation(c)}
                      className="w-full truncate rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-elevated"
                    >
                      {c.title || "Percakapan baru"}
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : filteredBookmarks.length === 0 ? (
            <EmptySidebar
              icon={<Bookmark className="size-10" />}
              title="Belum ada chat yang dibookmark"
              subtitle="Kamu bisa bookmark chat yang ingin kamu simpan untuk dibaca nanti"
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredBookmarks.map((b) => (
                <li
                  key={b.id}
                  className="flex items-start gap-2 rounded-xl border border-border-strong bg-card/50 px-3 py-3"
                >
                  <p className="flex-1 text-sm leading-relaxed">{b.title}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(b.id)}
                    aria-label="Hapus bookmark"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

function EmptySidebar({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-muted-foreground/70">{icon}</span>
      <p className="text-base font-bold tracking-tight text-muted-foreground">
        {title}
      </p>
      <p className="text-sm text-muted-foreground/80">{subtitle}</p>
    </div>
  );
}
