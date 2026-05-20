"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AiChat() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    const nextHistory: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        reply?: string;
      };
      if (!res.ok || !data.reply) {
        setError(data.error ?? "Gagal mengirim pesan.");
        return;
      }
      setMessages([
        ...nextHistory,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Buka chat AI"
      >
        Tanya AI
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex h-[min(70vh,540px)] w-[min(calc(100vw-2rem),380px)] flex-col rounded-xl border bg-background shadow-2xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col">
          <p className="text-sm font-semibold">Tanya AI</p>
          <p className="text-xs text-muted-foreground">
            Asisten belajar kamu
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-2 py-1 text-lg leading-none text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Tutup chat"
        >
          ×
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tanya apa saja tentang materi pelajaranmu. Aku siap bantu.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <li
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-foreground text-background"
                    : "mr-auto bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </li>
            ))}
            {sending ? (
              <li className="mr-auto rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Mengetik...
              </li>
            ) : null}
          </ul>
        )}
      </div>
      {error ? (
        <p className="px-4 pb-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t p-3"
      >
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan..."
          disabled={sending}
          maxLength={2000}
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending || input.trim().length === 0}
        >
          Kirim
        </Button>
      </form>
    </div>
  );
}
