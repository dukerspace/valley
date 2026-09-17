---
name: database
description: Database playbook for Prisma schema conventions, indexes, query review, and expand/contract migrations. Use when editing schema, migrations, SQL, or diagnosing query/data-model issues.
paths:
  - '**/*.prisma'
  - '**/migrations/**'
  - '**/*.sql'
---

# Database

## Prisma schema checklist

When adding or changing models:

- [ ] Both sides of every relation with `@relation`
- [ ] ID: `@id @default(autoincrement())` or `@default(cuid())`
- [ ] `createdAt` with `@default(now())`
- [ ] `updatedAt` with `@updatedAt`
- [ ] `@@index` on frequently filtered/joined fields
- [ ] `@unique` / `@@unique` where business rules require uniqueness
- [ ] Field names match existing domain language

## Index and query review

- [ ] Filters and joins used by the app have supporting indexes
- [ ] Hot lists avoid unbounded scans
- [ ] Relations loaded intentionally (no accidental N+1)
- [ ] Selects project only needed fields when payloads are large
- [ ] Soft deletes / status filters are indexed if common

## Expand/contract migration steps

For breaking changes:

1. **Expand** — add new columns/tables/nullability that old code tolerates.
2. **Migrate data** — backfill if needed.
3. **Switch reads/writes** — deploy app code using the new shape.
4. **Contract** — remove old columns only after callers are gone.

Never drop or rename in a way that breaks running readers without an explicit, approved plan.

## Workflow

1. Confirm the data need; reuse existing fields when possible.
2. Edit schema surgically.
3. Create a clear, reviewable migration.
4. Coordinate contract updates with `backend`.
5. Verify with migrate status and a focused query or test.

## Handoffs

- Services / APIs → `backend`
- Forms / tables for new fields → `frontend`
- Feature sequencing → `senior-software-staff`
- Field labels in locale files → `locale-translator`
