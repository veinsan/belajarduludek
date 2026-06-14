import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

// `next start` hanya menyajikan isi public/ yang sudah ada saat build —
// berkas yang di-upload saat runtime (gambar flashcard, PDF buku) harus
// disajikan lewat route ini.
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { path: segments } = await params;

  const target = path.normalize(path.join(UPLOADS_ROOT, ...segments));
  // Tolak path traversal (mis. "..%2F..") keluar dari folder uploads.
  if (!target.startsWith(UPLOADS_ROOT + path.sep)) {
    return Response.json({ error: "Berkas tidak ditemukan." }, { status: 404 });
  }

  try {
    const info = await stat(target);
    if (!info.isFile()) {
      return Response.json({ error: "Berkas tidak ditemukan." }, { status: 404 });
    }
    const file = await readFile(target);
    const type =
      CONTENT_TYPES[path.extname(target).toLowerCase()] ??
      "application/octet-stream";
    return new Response(new Uint8Array(file), {
      headers: {
        "content-type": type,
        // Nama file memuat UUID acak, jadi isinya tidak pernah berubah.
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.json({ error: "Berkas tidak ditemukan." }, { status: 404 });
  }
}
