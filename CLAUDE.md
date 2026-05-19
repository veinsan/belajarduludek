# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: verify Next.js APIs before writing code

`AGENTS.md` is not boilerplate. This project runs **Next.js 16.2.6 + React 19.2** with **Tailwind v4** and **Prisma 7-adapter / Prisma client 6.19** — every one of these has shipped breaking changes that pre-date most training data. Before writing any framework code, open the relevant page under `node_modules/next/dist/docs/` (entry point: `index.md`, then `01-app/…`) and confirm current API shape. Treat anything you "remember" about `next/headers`, route handlers, `params`, `cookies()`, server actions, caching, or `fetch` defaults as suspect until verified.

## Commands

```bash
npm run dev       # next dev (Turbopack by default in 16.x)
npm run build     # next build
npm run start     # next start (serves the production build)
npm run lint      # eslint (uses flat config in eslint.config.mjs)
```

No test runner is configured. Prisma commands (`npx prisma migrate dev`, `npx prisma generate`, `npx prisma studio`) operate against `DATABASE_URL` in `.env`; Prisma's own loader does not auto-read `.env`, so if you add `prisma.config.ts` it must include `import "dotenv/config"`.

## Architecture

**App Router only.** Routes live in `app/`. Root layout (`app/layout.tsx`) wires Geist + Geist Mono via `next/font/google` and applies them via CSS variables (`--font-geist-sans`, `--font-geist-mono`).

**Domain (Prisma schema, `prisma/schema.prisma`).** A flashcard-and-quiz app:
- `User` 1—N `Deck` 1—N `Flashcard` (cascade delete from Deck)
- `Deck` 1—N `Quiz` (cascade delete from Deck); `Quiz` also carries a `userId` but no FK relation back to `User` is declared
- IDs are `cuid()`; `User.password` exists in plaintext column form — bcrypt hashing is expected at the app layer (`bcryptjs` is a dependency). Auth tokens are intended via `jsonwebtoken`.
- Postgres connection uses `@prisma/adapter-pg` + `pg` (driver-adapter mode), not the default Prisma engine connector.
- Generated client output is gitignored at `lib/generated/prisma` (see `.gitignore`); update `output` in `schema.prisma` accordingly when you wire generation.

**Styling & UI.**
- Tailwind v4 — **no `tailwind.config.js`**. All theme tokens, custom variants, and the `dark` variant live in `app/globals.css` via `@theme inline { … }` and `@custom-variant dark (&:is(.dark *))`. Colors use OKLCH and reference CSS variables defined in `:root` / `.dark`.
- shadcn/ui is installed with style `radix-nova` (see `components.json`); generated primitives land in `components/ui/` (currently `button.tsx`). Icon library is `lucide-react`.
- Use the path aliases defined in both `tsconfig.json` and `components.json`: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`. The `cn()` helper (`lib/utils.ts`) is the standard `clsx + tailwind-merge` combo — use it for any conditional class composition.

**TypeScript.** `strict: true`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`. `next-env.d.ts` is generated — don't edit it; it's also in `.gitignore`.

## Conventions

- Server Components by default — only add `"use client"` when a component genuinely needs browser-only APIs, state, or effects. React 19 + Next 16 expand what Server Components can do; double-check the docs before reaching for client components.
- Keep colors and spacing token-driven (via the CSS variables in `globals.css`); don't hard-code hex values or re-introduce a `tailwind.config.{js,ts}`.

## Project Identity & Rules

**BelajarDuluDek** — App edukasi flashcard + kuis untuk siswa SMA Indonesia.

- UI language: **Bahasa Indonesia** untuk semua teks yang terlihat user
- Auth: JWT di `httpOnly` cookie — pakai `bcryptjs` + `jsonwebtoken`, **jangan NextAuth atau library auth lain**
- Selalu jalankan `npx tsc --noEmit` setelah selesai satu fitur
- Prisma schema di `prisma/schema.prisma` **sudah final** — jangan diubah tanpa konfirmasi eksplisit
- `npx prisma db push` untuk sync schema, `npx prisma studio` untuk inspect data