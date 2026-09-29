# Localization

User-facing copy lives in `packages/locale` (`@valley/locale` or `@<name>/locale`). Active locales: **`en`** and **`th`**. Default locale: `en`.

## Package API

| Export | Purpose |
| --- | --- |
| `locales` | `['en', 'th']` |
| `defaultLocale` | `'en'` |
| `catalogs` | Record of locale → messages |
| `getMessages(locale?)` | Resolve a catalog |
| `isLocale(value)` | Type guard |
| `en` / `th` | Individual catalogs (also via `./en`, `./th` subpaths) |

Catalog sources: `packages/locale/src/en.ts`, `packages/locale/src/th.ts`. A parity test (`src/index.test.ts`) keeps keys aligned across locales.

## Apps

Frontend and backoffice wrap the tree with `LocaleProvider` and read strings via `useLocaleContext` (`apps/frontend|backoffice/src/components/locale-provider.tsx`). The preferred locale is stored in `localStorage` under `valley.locale`.

## Rules when changing copy

1. Do not hard-code user-facing strings in apps — add keys to the locale package.
2. Update **every** active locale (`en`, `th`, …).
3. Keep placeholders, ICU plurals, and brand identifiers unchanged across locales.
4. Run the locale package tests (for example `bun test` filtered to the locale package) before calling the work done.

Shipping UI/API display copy in only one locale is not done.

## Related

- [Project structure](project-structure.md)
- [Development](development.md)
