# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**tagthat** is a monorepo containing:
- `packages/cli` — a Bun-based CLI tool (published to npm as `tagthat`) that installs a git pre-push hook to play a producer tag (audio file) on every push
- `apps/web` — an Astro + React marketing landing page

## Commands

All commands use **Bun** as the package manager. Bun is required (`bun >= 1.1.0`).

### Root (Turborepo)

```bash
bun run build      # Build all packages
bun run dev        # Run all dev servers
bun run lint       # Lint all packages
bun run clean      # Clean all dist outputs
```

### CLI (`packages/cli`)

```bash
bun run typecheck  # tsc --noEmit
bun run build      # Bundle to dist/ via bun build
bun run dev        # Run CLI directly via bun (no build needed)
bun run clean      # rm -rf dist
```

### Web (`apps/web`)

```bash
bun run dev        # Astro dev server
bun run build      # Static site build
bun run preview    # Preview built site
```

There is no test suite. CI runs typecheck + build only.

## Architecture

### CLI (`packages/cli/src/`)

Entry point is `index.ts`, which registers three Commander commands:

- **`init`** (`commands/init.ts`) — finds git root, reads contributors from `git log`, creates `.tagthat/<slug>/` directories, installs the pre-push hook
- **`add <name>`** (`commands/add.ts`) — creates a contributor slot manually
- **`test [name]`** (`commands/test.ts`) — simulates a push by playing a random audio file for the given contributor

Key utilities:
- **`utils/hook.ts`** — generates and installs the bash hook script. Uses a `# tagthat:pre-push` marker to safely update existing hooks without overwriting other hook content. The hook source is stored at `.tagthat/hooks/pre-push` and copied to `.git/hooks/pre-push`.
- **`utils/slug.ts`** — converts contributor names to safe directory names. **This logic must stay in sync with the `sed` command in `src/templates/hook.sh`** — both must produce identical slugs from the same input.
- **`utils/audio.ts`** — platform-specific audio playback: `afplay` (macOS), `aplay`/`paplay`/`mpg123`/`ffplay` (Linux), PowerShell (Windows).
- **`utils/git.ts`** — git root detection, `git config user.name`, contributor extraction from `git log`.
- **`utils/paths.ts`** — canonical paths for `.tagthat/` directory layout.

The hook script (`src/templates/hook.sh`) runs on `git push`, resolves the current user's slug, picks a random `.mp3`/`.wav` from `.tagthat/{slug}/`, and plays it in the background. It always exits 0 — it never blocks a push.

### Web (`apps/web/src/`)

Static Astro site. The main page is `pages/index.astro`. Interactive components are React islands:
- **`CopyButton.tsx`** — copies `npx tagthat` to clipboard (client-side hydration)
- **`TerminalDemo.astro`** — vanilla JS animated terminal demo that plays audio from `public/`

GitHub star count is fetched at **build time** in `Header.astro`.

### Monorepo

Turborepo orchestrates tasks. Build order: CLI must build before any dependent app. Config is in `turbo.json`.

### Release Process

Releases are automated via `.github/workflows/release.yml`. On push to `main`, if `git cliff --bumped-version` detects a version bump, it:
1. Typechecks and builds the CLI
2. Updates `packages/cli/package.json` version
3. Publishes to npm as `tagthat`
4. Generates a changelog and creates a GitHub release

Use conventional commits (`feat:`, `fix:`, `perf:`, `refactor:`) — `feat:` bumps minor, breaking changes bump major.

## Key Constraints

- Audio files (`.mp3`/`.wav`) are committed into `.tagthat/<slug>/` — they must be git-tracked to work after cloning.
- The TypeScript `slugify()` function and the bash `sed` slug logic in `hook.sh` must produce identical output for the same input.
- The hook never fails a push — it always exits 0.
