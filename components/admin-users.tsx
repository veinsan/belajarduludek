"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, RotateCcw, ShieldCheck, Trash2, UserX, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Role = "SUPERADMIN" | "GURU" | "MURID";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "MURID", label: "Murid" },
  { value: "GURU", label: "Guru" },
  { value: "SUPERADMIN", label: "Admin" },
];

const ROLE_LABEL: Record<Role, string> = {
  MURID: "Murid",
  GURU: "Guru",
  SUPERADMIN: "Admin",
};

const selectClass =
  "h-7 rounded-md border border-border bg-input/30 px-2 text-[0.8rem] font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminUsers({
  currentUserId,
  pending,
  approved,
  rejected,
}: {
  currentUserId: string;
  pending: AdminUser[];
  approved: AdminUser[];
  rejected: AdminUser[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  // Role chosen in each pending/rejected row's dropdown before approval.
  const [roleChoice, setRoleChoice] = React.useState<Record<string, Role>>({});

  async function send(
    id: string,
    method: "PATCH" | "DELETE",
    body?: Record<string, unknown>
  ) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setBusyId(null);
    }
  }

  function RoleSelect({ user }: { user: AdminUser }) {
    const chosen = roleChoice[user.id] ?? user.role;
    return (
      <>
        <label className="sr-only" htmlFor={`role-${user.id}`}>
          Peran untuk {user.name}
        </label>
        <select
          id={`role-${user.id}`}
          className={selectClass}
          value={chosen}
          disabled={busyId === user.id}
          onChange={(e) =>
            setRoleChoice((prev) => ({
              ...prev,
              [user.id]: e.target.value as Role,
            }))
          }
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground">
          <Clock3 className="size-4 text-amber-300" />
          Menunggu persetujuan
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            {pending.length}
          </span>
        </h2>

        {pending.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-4">
            <ShieldCheck className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Semua beres — tidak ada akun yang menunggu persetujuan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((u) => {
              const chosen = roleChoice[u.id] ?? u.role;
              const busy = busyId === u.id;
              return (
                <Card
                  key={u.id}
                  className="flex flex-row flex-wrap items-center justify-between gap-3 border-amber-300/20 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{u.name}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {u.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Daftar {formatDate(u.createdAt)} · minta peran{" "}
                      <span className="font-semibold text-amber-200">
                        {ROLE_LABEL[u.role]}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleSelect user={u} />
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        send(u.id, "PATCH", {
                          status: "APPROVED",
                          role: chosen,
                        })
                      }
                    >
                      <Check />
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        send(u.id, "PATCH", { status: "REJECTED" })
                      }
                    >
                      <X />
                      Tolak
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {rejected.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground">
            <UserX className="size-4 text-destructive" />
            Ditolak
            <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive">
              {rejected.length}
            </span>
          </h2>
          <div className="flex flex-col gap-2">
            {rejected.map((u) => {
              const chosen = roleChoice[u.id] ?? u.role;
              const busy = busyId === u.id;
              return (
                <Card
                  key={u.id}
                  className="flex flex-row flex-wrap items-center justify-between gap-3 border-destructive/25 px-4 py-3 opacity-90"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{u.name}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {u.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Daftar {formatDate(u.createdAt)} · pendaftaran ditolak
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleSelect user={u} />
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        send(u.id, "PATCH", {
                          status: "APPROVED",
                          role: chosen,
                        })
                      }
                    >
                      <RotateCcw />
                      Setujui ulang
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => send(u.id, "DELETE")}
                    >
                      <Trash2 />
                      Hapus
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-300" />
          Akun aktif
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {approved.length}
          </span>
        </h2>

        <div className="flex flex-col gap-2">
          {approved.map((u) => {
            const isSelf = u.id === currentUserId;
            const busy = busyId === u.id;
            return (
              <Card
                key={u.id}
                className="flex flex-row flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">
                    {u.name}
                    {isSelf && (
                      <span className="ml-2 text-xs font-medium text-muted-foreground">
                        (Anda)
                      </span>
                    )}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {u.email}
                  </span>
                </div>
                {isSelf ? (
                  <span
                    className={cn(
                      "rounded-md border border-border px-2.5 py-1 text-xs font-semibold",
                      "text-foreground"
                    )}
                  >
                    {ROLE_LABEL[u.role]}
                  </span>
                ) : (
                  <select
                    aria-label={`Peran ${u.name}`}
                    className={selectClass}
                    value={u.role}
                    disabled={busy}
                    onChange={(e) =>
                      send(u.id, "PATCH", { role: e.target.value })
                    }
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
