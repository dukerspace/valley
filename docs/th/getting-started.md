# เริ่มต้นใช้งาน

สร้าง Bun + Turbo monorepo (Hono API, TanStack Start frontend + backoffice, Prisma) ด้วย **create-valley**

## ความต้องการของระบบ

- [Bun](https://bun.sh) `>=1.3.0`
- PostgreSQL

## สร้างโปรเจกต์

```bash
npx create-valley my-app
# หรือ
bunx create-valley my-app
```

คำสั่งนี้คัดลอกเทมเพลต valley ไปที่ `./my-app` จากนั้นรัน `git init` และ `bun install`

ชื่อโปรเจกต์ต้องเป็น npm slug ตัวพิมพ์เล็ก (เช่น `my-app`)

## รันครั้งแรก

```bash
cd my-app
cp .env.example .env
bun run db:migrate
bun run dev
```

แก้ `.env` ก่อนสตาร์ท API — อย่างน้อยตั้ง `JWT_SECRET` จริงและ `DATABASE_URL` ที่ใช้ได้

## URL เริ่มต้น

| แอป | URL |
| --- | --- |
| Frontend (ผู้ใช้) | http://127.0.0.1:3000 |
| API | http://127.0.0.1:3001 |
| Backoffice (แอดมิน) | http://127.0.0.1:3002 |

## แพ็กเกจเสริม

ตอนสร้าง (ใน TTY) สามารถเลือก `ai`, `stripe`, `email`, และ `storage` ได้ หรือส่งตอนสร้างเลย:

```bash
bunx create-valley my-app --packages ai,stripe
```

ดู [CLI reference](cli.md) และ [แพ็กเกจเสริม](optional-packages.md)

## ขั้นตอนถัดไป

- [ตัวแปรสภาพแวดล้อม](environment.md)
- [การยืนยันตัวตน](authentication.md)
- [โครงสร้างโปรเจกต์](project-structure.md)
- [สคริปต์สำหรับพัฒนา](development.md)
