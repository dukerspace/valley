# Agent instructions

Shared project instructions for ChatGPT Codex, Claude Code, and other coding agents. Keep this file sparse — follow the linked skills and agents; do not invent parallel rules here.

## Pointers

- **Coding discipline** — before writing or changing code, read and follow [`.skills/rimping-guidelines/SKILL.md`](.skills/rimping-guidelines/SKILL.md).
- **Project structure** — when placing code or navigating apps/packages, read [`.skills/project-structure/SKILL.md`](.skills/project-structure/SKILL.md). For Hono API modules under `apps/api`, follow the Valley section in [`.skills/backend/SKILL.md`](.skills/backend/SKILL.md). For `apps/frontend` or `apps/backoffice`, follow the Valley section in [`.skills/frontend/SKILL.md`](.skills/frontend/SKILL.md). For Zod DTOs and envelopes in `packages/shared`, read [`.skills/shared/SKILL.md`](.skills/shared/SKILL.md).
- **User-facing copy / locale** — when a change adds or edits strings users see, read [`.skills/locale-translator/SKILL.md`](.skills/locale-translator/SKILL.md) and [`.cursor/rules/locale-parity.mdc`](.cursor/rules/locale-parity.mdc). Ship keys in every active locale (`en`, `th`, …); copy in only one locale is not done.
- **Specialist roles** — for UI, API, schema, i18n, verification, SEO/GEO, or cross-cutting work, open the matching file under [`.agents/`](.agents/) (`frontend`, `backend`, `database`, `locale-translator`, `tester`, `seo-geo`, `senior-software-staff`) and its `.skills/<name>/SKILL.md` before acting.
- **Discoverability / SEO + GEO** — for metadata, structured data, crawlability, ranking, or AI-citation readiness, read [`.skills/seo-geo/SKILL.md`](.skills/seo-geo/SKILL.md) and open [`.agents/seo-geo.md`](.agents/seo-geo.md).
- **Multi-surface sequencing** — when scope spans more than one layer, read [`.skills/senior-software-staff/SKILL.md`](.skills/senior-software-staff/SKILL.md) first.
