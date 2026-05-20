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

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function MaterialsPage() {
  const session = await getSession();
  if (!session) return null;

  const materials = await prisma.material.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Materi kamu
          </h1>
          <p className="text-sm text-muted-foreground">
            Kumpulan materi belajar yang sudah kamu simpan.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/materials/new">Buat Materi Baru</Link>
        </Button>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada materi</CardTitle>
            <CardDescription>
              Mulai dengan menyimpan materi pertamamu.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <li key={material.id}>
              <Link
                href={`/dashboard/materials/${material.id}`}
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {material.title}
                    </CardTitle>
                    <CardDescription className="pt-2 text-xs">
                      {dateFormatter.format(material.createdAt)}
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
