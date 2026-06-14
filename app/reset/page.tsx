"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function ResetPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetForm />
    </React.Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramToken = searchParams.get("token") ?? "";

  const [token, setToken] = React.useState(paramToken);
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Gagal mengubah kata sandi.");
        return;
      }
      setSuccess(true);
      setMessage("Kata sandi berhasil diubah. Mengalihkan ke halaman masuk...");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="animate-enter-up w-full max-w-sm border-border-strong shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
        <CardHeader className="animate-enter-up animation-delay-100">
          <CardTitle>Atur ulang kata sandi</CardTitle>
          <CardDescription>
            Masukkan token reset dan kata sandi barumu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="reset-form" onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="animate-enter-up animation-delay-200 flex flex-col gap-2">
              <Label htmlFor="token">Token reset</Label>
              <Input
                id="token"
                type="text"
                className="border-border-strong bg-elevated/40"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div className="animate-enter-up animation-delay-300 flex flex-col gap-2">
              <Label htmlFor="password">Kata sandi baru</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="border-border-strong bg-elevated/40"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimal 8 karakter</p>
            </div>
            {message ? (
              <p
                className={
                  success
                    ? "rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300"
                    : "text-sm text-destructive"
                }
                role="alert"
              >
                {message}
              </p>
            ) : null}
          </form>
        </CardContent>
        <CardFooter className="animate-enter-up animation-delay-400 flex flex-col gap-3">
          <Button
            type="submit"
            form="reset-form"
            size="lg"
            className="w-full"
            disabled={submitting || success}
          >
            {submitting ? "Memproses..." : "Ubah kata sandi"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Ingat kata sandimu?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
