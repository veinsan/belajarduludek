# Design

Sistem visual BelajarDuluDek. Semua token didefinisikan di `app/globals.css` dan bersifat final: pakai yang ada, jangan menambah variabel atau keyframe baru. Dark-only; `<html>` selalu `class="dark"`.

## Theme

Dark-only, "ruang belajar malam hari". Latar hampir-hitam netral, permukaan kaca gelap dengan tint ungu, satu keluarga aksen ungu. Tidak ada mode terang.

## Color

Pakai lewat token Tailwind (`bg-background`, `text-primary-light`, dst). Jangan hardcode hex.

| Role | Token | Value | Pemakaian |
| --- | --- | --- | --- |
| Background | `--background` | `#121212` | Body, halaman publik |
| Dashboard bg | (di `.dashboard-shell`) | `#101115` | Shell dashboard |
| Foreground | `--foreground` | `#f5f5f5` | Teks utama |
| Muted fg | `--muted-foreground` | `#a0a0a0` | Metadata, deskripsi |
| Card | `--card` | `#1d1d1d` | Permukaan landing/auth |
| Elevated | `--elevated` | `#272727` | Track, popover, layer kedua |
| Primary | `--primary` | `#5f2bce` | Aksi utama, identitas |
| Accent | `--accent` | `#7264eb` | Gradien progress, ring |
| Primary light | `--primary-light` | `#b6a6f3` | Label, ikon, eyebrow text |
| Destructive | `--destructive` | `#ef4444` | Error, jawaban salah |
| Border | `--border` / `--border-strong` | `#222` / `#333` | Garis permukaan |

Warna semantik tambahan (Tailwind bawaan, sudah jadi konvensi kode):

- **Sky (`sky-300/400`)**: identitas GURU (badge, panel guru, konten "dari Guru").
- **Emerald (`emerald-300/400/500`)**: benar, sukses, "siap kuis".
- **Amber (`amber-200`)**: streak/api.
- Strategi warna: **Restrained**. Permukaan netral gelap; primary < 10% layar, muncul untuk aksi dan status. Sky/emerald/amber hanya pada perannya, tidak pernah dekoratif.

## Typography

- **Heading**: Urbanist (`--font-heading`, otomatis pada `h1, h2`; pakai `font-heading` untuk h3+ yang butuh karakter display). Berat: `font-black`/`font-extrabold`, `tracking-tight`.
- **Body/UI**: Inter (`--font-sans`, default). Label kecil: `text-[10px]`–`text-xs`, `font-bold uppercase tracking-[0.18em]`.
- **Angka/data**: Geist Mono (`font-mono`) untuk nomor urut dan angka tabel jika perlu.
- Skala produk: 11px label, 14px body, 16–18px judul kartu, 24–30px judul seksi, 36–48px hero dashboard. Rasio langkah ±1.2.

## Surfaces & Elevation

Tiga utilitas permukaan (didefinisikan global, jangan duplikasi nilainya):

- `.liquid-glass` (+ varian `.liquid-hero`): panel besar berkaca, untuk hero dashboard dan sidebar.
- `.liquid-card`: kartu konten dashboard (sudah otomatis untuk `[data-slot="card"]` di dalam `.dashboard-shell`).
- `.neon-edge`: inset highlight + drop shadow halus, dikombinasikan dengan liquid-card.

Landing/auth memakai `bg-card` + `border-border` polos (tanpa blur) supaya halaman publik tetap ringan. Radius: `rounded-[1.25rem]` kartu dashboard, `rounded-2xl` kartu landing, `rounded-xl` kontrol, `rounded-full` badge/pill.

## Motion

Easing rumah: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint). Tidak ada bounce/elastic, tidak menganimasikan properti layout.

- `animate-enter-up` (700 ms) + `animation-delay-{100..400}`: entrance elemen.
- `.reveal-motion` via komponen `<Reveal>`: scroll reveal seksi.
- `animate-float-slow`, `animate-progress`: khusus mock di landing.
- Transisi interaktif: 150–250 ms (`transition-all duration-150/200`), hover lift maksimal `-translate-y-1`, scale feedback `active:scale-[0.99]`.
- Flip flashcard: 3D transform `rotateY` dengan `[transform-style:preserve-3d]`, durasi ±500–600 ms, easing rumah.
- Semua animasi global sudah dimatikan oleh `prefers-reduced-motion`; jangan menambah animasi yang lolos dari guard itu.

## Components

- Primitif shadcn/ui (`components/ui/`): `button`, `card`, `input`, `label`, `textarea`. Ikon hanya `lucide-react`.
- Tombol: `<Button>` dengan varian bawaan; outline di dashboard otomatis bergaya ungu kaca. Jangan membuat tombol dari `<div>`.
- Badge identitas: pill `rounded-full` + `text-[10px]/[11px] font-bold uppercase tracking-wider`; ungu untuk milik sendiri, sky untuk guru, emerald untuk status siap.
- Ikon dalam tile: `flex size-X items-center justify-center rounded-xl/2xl border` + tint warna perannya.
- Empty state: liquid-card ber-border dashed, ikon tile, judul + satu kalimat ajakan + CTA.
- `cn()` dari `lib/utils` untuk semua komposisi kelas kondisional.

## Layout

- Dashboard: shell sidebar tetap (`.dashboard-shell` / `.dashboard-main`), konten kolom tunggal `gap-8 md:gap-10` antar seksi.
- Landing: container `max-w-[1302px] px-5`, seksi `pb-24`.
- Grid kartu: `gap-4`–`gap-5`; jangan menyamakan semua kartu — beri satu elemen dominan per seksi (hero, continue card) dan biarkan sisanya mundur.
