import { type NextRequest } from "next/server";

import { getSession } from "@/lib/auth";

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { kind?: string; videoId?: string };
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: {
        medium?: { url?: string };
        high?: { url?: string };
        default?: { url?: string };
      };
    };
  }>;
  error?: { message?: string };
};

export type YouTubeVideoResult = {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
};

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "YOUTUBE_API_KEY belum dikonfigurasi." },
      { status: 500 }
    );
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return Response.json(
      { error: "Parameter q wajib diisi." },
      { status: 400 }
    );
  }
  if (q.length > 200) {
    return Response.json(
      { error: "Kata kunci terlalu panjang." },
      { status: 400 }
    );
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "6");
  url.searchParams.set("q", q);
  url.searchParams.set("key", apiKey);

  let upstream: Response;
  try {
    upstream = await fetch(url, { cache: "no-store" });
  } catch {
    return Response.json(
      { error: "Tidak dapat menghubungi YouTube." },
      { status: 502 }
    );
  }

  const data = (await upstream.json()) as YouTubeSearchResponse;

  if (!upstream.ok) {
    return Response.json(
      { error: data.error?.message ?? "Permintaan YouTube gagal." },
      { status: upstream.status }
    );
  }

  const videos: YouTubeVideoResult[] = (data.items ?? [])
    .map((item) => {
      const id = item.id?.videoId;
      const title = item.snippet?.title;
      const channelTitle = item.snippet?.channelTitle;
      const thumbnail =
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.default?.url;
      if (!id || !title || !thumbnail || !channelTitle) return null;
      return { id, title, thumbnail, channelTitle };
    })
    .filter((v): v is YouTubeVideoResult => v !== null);

  return Response.json({ videos });
}
