---
name: locale-translator
description: Locale and i18n playbook for key discovery, placeholder/ICU safety, locale parity, and missing/unused key reports. Use when editing locales, i18n catalogs, translations, or untranslated UI copy.
paths:
  - '**/locales/**'
  - '**/i18n/**'
  - '**/*.{po,xliff}'
---

# Locale Translator

## Key discovery

1. Find the project's locale root and naming style (nested keys vs flat, file-per-namespace, etc.).
2. Grep for hard-coded user-facing strings in the touched UI/API surface.
3. Reuse an existing key if the meaning already exists.
4. Add new keys next to related ones; keep naming consistent.

## Interpolation safety

Never alter or translate:

- `{placeholder}` / `{{placeholder}}` names
- ICU `{count, plural, ...}` structure (translate outer text only)
- `%s`, `%d`, and similar format tokens
- HTML/component placeholders the runtime expects
- Brand names and code identifiers (unless explicitly asked)

After editing, confirm every placeholder in the source string still appears in each locale.

## Locale sync

For every key add/change:

- [ ] Key exists in all active locale files
- [ ] Nested structure matches across locales
- [ ] Punctuation and placeholders preserved
- [ ] Tone fits the string role (button, title, error, empty state)

## Missing / unused key report

When finishing, report:

```markdown
## Locale report

- Locales touched: ...
- Keys added/updated: ...
- Missing in other locales: ...
- Possibly unused keys noticed: ...
```

Do not silently leave a locale behind. If a translation is uncertain, keep meaning faithful and note the uncertainty.

## Handoffs

- Wire keys into components → `frontend`
- Server message catalogs → `backend`
- Multi-layer feature order → `senior-software-staff`
- Schema-only work → `database`
