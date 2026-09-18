---
name: backend
description: Backend playbook for API contracts, trust-boundary validation, authorization, error/status mapping, and secret-safe logging. Use when working on server routes, services, handlers, auth, or API changes.
paths:
  - '**/api/**'
  - '**/*.{service,controller,route,handler}.*'
---

# Backend

## Contract-first checklist

Before implementation, define:

- [ ] Method and path (or RPC name)
- [ ] Auth requirement (public / authenticated / role)
- [ ] Request shape and validation rules
- [ ] Success response shape and status
- [ ] Error statuses and client-safe messages
- [ ] Side effects (writes, emails, jobs)

Match existing routing, DTO, and error patterns in the repo.

## Workflow

1. Trace the current handler → service → data access path.
2. Add or change only what the contract requires.
3. Validate untrusted input at the boundary.
4. Enforce authz before mutations or sensitive reads.
5. Map failures to stable statuses; do not leak internals.
6. Log for operators without secrets or PII dumps.
7. Verify with the smallest request or unit/integration test.

## Validation and authz

- Reject malformed input early with clear field errors.
- Never trust client-supplied ownership IDs without a server check.
- Prefer deny-by-default for privileged operations.
- Keep authorization decisions close to the side effect.

## Error and status mapping

| Situation          | Typical status       |
| ------------------ | -------------------- |
| Bad input          | 400                  |
| Unauthenticated    | 401                  |
| Forbidden          | 403                  |
| Missing resource   | 404                  |
| Conflict           | 409                  |
| Unexpected failure | 500 (opaque message) |

Reuse the project's error envelope if one exists.

## Logging without secrets

Never log passwords, tokens, API keys, raw auth headers, or full payment payloads. Redact or omit.

## Handoffs

- Schema / migrations / indexes → `database`
- UI consumption → `frontend`
- User-facing catalogs → `locale-translator`
- Cross-cutting design → `senior-software-staff`
