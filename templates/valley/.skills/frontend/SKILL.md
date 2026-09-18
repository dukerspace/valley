---
name: frontend
description: Frontend playbook for components, client state, accessibility, responsive layout, and browser verification of real user flows. Use when working on UI files or when the user mentions components, layout, a11y, or client-side bugs.
paths:
  - '**/*.{tsx,jsx,vue,svelte,css,scss}'
---

# Frontend

## Workflow

1. Locate the existing page/component and match its patterns.
2. Implement the smallest UI change for the request.
3. Wire loading, empty, and error states if the flow needs them.
4. Run the a11y checklist for new or changed interactive controls.
5. If layout changed, check desktop and a narrow viewport.
6. Verify the real user flow (browser or focused UI test).
7. Route new user-facing strings through `locale-translator` when i18n exists.

## Component checklist

- [ ] Reused existing components/tokens where possible
- [ ] Props and state naming match local conventions
- [ ] No unrelated refactors in the same diff
- [ ] Client state stays consistent with server truth
- [ ] Focus management for dialogs/menus if added

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
- Schema needs → `database`
- Copy/keys → `locale-translator`
- Multi-layer sequencing → `senior-software-staff`
