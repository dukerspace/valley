---
name: frontend
description: Frontend playbook for components, client state, accessibility, responsive layout, and browser verification of real user flows. Use when working on UI files or when the user mentions components, layout, a11y, or client-side bugs.
paths:
  - '**/*.{tsx,jsx,vue,svelte,css,scss}'
---

# Frontend

## TanStack Start

Applies to `apps/frontend` (user, cookie auth) and `apps/backoffice` (admin, Bearer auth). Same route/component layout; auth differs.

### App layout

| Area | Path |
| --- | --- |
| File routes | `src/routes/` (`createFileRoute`) |
| App components | `src/components/` |
| Hooks | `src/hooks/` |
| API / auth / env | `src/lib/` (`api.ts`, `auth.ts`, `env.ts`) |
| Router | `src/router.tsx` |

Do not hand-edit `routeTree.gen.ts`.

- **App imports** — use `#components/*`, `#lib/*`, `#hooks/*` (see each app's `package.json` `imports`).
- **UI** — prefer `packages/ui` components and tokens before inventing new primitives.
- **Copy** — `useLocale()` / `packages/locale` only; no hard-coded user-facing strings.
- **HTTP** — call the API only through `apiRequest` in `src/lib/api.ts` and helpers in `src/lib/auth.ts`. Paths under `/api/v1`. Frontend uses `credentials: 'include'`; backoffice uses Bearer tokens.
- **Contracts** — DTO types and Zod schemas from `packages/shared` (see `.skills/shared/SKILL.md`).
- **Placement** — see `.skills/project-structure/SKILL.md` when unsure which app owns the surface.

## Workflow

1. Locate the existing page/component and match its patterns.
2. Implement the smallest UI change for the request.
3. Wire loading, empty, and error states if the flow needs them.
4. Run the a11y checklist for new or changed interactive controls.
5. If layout changed, check desktop and a narrow viewport.
6. Verify the real user flow (browser or focused UI test).
7. Route every new or changed user-facing string through `locale-translator` — keys in all active locales, no hard-coded copy. Work is not done until locale parity is verified (or `Locale: N/A` with reason).

## Component checklist

- [ ] Reused existing components/tokens where possible
- [ ] Props and state naming match local conventions
- [ ] No unrelated refactors in the same diff
- [ ] Client state stays consistent with server truth
- [ ] Focus management for dialogs/menus if added

## Locale checklist

- [ ] No hard-coded user-facing strings in the diff
- [ ] New/changed keys exist in every active locale (`en`, `th`, …)
- [ ] Placeholders / ICU tokens preserved
- [ ] Locale parity test run when keys changed

## Accessibility checklist

- [ ] Interactive elements have accessible names
- [ ] Keyboard reachable; focus visible
- [ ] Images/icons that convey meaning have text alternatives
- [ ] Errors are associated with inputs
- [ ] Color is not the only status signal

## Responsive check

When layout changes:

- [ ] Primary content readable without horizontal scroll on ~375px width
- [ ] Tap targets usable on mobile
- [ ] No overlapping critical controls

## Browser verification

For user-visible behavior changes:

1. Open the affected route.
2. Exercise the happy path once.
3. Exercise one failure/empty path if relevant.
4. Note what you saw (pass/fail) in the task summary.

## Handoffs

- API gaps → `backend`
- DTO / contract changes → `shared`
- Schema needs → `database`
- Copy/keys → `locale-translator`
- Metadata / structured data / crawl / AI citation → `seo-geo`
- Monorepo placement → `project-structure`
- Multi-layer sequencing → `senior-software-staff`
