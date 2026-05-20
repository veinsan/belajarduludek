import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PathsPage() {
  const session = await getSession();
  if (!session) return null;

  const paths = await prisma.learningPath.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      _count: { select: { steps: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jalur belajar</h1>
          <p className="text-sm text-muted-foreground">
            Urutkan deck jadi jalur belajar bertahap.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/paths/new">Buat Jalur Baru</Link>
        </Button>
      </div>

      {paths.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada jalur belajar</CardTitle>
            <CardDescription>
              Mulai dengan membuat jalur belajar pertamamu.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <li key={path.id}>
              <Link
                href={`/dashboard/paths/${path.id}`}
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{path.title}</CardTitle>
                    <CardDescription className="pt-2 text-xs">
                      {path._count.steps} langkah
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
