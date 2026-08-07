# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Romanian wedding website for "Cristina & Andrei" (26 September 2026). Full-stack app with a public guest-facing site and a password-protected admin panel. All UI text is in Romanian.

### This repo contains two unrelated projects

The `wedding` repository holds two independent codebases separated **by branch, not by directory**. They share no code, no database, and no dependencies.

| Branch | Project | Stack |
|---|---|---|
| `master` / `origin/master` | This wedding site | Next.js + Prisma + Neon Postgres |
| `joc` | "Joc" — a live A/B trivia game for the reception | Next.js + Supabase |

Two consequences worth internalizing:

- **Switching branches in place rewrites nearly every file.** Use a git worktree instead of `git checkout` when you need both.
- **Local `master` is stale** (14 commits behind `origin/master`) and was never fast-forwarded. Diff against `origin/master`, not `master`, or you will see a large fake diff.

Everything below this section describes the **wedding site only**.

## Commands

```bash
npm run dev              # Start dev server on :3000
npm run build            # prisma generate && next build
npm run start            # Serve the production build
npm run db:migrate       # Run Prisma migrations (prisma migrate dev)
npm run db:seed          # Seed DB with sample data (prisma/seed.ts via tsx)
npm run db:studio        # Open Prisma Studio GUI
npm run generate:images  # Batch-generate site imagery (scripts/generate-images.ts)
npm run gen:image        # Generate a single image (scripts/gen-image.ts)
```

`build` runs `prisma generate` first so Vercel always builds against a fresh client.

`lint` runs the ESLint 9 flat config in `eslint.config.mjs` (`eslint-config-next` core-web-vitals + typescript). It currently exits 0 with one known warning; see Known Issues.

No test framework is configured. Verify changes visually against `http://localhost:3000`.

## Tech Stack

- **Next.js 16.2** with App Router (`src/app/`)
- **React 19.2**, **TypeScript 6.0** (strict mode, target ES2017)
- **Tailwind CSS v4** — `@import "tailwindcss"` + an `@theme` block, wired through `@tailwindcss/postcss` (not the v3 `@tailwind` directives)
- **Prisma 6.19** with **PostgreSQL** hosted on Neon
- **ESLint 9** flat config (`eslint.config.mjs`) with `eslint-config-next` 16
- `@google/genai` for Imagen 4 image generation; `html2canvas` for seating-chart export
- Path alias: `@/*` → `./src/*`
- `next.config.js` is intentionally empty — Vercel auto-detects Next.js with zero config

## Architecture

### Public Site

Single scrolling page at `/`. `src/app/page.tsx` renders three absolutely-positioned corner botanicals, then stacks the sections:

```
HeroSection → WhenSection → WhereSection → RsvpForm → footer
```

`Countdown` renders inside `HeroSection`, not at page level. The top-right corner reuses `corner-left.jpg` mirrored with `style={{ transform: "scaleX(-1)" }}`; corner images are `pointer-events-none select-none` with responsive width classes.

Client components (`"use client"`): `Countdown`, `RsvpForm`, `WhereSection`, `components/admin/RoundTable`, and every file under `src/app/admin/`. Everything else is a server component.

`src/components/` contains only what the page actually renders. Six components orphaned by an earlier redesign (`CoupleCards`, `FloralDivider`, `Gallery`, `StickyNav`, `Timeline`, `VenueMap`) were deleted; recover them from git history if a gallery or timeline is ever wanted back.

### Admin Panel (`/admin`)

Client-side password auth via `sessionStorage` — no JWT, no cookies, no middleware. `src/app/admin/layout.tsx` posts the password to `/api/admin/auth`, then stores `admin_auth` and `admin_password` in `sessionStorage`. This is obscurity, not access control; every API route is unauthenticated.

Four pages:
- `/admin` — Dashboard with RSVP statistics
- `/admin/guests` — Guest table with filtering, editing, CSV export, and menu/allergy/kids columns
- `/admin/tables` — Round-table seating with drag-and-drop assignment and JPG export via `html2canvas`
- `/admin/images` — On-demand Imagen generation

### API Routes (`src/app/api/`)

- `/api/rsvp` — POST (public RSVP submission), GET (all guests with tables)
- `/api/guests` — GET (list, filter by `?status=`), PUT (update), DELETE (`?id=`)
- `/api/tables` — GET (list with guests), POST (create), PUT (update), DELETE (`?id=`)
- `/api/admin/auth` — POST (password validation)
- `/api/admin/generate-image` — POST (Imagen 4 proxy, model `imagen-4.0-generate-001`)

`POST /api/rsvp` accepts two payload shapes. The current one is `{ primary, extras[] }`; a legacy flat shape (`name` + comma-joined `plusOneName`/`plusOneMenu`) is normalized on the way in so older clients don't 500. It writes the primary guest first, then each extra as its own row pointing at the primary via `parentGuestId`.

### Database

Prisma client singleton at `src/lib/db.ts`. Two models in `prisma/schema.prisma`:

