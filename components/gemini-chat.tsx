"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Jelaskan fotosintesis secara sederhana.",
  "Apa rumus dasar gerak parabola?",
  "Ringkas penyebab Perang Diponegoro.",
  "Bagaimana cara menyetarakan reaksi redoks?",
];

export function GeminiChat() {
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

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;
    setError(null);
    const nextHistory: ChatMessage[] = [
      ...messages,
      { role: "user", content: text.trim() },
    ];
    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/gemini/chat", {
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
      inputRef.current?.focus();
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(input);
  }

  return (
    <Card className="flex h-[min(70vh,640px)] flex-col p-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Mulai dari sini
              </p>
              <p className="text-base font-bold tracking-tight">
                Tanya apa saja tentang pelajaranmu.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={sending}
                    className="flex h-full w-full flex-col items-start gap-1 rounded-xl border bg-card p-4 text-left text-sm transition-colors hover:border-border-strong hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-primary-light">
                      Saran
                    </span>
                    <span className="font-medium">{suggestion}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <li
                key={i}
                className={cn(
                  "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-elevated"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </li>
            ))}
            {sending ? (
              <li className="mr-auto flex items-center gap-2 rounded-xl bg-elevated px-4 py-3 text-sm text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-primary-light" />
                Gemini sedang mengetik...
              </li>
            ) : null}
          </ul>
        )}
      </div>
      {error ? (
        <p className="px-6 pb-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-border p-4"
      >
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan tentang materi pelajaran..."
          disabled={sending}
          maxLength={2000}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={sending || input.trim().length === 0}
        >
          Kirim
        </Button>
      </form>
    </Card>
  );
}
