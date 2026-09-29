# การแปลภาษา

ข้อความที่ผู้ใช้เห็นอยู่ที่ `packages/locale` (`@valley/locale` หรือ `@<name>/locale`) โลเคลที่ใช้งาน: **`en`** และ **`th`** ค่าเริ่มต้น: `en`

## API ของแพ็กเกจ

| ส่งออก | วัตถุประสงค์ |
| --- | --- |
| `locales` | `['en', 'th']` |
| `defaultLocale` | `'en'` |
| `catalogs` | Record ของโลเคล → ข้อความ |
| `getMessages(locale?)` | ดึงแคตตาล็อก |
| `isLocale(value)` | type guard |
| `en` / `th` | แคตตาล็อกแยก (รวมทาง subpath `./en`, `./th`) |

แหล่งแคตตาล็อก: `packages/locale/src/en.ts`, `packages/locale/src/th.ts` มีเทสพาริตี้ (`src/index.test.ts`) ให้คีย์ตรงกันทุกโลเคล

## แอป

Frontend และ backoffice ห่อต้นไม้ด้วย `LocaleProvider` และอ่านข้อความผ่าน `useLocaleContext` (`apps/frontend|backoffice/src/components/locale-provider.tsx`) โลเคลที่เลือกเก็บใน `localStorage` ที่คีย์ `valley.locale`

## กฎเมื่อแก้ข้อความ

1. อย่า hard-code ข้อความที่ผู้ใช้เห็นในแอป — เพิ่มคีย์ในแพ็กเกจ locale
2. อัปเดต**ทุก**โลเคลที่ใช้งาน (`en`, `th`, …)
3. คง placeholder, ICU plural และชื่อแบรนด์ให้เหมือนกันทุกโลเคล
4. รันเทสแพ็กเกจ locale (เช่น `bun test` กรองที่ locale) ก่อนถือว่างานเสร็จ

ส่งข้อความ UI/API ที่แสดงผลในโลเคลเดียวเท่านั้นถือว่ายังไม่เสร็จ

## เกี่ยวข้อง

- [โครงสร้างโปรเจกต์](project-structure.md)
- [การพัฒนา](development.md)
