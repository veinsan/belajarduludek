"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPage() {
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setToken(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string; token?: string };
      if (!res.ok) {
        setSent(false);
        setMessage(data.error ?? "Gagal mengirim permintaan.");
        return;
      }
      setSent(true);
      setMessage("Jika email terdaftar, instruksi reset telah dikirim.");
      if (data.token) setToken(data.token);
    } catch {
      setSent(false);
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="animate-enter-up w-full max-w-sm border-border-strong shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
        <CardHeader className="animate-enter-up animation-delay-100">
          <CardTitle>Lupa kata sandi</CardTitle>
          <CardDescription>
            Masukkan email akunmu — kami kirimkan token untuk mengatur ulang
            kata sandi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="forgot-form" onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="animate-enter-up animation-delay-200 flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="border-border-strong bg-elevated/40"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {message ? (
              <p
                className={
                  sent
                    ? "rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300"
                    : "text-sm text-destructive"
                }
                role="alert"
              >
                {message}
              </p>
            ) : null}
            {token ? (
              <div className="rounded-lg border border-border-strong bg-elevated/40 px-3 py-2.5 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Token (mode dev)
                </p>
                <code className="break-all text-xs">{token}</code>
                <p className="mt-2">
                  <Link
                    href={`/reset?token=${encodeURIComponent(token)}`}
                    className="text-sm font-medium text-primary-light underline-offset-4 hover:underline"
                  >
                    Lanjut atur ulang kata sandi →
                  </Link>
                </p>
              </div>
            ) : null}
          </form>
        </CardContent>
        <CardFooter className="animate-enter-up animation-delay-300 flex flex-col gap-3">
          <Button
            type="submit"
            form="forgot-form"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Mengirim..." : "Kirim token reset"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Ingat kata sandimu?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
