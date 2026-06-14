import Link from "next/link";
import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth";
import { KelasExplanation } from "@/components/kelas-explanation";

type PageProps = { params: Promise<{ videoId: string }> };

type VideoMetaResponse = {
  items?: Array<{
    snippet?: { title?: string; channelTitle?: string };
  }>;
};

async function fetchVideoMeta(
  videoId: string
): Promise<{ title: string; channelTitle: string } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("id", videoId);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("key", apiKey);
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as VideoMetaResponse;
    const snippet = data.items?.[0]?.snippet;
    if (!snippet?.title || !snippet.channelTitle) return null;
    return { title: snippet.title, channelTitle: snippet.channelTitle };
  } catch {
    return null;
  }
}

export default async function KelasVideoPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { videoId } = await params;
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) notFound();

  const meta = await fetchVideoMeta(videoId);
  if (!meta) notFound();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Link
          href="/dashboard/kelas"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Kembali ke Kelas
        </Link>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {meta.channelTitle}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {meta.title}
          </h1>
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={meta.title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>

      <KelasExplanation key={videoId} videoId={videoId} title={meta.title} />
    </div>
  );
}
