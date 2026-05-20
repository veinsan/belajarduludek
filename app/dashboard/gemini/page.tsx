import { getSession } from "@/lib/auth";
import { GeminiChat } from "@/components/gemini-chat";

export default async function GeminiPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
            AI · Gemini
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Asisten belajar
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Gemini AI
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Tanya apa saja tentang materi pelajaranmu. Cocok untuk menjelaskan
            konsep, meringkas topik, atau membantu mengerjakan PR.
          </p>
        </div>
      </section>

      <GeminiChat />
    </div>
  );
}
