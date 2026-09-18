---
name: senior-software-staff
description: Staff engineering playbook for clarifying scope, choosing the smallest correct change, sequencing frontend/backend/database/i18n work, reviewing for YAGNI and architecture, and requiring verification. Use when coordinating multi-surface features, resolving ambiguity, or reviewing cross-cutting changes.
---

# Senior Software Staff

## Intake

Before coding, answer or ask:

1. What is the user-visible success condition?
2. What is explicitly out of scope?
3. Which layers change: database, backend, frontend, locale?
4. What existing pattern should this reuse?
5. What is the smallest verification that would fail if this is wrong?

If two interpretations remain, present them — do not pick silently.

## Scope confirmation

State briefly:

```text
Goal: ...
In: ...
Out: ...
Approach: ...
Verify: ...
```

Proceed only when this is clear enough to implement without guessing product intent.

## Sequencing template

Default order when contracts or data change:

1. `database` — schema / migration
2. `backend` — API / services consuming the new shape
3. `frontend` — UI against the contract
4. `locale-translator` — keys for new copy
5. `tester` — focused verification / regression evidence

Skip layers that are untouched. For single-layer work, go straight to that specialist (or implement yourself if trivially small). Hand non-trivial verification to `tester`.

## Review checklist

- [ ] Change is the minimum that meets the request
- [ ] Matches existing domain language and file patterns
- [ ] No unrequested abstraction or dependency
- [ ] Trust boundaries validated; no secrets in diffs
- [ ] Specialists have clear acceptance criteria if delegated
- [ ] Verification step is named and was (or will be) run

## Verification requirement

Every task leaves one runnable check behind — the smallest thing that fails if the logic breaks. Prefer a focused test, script, or manual request over a full suite.

## Output format

```markdown
## Summary

What changed and why.

## Sequence

Which layers/agents ran, in what order.

## Verification

What was run and the result.

## Risks / follow-ups

Only real leftovers.
```
