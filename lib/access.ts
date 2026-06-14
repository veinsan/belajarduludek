import type { Prisma, Role } from "@prisma/client";

/**
 * Konten milik GURU/SUPERADMIN bersifat publik (read-only) untuk semua
 * pengguna login — ini jalur "MURID menemukan konten Guru". Penulisan
 * (tambah/ubah/hapus) tetap dicek terhadap pemilik di masing-masing route.
 */
export const TEACHER_ROLES = ["GURU", "SUPERADMIN"] as const satisfies readonly Role[];

export function deckAccessWhere(userId: string): Prisma.DeckWhereInput {
  return {
    OR: [
      { userId },
      { user: { role: { in: [...TEACHER_ROLES] }, status: "APPROVED" } },
    ],
  };
}

export function materialAccessWhere(userId: string): Prisma.MaterialWhereInput {
  return {
    OR: [
      { userId },
      { user: { role: { in: [...TEACHER_ROLES] }, status: "APPROVED" } },
    ],
  };
}

/** Deck/materi guru yang BUKAN milik user sendiri — untuk seksi "dari Guru". */
export function teacherContentWhere(userId: string) {
  return {
    userId: { not: userId },
    user: { role: { in: [...TEACHER_ROLES] }, status: "APPROVED" as const },
  };
}
