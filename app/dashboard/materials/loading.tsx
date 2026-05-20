import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Materi kamu</h1>
          <p className="text-sm text-muted-foreground">
            Kumpulan materi belajar yang sudah kamu simpan.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/materials/new">Buat Materi Baru</Link>
        </Button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <Card className="h-full">
              <CardHeader>
                <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
                <div className="mt-3 h-3 w-1/3 animate-pulse rounded-md bg-muted" />
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
