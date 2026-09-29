# แพ็กเกจเสริม

ตอนสร้างโปรเจกต์สามารถรวม `ai`, `stripe`, `email`, และ `storage` ได้ แพ็กเกจหลัก (`database`, `shared`, `ui`, `locale`) มีเสมอ

```bash
bunx valley-cli new my-app --packages ai,email
```

แพ็กเกจที่เลือกจะถูกลิงก์เข้า `apps/api` โฟลเดอร์ที่ไม่เลือกจะถูกลบ และบล็อกใน `.env.example` ที่ตรงกันจะถูกตัด ดู [อ้างอิง CLI](cli.md)

เพิ่มแพ็กเกจทีหลังในโปรเจกต์ที่มีอยู่แล้ว:

```bash
cd my-app
valley add ai stripe
```

## `@valley/ai` (หรือ `@<name>/ai`)

อะแดปเตอร์ AI หลายผู้ให้บริการ (OpenAI, Anthropic/Claude, Google Gemini, OpenRouter)

**ส่งออก:** `createAiClient`, `createAiClientFromEnv`, ตัวช่วยผู้ให้บริการและชนิด (`AiProvider`, `AiClient`, …)

**Env:** `AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL` และคีย์ของผู้ให้บริการที่เลือก (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, หรือ `OPENROUTER_API_KEY`)

## `@valley/stripe`

สตับไคลเอ็นต์ Stripe สำหรับชั้น API

**ส่งออก:** `createStripeClient` (มี `ping()` แบบสตับ)

**Env:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## `@valley/email`

สตับอีเมลแนว Resend ตอนพัฒนา `sendEmail` จะ log ลงคอนโซลแทนการเรียก Resend

**ส่งออก:** `createEmailClient`

**Env:** `RESEND_API_KEY`, `EMAIL_FROM`

## `@valley/storage`

สตับสตอเรจแนว S3 (`upload`, `getUrl`)

**ส่งออก:** `createStorageClient`

**Env:** `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

## หมายเหตุ

- สโคปแพ็กเกจถูกเปลี่ยนจาก `@valley` เป็น `@<ชื่อโปรเจกต์>` ตอน scaffold
- สตับเป็นจุดเริ่มต้น — ต่อ SDK จริงใน API เมื่อพร้อมใช้โปรดักชัน
- ตั้งตัวแปรตาม [ตัวแปรสภาพแวดล้อม](environment.md)
