import { type NextRequest } from "next/server";

import { getSession } from "@/lib/auth";

const SUBJECT_QUERIES: Record<string, string> = {
  fisika: "fisika dasar SMA",
  biologi: "biologi dasar SMA",
  kimia: "kimia dasar SMA",
  matematika: "matematika SMA",
};

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

export type KelasVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
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

  const subject = request.nextUrl.searchParams.get("subject")?.trim() ?? "";
  const query = SUBJECT_QUERIES[subject];
  if (!query) {
    return Response.json(
      { error: "Subject tidak dikenal." },
      { status: 400 }
    );
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "12");
  url.searchParams.set("q", query);
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

  const videos: KelasVideo[] = (data.items ?? [])
    .map((item) => {
      const videoId = item.id?.videoId;
      const title = item.snippet?.title;
      const channelTitle = item.snippet?.channelTitle;
      const thumbnail =
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.default?.url;
      if (!videoId || !title || !thumbnail || !channelTitle) return null;
      return { videoId, title, channelTitle, thumbnail };
    })
    .filter((v): v is KelasVideo => v !== null);

  return Response.json({ videos });
}
