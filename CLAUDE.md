# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Romanian wedding website for "Cristina & Andrei" (26 September 2026). Full-stack app with a public guest-facing site and a password-protected admin panel. All UI text is in Romanian.

## Commands

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run lint        # ESLint via next lint
npm run db:migrate  # Run Prisma migrations (prisma migrate dev)
npm run db:seed     # Seed DB with sample data (runs prisma/seed.ts via tsx)
npm run db:studio   # Open Prisma Studio GUI
```

No test framework is configured.

## Tech Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**, **TypeScript 5.9** (strict mode)
- **Tailwind CSS v4** — uses `@import "tailwindcss"` + `@theme` block (not the v3 `@tailwind` directives)
- **Prisma 6** with **SQLite** (`prisma/dev.db`)
- Path alias: `@/*` → `./src/*`

## Architecture

### Public Site

Single-page scrolling layout at `/`. The page component (`src/app/page.tsx`) assembles sections in order: HeroSection → Countdown → Timeline → VenueMap → Gallery → RsvpForm. All sections are in `src/components/`.

Server components: HeroSection, Timeline, VenueMap, Gallery, FloralDivider.
Client components (`"use client"`): Countdown, RsvpForm.

### Admin Panel (`/admin`)

Client-side password auth via `sessionStorage` — no JWT/cookies. The password is checked against `ADMIN_PASSWORD` env var through `/api/admin/auth`.

Three pages:
- `/admin` — Dashboard with RSVP statistics
- `/admin/guests` — Guest CRUD table with filtering and CSV export
- `/admin/tables` — Table/seating management with guest assignment

### API Routes (`src/app/api/`)

- `/api/guests` — GET (list, filter by `?status=`), PUT (update), DELETE (`?id=`)
- `/api/rsvp` — POST (public RSVP submission)
- `/api/tables` — GET (list with guests), POST (create), PUT (update), DELETE (`?id=`)
- `/api/admin/auth` — POST (password validation)

### Database

Two models in `prisma/schema.prisma`: **Guest** (name, email, attending status, plus-one, dietary, message, optional table FK) and **Table** (name, capacity, guests relation). Prisma client singleton at `src/lib/db.ts`.

## Style Conventions

- Custom color tokens defined in `src/app/globals.css` `@theme` block: `burgundy`, `burnt-orange`, `gold`, `cream`, `sage` (and variants). Use as Tailwind classes: `bg-burgundy`, `text-gold`, etc.
- Custom fonts: `font-heading` (Playfair Display), `font-body` (Lato) — loaded via Google Fonts `<link>` in root layout.
- No UI component library — all components are hand-built with Tailwind.
- No state management or form libraries — plain `useState`/`useEffect` and controlled inputs.
- HTML lang is `"ro"`, dates use `toLocaleDateString("ro-RO")`.

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
