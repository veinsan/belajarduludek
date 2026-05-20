import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Tryout</h1>
        <p className="text-sm text-muted-foreground">
          Gabungkan beberapa deck jadi satu kuis besar.
        </p>
      </div>
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-3 w-full animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3"
              >
                <div className="size-4 shrink-0 animate-pulse rounded bg-muted" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
                  <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
          <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        </CardFooter>
      </Card>
    </div>
  );
}
