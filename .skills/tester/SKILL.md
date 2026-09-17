---
name: tester
description: QA playbook for reproducing bugs, writing focused unit/integration/e2e checks, browser verification, and evidence-grounded pass/fail reports. Use when verifying features, fixing or adding tests, hunting flakes, or confirming a bug fix.
paths:
  - '**/*.{test,spec}.{ts,tsx,js,jsx}'
  - '**/__tests__/**'
  - '**/e2e/**'
  - '**/tests/**'
---

# Tester

## Intake

Before testing, lock:

1. Success condition (what "works" means)
2. Surface under test (API, UI route, job, schema)
3. What changed or which bug to reproduce
4. Existing runner/commands in this package

## Workflow

1. Reproduce or define the expected behavior in one sentence.
2. Find the nearest existing test file and match its style.
3. Add or run the **smallest** check that fails for wrong behavior.
4. Add one edge/failure case when the risk warrants it.
5. Run only the focused test file or filter — not the full monorepo by default.
6. For UI flows, exercise happy path (+ one error/empty path) in the browser when practical.
7. File a short report; hand failures to the owning specialist.

## Test plan template

```markdown
## Plan
- Success: ...
- Scope: ...
- Out of scope: ...

## Cases
1. Happy path — ...
2. Edge/failure — ...

## Commands
- `...`

## Results
- Case 1: PASS/FAIL — evidence
- Case 2: PASS/FAIL — evidence
```

## Checklist

- [ ] Reproduced or stated expected behavior clearly
- [ ] Matched existing test framework and naming
- [ ] Tests assert behavior through public interfaces
- [ ] No unrelated fixtures or suite-wide refactors
- [ ] Focused command documented and run
- [ ] Failures include owner handoff (`frontend` / `backend` / `database` / `locale-translator`)

## Flake and evidence rules

- Prefer deterministic selectors and explicit waits over fixed `sleep`.
- Prefer exact assertions over snapshots unless the repo already relies on them.
- Record the command and the failing assertion or observed UI result.
- Do not mark PASS if the check was skipped or the env could not run.

## Handoffs

- Broken UI / client state → `frontend`
- Broken API / auth / validation → `backend`
- Broken schema / query / migration → `database`
- Wrong or missing copy → `locale-translator`
- Unclear ownership or multi-layer fail → `senior-software-staff`
