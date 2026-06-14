<goal>
Transform BelajarDuluDek's visual design from functional to genuinely premium using
the installed design skills. The codebase is correct and the spec is done —
this is a pure design pass. Target: someone watching the demo video thinks
"this looks like a real product."
</goal>

<investigate_before_answering>
Read files before touching them. Never speculate about what's there.
</investigate_before_answering>

<default_to_action>
Implement directly. Do not list issues and ask permission.
</default_to_action>

---

## Hard Constraints — Do Not Violate

- Do NOT modify: `globals.css`, `app/layout.tsx`, `app/page.tsx` structure, any
  config files (`tailwind.config.*`, `postcss.config.*`, `tsconfig.json`, etc.)
- CSS variables and keyframes are defined in `globals.css` and are final —
  use them, don't add new ones
- No new npm packages
- Tailwind v4 (no config file) — CSS vars only, no hardcoded hex values
- Dark-only — no light mode variants
- No new UI libraries — shadcn/ui + lucide-react only
- After every batch of changes: `npx tsc --noEmit` must pass

---

## Phase 1 — Establish Design Context

Run `/impeccable init` and answer for BelajarDuluDek:
- Surface: **product** (app UI / dashboard)
- Audience: Indonesian high school students + teachers
- Brand lane: educational but modern, confident not corporate
- Anti-references: generic SaaS dashboards, purple-gradient AI tools,
  Inter-on-white layouts
- Voice: direct, friendly, motivating
- The app is dark-only — commit to it fully

Save the generated `PRODUCT.md` and `DESIGN.md` to the project root.

---

## Phase 2 — Audit

Run `/impeccable audit` on these pages (read the files first):
- `app/page.tsx` (landing)
- `app/dashboard/page.tsx` (home)
- `app/dashboard/decks/page.tsx`
- `components/deck-cards.tsx` (flashcard study)
- `components/quiz-ui.tsx` (quiz flow)

Capture the audit findings. Identify the 5 highest-impact issues.

---

## Phase 3 — Design Pass (priority order)

Apply these in sequence. Run `npx tsc --noEmit` after each phase.

### 3a. Landing page (`app/page.tsx`)
This is the first frame of the demo video. It must immediately communicate
what the product is and make it look premium.

Run `/impeccable bolder app/page.tsx` then `/impeccable polish app/page.tsx`.

Focus areas:
- Hero: typography scale needs to feel designed, not default
- The role showcase cards (GURU vs MURID) need visual weight and depth
- Feature grid: icons + text hierarchy, not flat list
- Every section needs a distinct visual moment

### 3b. Dashboard home (`app/dashboard/page.tsx`)
This is what GURU and MURID see right after login.

Run `/impeccable polish app/dashboard/page.tsx` then `/impeccable delight`.

Focus areas:
- The greeting + stats row: this is the personalization moment — make it feel alive
- The "Lanjutkan dari terakhir" card: needs to draw the eye immediately
- GURU engagement panel: numbers should be visually prominent
- Shortcut grid: more visual interest than plain cards

### 3c. Flashcard study (`components/deck-cards.tsx`)
This is the core interaction — the flashcard flip is the demo's hero moment.

Apply Emil Kowalski's animation skill here specifically.

The flip must feel physical: CSS 3D transform with proper easing (not linear,
not bounce — spring-like ease-out). Check Emil's guidance on what makes
an animation feel right vs. cheap.

Run `/impeccable animate components/deck-cards.tsx`.

The card faces (question/answer) need:
- Clear visual differentiation between front and back
- The "Pertanyaan" / "Jawaban" labels should feel like design decisions
- Image cards vs. text-only cards should both look intentional

### 3d. Quiz flow (`components/quiz-ui.tsx`)
Run `/impeccable animate components/quiz-ui.tsx` then `/impeccable delight`.

Key moments:
- Answer selection: immediate, satisfying feedback (color + subtle scale)
- Correct/wrong reveal: should feel earned
- Result screen: the score ring/percentage needs to feel like a celebration,
  not a report card

### 3e. Deck list page (`app/dashboard/decks/page.tsx`)
Run `/impeccable polish app/dashboard/decks/page.tsx`.

Cards need to communicate at a glance:
- Whose deck it is (own vs. GURU)
- How many cards
- Whether they can start a quiz
- Visual separation between own decks and GURU decks sections

---

## Phase 4 — Final Pass

Run `/impeccable critique` across the pages touched in Phase 3.
Fix anything flagged. Then run:

```bash
npx tsc --noEmit   # must be 0 errors
npm run build      # must succeed
```

---

## Done When

The 5 demo-critical flows feel visually cohesive and premium:
1. Landing page hero → role section → CTA
2. Login → personalized dashboard
3. GURU creates deck with image flashcard
4. MURID studies deck → satisfying flip → quiz → result screen
5. MURID browses GURU content from dashboard

Each flow should be screencast-worthy without embarrassment.
