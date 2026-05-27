# BelajarDuluDek

BelajarDuluDek adalah aplikasi web belajar untuk siswa SMA Indonesia. Aplikasi ini membantu pengguna menyimpan materi, membuat ringkasan, membuat flashcard, menjalankan kuis/tryout, menonton video kelas, dan bertanya ke AI.

## Tech Stack

### Frontend

- **Next.js 16 App Router**: framework utama untuk routing, page rendering, layout, dan API route dalam satu project.
- **React 19**: membangun UI berbasis komponen, termasuk komponen interaktif seperti chat, quiz runner, deck cards, dan animasi reveal.
- **TypeScript**: menjaga tipe data untuk komponen, API body, session payload, quiz, dan data dari layanan eksternal.
- **Tailwind CSS v4**: styling utama untuk layout, spacing, warna, responsive design, dan animasi ringan.
- **shadcn/ui pattern**: komponen UI dasar seperti `Button`, `Card`, `Input`, `Label`, dan `Textarea`.
- **lucide-react**: ikon untuk memperjelas action dan visual card.
- **tw-animate-css + custom CSS animation**: animasi UI ringan seperti entrance animation, reveal-on-scroll, hover lift, floating preview, dan progress fill.

### Backend

- **Next.js Route Handlers**: endpoint backend berada di folder `app/api/**`.
- **Prisma ORM**: akses database dan model data aplikasi.
- **PostgreSQL**: database utama untuk user, deck, flashcard, materi, quiz, statistik, dan learning path.
- **@prisma/adapter-pg + pg**: adapter PostgreSQL untuk Prisma.
- **JWT + HTTP-only cookie**: sistem session menggunakan cookie `bdd_token`.
- **bcryptjs**: hashing password saat register dan verifikasi password saat login.

### Development Tooling

- **ESLint 9 + eslint-config-next**: linting kode Next.js/React.
- **dotenv**: membaca konfigurasi environment saat development.
- **Prisma CLI**: generate Prisma Client dan mengelola schema database.

## Layanan Eksternal yang Digunakan

### Google Gemini API

Dipakai untuk fitur AI berbasis Gemini:

- Chat belajar pada halaman **Gemini AI**.
- Penjelasan tambahan untuk video pada fitur **Kelas**.

Endpoint terkait:

- `app/api/gemini/chat/route.ts`
- `app/api/kelas/explain/route.ts`

Model yang digunakan:

- `gemini-2.0-flash`

Environment variable:

```env
GEMINI_API_KEY=
```

### YouTube Data API

Dipakai untuk mengambil daftar video pembelajaran berdasarkan mata pelajaran.

Endpoint terkait:

- `app/api/kelas/videos/route.ts`
- `app/dashboard/kelas/[videoId]/page.tsx`

Environment variable:

```env
YOUTUBE_API_KEY=
```

### Anthropic Claude API

Project juga memiliki route AI berbasis Anthropic/Claude untuk assistant chat dan pembuatan konten dari materi.

Endpoint terkait:

- `app/api/ai/chat/route.ts`
- `app/api/materials/[id]/summarize/route.ts`
- `app/api/materials/[id]/generate-deck/route.ts`
- `app/api/materials/[id]/generate-quiz/route.ts`

Model yang digunakan pada chat Anthropic:

- `claude-sonnet-4-20250514`

Environment variable yang dibaca oleh SDK Anthropic:

```env
ANTHROPIC_API_KEY=
```

> Catatan: dependency `@anthropic-ai/sdk` sudah tercatat di `package.json`. Jika build/typecheck gagal karena module tidak ditemukan, jalankan `npm install` agar dependency di `node_modules` sesuai dengan lockfile.

### PostgreSQL

Database utama aplikasi. Prisma schema mendefinisikan model:

- `User`
- `Deck`
- `Flashcard`
- `Quiz`
- `Material`
- `UserStats`
- `LearningPath`
- `PathStep`

Environment variable:

```env
DATABASE_URL=
```

## Authentication

Autentikasi dibuat custom dengan:

- Register user via `app/api/auth/register/route.ts`.
- Login user via `app/api/auth/login/route.ts`.
- Logout user via `app/api/auth/logout/route.ts`.
- Password di-hash menggunakan `bcryptjs`.
- Session disimpan sebagai JWT dalam HTTP-only cookie bernama `bdd_token`.
- Token berlaku selama 7 hari.

Environment variable:

```env
JWT_SECRET=
```

## Fitur Utama

### Landing Page

Halaman sebelum login/register yang menjelaskan value aplikasi, fitur utama, dan CTA untuk daftar atau masuk.

File utama:

- `app/page.tsx`

### Dashboard

Halaman utama setelah login. Berisi shortcut fitur, video placeholder lanjutan, deck, materi, dan jalur belajar terakhir.

File utama:

- `app/dashboard/page.tsx`
- `components/dashboard-tabs.tsx`

### Kelas

Mengambil video pembelajaran dari YouTube berdasarkan mata pelajaran, lalu menyediakan penjelasan tambahan dari Gemini.

File utama:

- `app/dashboard/kelas/page.tsx`
- `app/dashboard/kelas/[videoId]/page.tsx`
- `components/kelas-browser.tsx`
- `components/kelas-explanation.tsx`

### Gemini AI

Chatbot belajar berbasis Gemini untuk bertanya materi pelajaran dalam Bahasa Indonesia.

File utama:

- `app/dashboard/gemini/page.tsx`
- `components/gemini-chat.tsx`

### Rangkum Materi

Mengelola materi, deck flashcard, dan jalur belajar.

File utama:

- `app/dashboard/rangkum/page.tsx`
- `app/dashboard/materials/**`
- `app/dashboard/decks/**`
- `app/dashboard/paths/**`

### Try Out

Menggabungkan beberapa deck menjadi kuis besar. Logic pembuatan soal berada di `lib/quiz.ts`.

File utama:

- `app/dashboard/tryout/page.tsx`
- `components/tryout-runner.tsx`
- `lib/quiz.ts`

## Environment Variables

Buat file `.env` di root project dengan variabel berikut:

```env
DATABASE_URL=
JWT_SECRET=
YOUTUBE_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
```

Jangan commit nilai asli `.env` ke repository.

## Menjalankan Project

Install dependency:

```bash
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan development server:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Script

```bash
npm run dev    # menjalankan development server
npm run build  # production build
npm run start  # menjalankan production server
npm run lint   # menjalankan ESLint
```