**Guest**
- Identity — `id`, `name`, `email?`, `createdAt`
- Attendance — `attending`: `"yes"` | `"no"` | `"pending"`
- Preferences — `menuPreference?` (`"Normal"` | `"Vegetarian"`), `allergies?`, `kidsCount?`, `message?`. `kidsCount` and `message` are household-level and live on the primary guest.
- Seating — `tableId?`, `seatNumber?` (1..capacity; null means assigned to a table but no specific seat)
- Grouping — `parentGuestId?` / `parent` / `plusOnes[]`, a self-relation named `GuestGroup`. Primaries have a null parent; plus-ones point at their primary. `onDelete: SetNull` so deleting a primary orphans its plus-ones into primaries rather than cascading data loss.
- Legacy — `plusOne`, `plusOneName?`, `plusOneMenu?`, `dietaryRestrictions?` hold pre-grouping concatenated values. Marked legacy in the schema; read them only for old rows, never write them.

**Table** — `id`, `name`, `capacity` (default 8), `guests` relation.

Three migrations: the Postgres init, then `add_guest_seat_number`, then `add_guest_parent_group`. `prisma/backfill-groups.ts` is a one-off script that populates the grouping relation on rows created before it existed.

## Environment

Secrets live in `.env` / `.env.local` (both gitignored) and in the Vercel project settings. Prisma CLI commands read `.env`, not `.env.local`.

| Variable | Used by |
|---|---|
| `DATABASE_URL` | Prisma — Neon Postgres connection string |
| `ADMIN_PASSWORD` | `/api/admin/auth` |
| `GOOGLE_AI_API_KEY` | `/api/admin/generate-image` and the image scripts |

`ADMIN_PASSWORD` is **required**. `/api/admin/auth` fails closed — if the variable is unset it logs an error and returns 503 rather than accepting anything. (It previously fell back to a password hardcoded in the source; don't reintroduce that.)

## Deployment

Vercel, auto-deploying on push to `master`. Standard flow:

```bash
git add -A && git commit -m "..." && git push
```

## Style Conventions

- Color tokens live in the `@theme` block of `src/app/globals.css` and are used as ordinary Tailwind classes (`bg-burgundy`, `text-gold`, `text-forest-green`):
  `burgundy`, `burgundy-light`, `burnt-orange`, `gold`, `gold-light`, `cream`, `cream-dark`, `sage`, `sage-dark`, `forest-green`, `forest-green-light`
- Fonts, loaded via a Google Fonts `<link>` in the root layout: `font-heading` (Playfair Display), `font-body` (Lato), `font-script` (Great Vibes)
- No UI component library — everything is hand-built with Tailwind
- No state management or form libraries — plain `useState`/`useEffect` and controlled inputs
- HTML `lang` is `"ro"`; dates use `toLocaleDateString("ro-RO")`
- Reusable bits in `globals.css`: `.thin-divider`, `.fade-in` / `.fade-in.visible`, `.floral-border`

## Known Issues

- **API routes have no server-side authentication.** The admin password check happens client-side only. This is the largest outstanding gap and should be closed before the guest list fills up — it needs a real server-side session check in every `/api/*` handler.
- **`src/app/layout.tsx` loads fonts via a Google Fonts `<link>`**, which ESLint flags (`@next/next/no-page-custom-font`). Migrating to `next/font` would remove the render-blocking request, but it changes font-loading behavior, so it hasn't been done.
- **`react-hooks/set-state-in-effect` is suppressed in three places** — `Countdown.tsx`, `admin/layout.tsx`, `admin/tables/page.tsx`. Each is a legitimate client-only initialization (clock start, `sessionStorage` read, mount fetch) that the rule cannot distinguish from a cascading-render bug. Each suppression carries a comment explaining the constraint. Don't add more without the same justification.
- **Roughly a dozen images in `public/images/` are unreferenced**, including everything the deleted gallery used. They were left in place because regenerating them costs Imagen credits.
- `npx prisma generate` can fail with `EPERM` on Windows while the dev server holds the client DLL. Stop the dev server, regenerate, restart.
- The legacy `Guest` fields (`plusOne`, `plusOneName`, `plusOneMenu`, `dietaryRestrictions`) still exist. Dropping them needs a migration and a check that no old rows still depend on them.

## Working Principles

### 1. Plan by Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project context

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Prefer the simplest solution that correctly solves the problem
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.

## Session Continuity

**At session start:** Read in order: `.claude/context-snapshot.md` (if exists) → `.claude/nextsession.md` → `.claude/decisions.md` → `.claude/sessionlog.md`. Then briefly tell the user the current project state and what will be worked on first.

**At ~70% context:** Automatically run `/done` without waiting to be asked. This writes a comprehensive `context-snapshot.md` capturing all session detail, updates all session docs, then instructs the user to start a new session. The new session loads context-snapshot.md and resumes with zero information loss.

**Commands:**
- `/done` — update all session docs (sessionlog + nextsession + decisions)
- `/update-session` — update sessionlog.md only
- `/update-next` — update nextsession.md only
- `/update-decisions` — update decisions.md only
