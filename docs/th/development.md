# การพัฒนา

คำสั่งประจำวันและพอร์ตของแอป valley ที่สร้างแล้ว

## สคริปต์ (รากโปรเจกต์)

| คำสั่ง | คำอธิบาย |
| --- | --- |
| `bun run dev` | สตาร์ททุกแอปผ่าน Turbo |
| `bun run build` | บิลด์ทุกแพ็กเกจ |
| `bun run typecheck` | ตรวจชนิดทั้งเวิร์กสเปซ |
| `bun run test` | รันเทส |
| `bun run lint` | Lint |
| `bun run format` | Prettier เขียนไฟล์ |
| `bun run format:check` | Prettier ตรวจอย่างเดียว |
| `bun run db:generate` | Prisma generate |
| `bun run db:validate` | Prisma validate |
| `bun run db:migrate` | Prisma migrate (dev) |

สคริปต์ฐานข้อมูลชี้ไปที่ `packages/database` (`@valley/database` หรือ `@<name>/database`)

## พอร์ต

| แอป | URL เริ่มต้น |
| --- | --- |
| Frontend | http://127.0.0.1:3000 |
| API | http://127.0.0.1:3001 |
| Backoffice | http://127.0.0.1:3002 |

ปรับผ่าน `.env` ที่ราก — ดู [ตัวแปรสภาพแวดล้อม](environment.md)

## ลูปทั่วไป

```bash
cp .env.example .env   # ครั้งเดียว
bun run db:migrate
bun run dev
```

1. ตั้ง `DATABASE_URL` และ `JWT_SECRET`
2. รัน migrate สคีมา
3. สตาร์ทสแตกแล้วเปิด URL frontend / backoffice

## อีเมลรีเซ็ตรหัสผ่าน

ตอนพัฒนา อีเมลรีเซ็ตจะถูก **พิมพ์ลง API stdout** (ไม่มี SMTP) คัดลอก URL จากคอนโซล

## แอดมินคนแรก

ใช้ `GET`/`POST` `/api/v1/admins/init` (หรือโฟลว์ init ใน backoffice) เพื่อสร้างซูเปอร์แอดมินคนแรก ดู [การยืนยันตัวตน](authentication.md)

## ความต้องการของระบบ

- Bun `>=1.3.0`
- PostgreSQL ที่เข้าถึงได้ผ่าน `DATABASE_URL`
