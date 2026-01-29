# Migration Plan: Next.js -> Astro 6 beta (React)

## Goals
- Full migration from Next.js App Router to Astro 6 beta with React where needed.
- Keep all current functionality (vanity generation, workers, wallet connect, encrypted local storage).
- Remove ESLint/PostCSS/Tailwind/Radix and unnecessary deps.
- Switch to Bun for package manager and scripts.
- Update all dependencies to latest available versions.

## Notes
- As of 2026-01-28, `astro@beta` currently resolves to `6.0.0-beta.4` (no `6.0.0-beta.6` is published yet). I’ll proceed with the latest beta tag unless you want a specific version pinned.

## Steps
1. **Create Astro skeleton**
   - Add `astro.config.mjs` with React integration.
   - Add `src/pages/index.astro` and global styles.
   - Add `src/layouts/Base.astro` if needed.
2. **Port application logic**
   - Move Context, hooks, constants, wagmi config into `src/`.
   - Replace Next-specific APIs (`next/link`, `next/image`, app router layout).
   - Wrap app with React providers (Wagmi, RainbowKit, TanStack Query).
3. **Replace Tailwind/Radix UI**
   - Rebuild UI components (button, switch, progress, card, table, input) using minimal CSS.
   - Replace lucide icons with inline SVG.
   - Consolidate styles in `src/styles/global.css`.
4. **Clean dependencies & configs**
   - Remove Next, Tailwind, Radix, ESLint, PostCSS config files.
   - Add Astro + React deps and update to latest versions.
   - Switch scripts to Bun and generate `bun.lockb`.
5. **Verification**
   - Run `bun install` and `bun run build`.
   - Quick check that worker files load and UI renders.

