"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, MailCheck, Presentation } from "lucide-react";

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
import { cn } from "@/lib/utils";

type RoleChoice = "MURID" | "GURU";

const ROLE_CHOICES: {
  value: RoleChoice;
  label: string;
  description: string;
  icon: typeof GraduationCap;
}[] = [
  {
    value: "MURID",
    label: "Murid",
    description: "Belajar dari deck & materi",
    icon: GraduationCap,
  },
  {
    value: "GURU",
    label: "Guru",
    description: "Buat konten untuk murid",
    icon: Presentation,
  },
];

export default function RegisterPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<RoleChoice>("MURID");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Gagal mendaftar.");
        return;
      }
      setRegistered(true);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  if (registered) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="animate-enter-up w-full max-w-sm border-border-strong text-center shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
          <CardHeader className="items-center">
            <span className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl border border-primary-light/30 bg-primary/20 text-primary-light">
              <MailCheck className="size-7" />
            </span>
            <CardTitle>Pendaftaran terkirim!</CardTitle>
            <CardDescription>
              Akun <span className="font-semibold text-foreground">{email}</span>{" "}
              sedang menunggu persetujuan admin. Setelah disetujui, kamu bisa
              langsung masuk.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Ke halaman masuk</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="animate-enter-up w-full max-w-sm border-border-strong shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
        <CardHeader className="animate-enter-up animation-delay-100">
          <CardTitle>Daftar akun baru</CardTitle>
          <CardDescription>
            Akun baru ditinjau dulu oleh admin sebelum bisa dipakai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="register-form" onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="animate-enter-up animation-delay-100 flex flex-col gap-2">
              <Label>Daftar sebagai</Label>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Pilih peran">
                {ROLE_CHOICES.map((choice) => {
                  const isActive = role === choice.value;
                  const Icon = choice.icon;
                  return (
                    <button
                      key={choice.value}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setRole(choice.value)}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                        isActive
                          ? "border-primary-light/50 bg-primary/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "border-border-strong bg-elevated/40 hover:border-border-strong hover:bg-elevated"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          isActive ? "text-primary-light" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-sm font-semibold">{choice.label}</span>
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        {choice.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="animate-enter-up animation-delay-200 flex flex-col gap-2">
              <Label htmlFor="name">Nama lengkap</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                className="border-border-strong bg-elevated/40"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="animate-enter-up animation-delay-300 flex flex-col gap-2">
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
            <div className="animate-enter-up animation-delay-400 flex flex-col gap-2">
              <Label htmlFor="password">Kata sandi</Label>
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
              <p className="text-xs text-muted-foreground">
                Minimal 8 karakter
              </p>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </CardContent>
        <CardFooter className="animate-enter-up animation-delay-400 flex flex-col gap-3">
          <Button
            type="submit"
            form="register-form"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Memproses..." : "Daftar"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
