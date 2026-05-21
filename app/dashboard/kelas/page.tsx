import { getSession } from "@/lib/auth";
import { KelasBrowser } from "@/components/kelas-browser";
import { Reveal } from "@/components/reveal";

export default async function KelasPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="flex flex-col gap-10">
      <Reveal as="section" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Pelajaran video
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Kelas
          </h1>
          <p className="text-sm text-muted-foreground">
            Tonton video pelajaran SMA dari YouTube, lalu dapat penjelasan
            tambahan dari AI.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <KelasBrowser />
      </Reveal>
    </div>
  );
}
