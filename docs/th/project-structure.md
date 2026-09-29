# โครงสร้างโปรเจกต์

แอปที่สร้างได้เป็น Bun + Turbo monorepo

## แผนที่เวิร์กสเปซ

| พาธ | บทบาท |
| --- | --- |
| `apps/api` | Hono API — `/api/v1` พอร์ต `3001` |
| `apps/frontend` | แอปผู้ใช้ — TanStack Start, cookie auth, พอร์ต `3000` |
| `apps/backoffice` | แอปแอดมิน — TanStack Start, Bearer auth, พอร์ต `3002` |
| `packages/database` | Prisma + PostgreSQL |
| `packages/shared` | Zod DTO, response envelope (`IResponseData`, `IResponsePaginate`, `IErrorResponse`), ค่าคงที่ |
| `packages/ui` | คอมโพเนนต์ UI และโทเคนร่วม |
| `packages/locale` | แคตตาล็อก i18n (`en`, `th`) |
| `packages/ai` | เสริม — อะแดปเตอร์ AI หลายผู้ให้บริการ |
| `packages/stripe` | เสริม — สตับ Stripe |
| `packages/email` | เสริม — สตับอีเมล Resend |
| `packages/storage` | เสริม — สตับ S3 |

แพ็กเกจเสริมมีเฉพาะเมื่อเลือกตอนสร้างโปรเจกต์

## กฎการวางโค้ด

- ใส่โค้ดผลิตภัณฑ์ใหม่ในแอปหรือแพ็กเกจที่มีอยู่ — อย่าสร้างต้นไม้ระดับบนคู่ขนาน
- แอป UI (`frontend`, `backoffice`) ต้องไม่ import Prisma หรือ `packages/database` โดยตรง
- ชนิดคำขอ/คำตอบและ Zod schema อยู่ที่ `packages/shared`
- ข้อความที่ผู้ใช้เห็นอยู่ที่ `packages/locale` — อย่า hard-code ในแอป
- แก้ในแพ็กเกจที่เป็นเจ้าของเรื่องก่อน แทนการย้ายข้ามชั้นโดยไม่จำเป็น

## เริ่มดูที่ไหน

| ความต้องการ | เริ่มที่ |
| --- | --- |
| HTTP routes / services | `apps/api` |
| UI ผู้ใช้ | `apps/frontend` |
| UI แอดมิน | `apps/backoffice` |
| Schema / migrations | `packages/database` |
| Contracts / envelopes | `packages/shared` |
| ข้อความ / locales | `packages/locale` |

## เกี่ยวข้อง

- [API](api.md)
- [แพ็กเกจเสริม](optional-packages.md)
- [การแปลภาษา](localization.md)
