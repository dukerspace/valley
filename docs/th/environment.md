# ตัวแปรสภาพแวดล้อม

แอปและแพ็กเกจทั้งหมดโหลดไฟล์ `.env` **ที่รากโปรเจกต์ไฟล์เดียว** คัดลอกตัวอย่างแล้วแก้ค่าก่อนรัน API:

```bash
cp .env.example .env
```

## จำเป็น

| ตัวแปร | วัตถุประสงค์ |
| --- | --- |
| `DATABASE_URL` | สตริงเชื่อมต่อ PostgreSQL สำหรับ Prisma |
| `JWT_SECRET` | ความลับสำหรับเซ็น JWT (ใช้สตริงสุ่มยาวในโปรดักชัน อย่างน้อย 16 ตัวอักษร) |

## แอปและ URL

| ตัวแปร | ค่าเริ่มต้น | วัตถุประสงค์ |
| --- | --- | --- |
| `API_HOST` / `API_PORT` / `API_URL` | `127.0.0.1` / `3001` / `http://127.0.0.1:3001` | ผูกและ URL สาธารณะของ Hono API |
| `FRONTEND_HOST` / `FRONTEND_PORT` / `FRONTEND_URL` | `127.0.0.1` / `3000` / `http://127.0.0.1:3000` | แอปผู้ใช้ |
| `BACKOFFICE_HOST` / `BACKOFFICE_PORT` / `BACKOFFICE_URL` | `127.0.0.1` / `3002` / `http://127.0.0.1:3002` | แอปแอดมิน |
| `VITE_API_URL` | `http://127.0.0.1:3001` | ฐาน API ที่เบราว์เซอร์เห็น (ต้องมีคำนำหน้า `VITE_`) |
| `CORS_ORIGIN` | origin ของ frontend + backoffice | origin ที่ API อนุญาต คั่นด้วยจุลภาค |
| `NODE_ENV` | `development` | โหมดรันไทม์ |

## แพ็กเกจเสริม

บล็อกใน `.env.example` จะมีเฉพาะแพ็กเกจที่เลือกตอนสร้าง ส่วน `# --- Optional: <id> ---` ที่ไม่ถูกเลือกจะถูกลบระหว่าง scaffold

| แพ็กเกจ | ตัวแปร |
| --- | --- |
| `ai` | `AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL` และคีย์ผู้ให้บริการ (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`) |
| `stripe` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `email` | `RESEND_API_KEY`, `EMAIL_FROM` |
| `storage` | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` |

`AI_PROVIDER` รับค่า: `openai` | `anthropic` | `google` | `openrouter`

## เคล็ดลับ

- อย่า commit `.env` มีเฉพาะ `.env.example` ใน scaffold (ไม่มีความลับ)
- ให้ `VITE_API_URL` และ `CORS_ORIGIN` สอดคล้องกับวิธีรันแอปในเครื่องหรือบนเซิร์ฟเวอร์
- ดู [แพ็กเกจเสริม](optional-packages.md) สำหรับสิ่งที่แต่ละแพ็กเกจส่งออก
