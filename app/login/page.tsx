"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  // 403 = akun belum/tidak disetujui — tampil sebagai pemberitahuan, bukan error.
  const [errorKind, setErrorKind] = React.useState<"error" | "notice">("error");
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorKind(res.status === 403 ? "notice" : "error");
        setError(data.error ?? "Gagal masuk.");
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="animate-enter-up w-full max-w-sm border-border-strong shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
        <CardHeader className="animate-enter-up animation-delay-100">
          <CardTitle>Masuk ke BelajarDuluDek</CardTitle>
          <CardDescription>
            Gunakan email dan kata sandi yang sudah kamu daftarkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={onSubmit} className="flex flex-col gap-4">
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
            <div className="animate-enter-up animation-delay-300 flex flex-col gap-2">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="border-border-strong bg-elevated/40"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? (
              errorKind === "notice" ? (
                <p
                  className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2.5 text-sm leading-relaxed text-amber-200"
                  role="alert"
                >
                  {error}
                </p>
              ) : (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )
            ) : null}
          </form>
        </CardContent>
        <CardFooter className="animate-enter-up animation-delay-400 flex flex-col gap-3">
          <Button
            type="submit"
            form="login-form"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Memproses..." : "Masuk"}
          </Button>
          <p className="text-sm text-muted-foreground">
            <Link href="/forgot" className="font-medium underline-offset-4 hover:underline">
              Lupa kata sandi?
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
              Daftar dulu
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
