# อ้างอิง CLI

```text
valley new <name> [options]
valley add <pkg> [pkg...] [options]
```

เรียกได้ด้วย `npx valley`, `bunx valley` หรือ `bun run valley --` จากรีโปนี้

## คำสั่ง

| คำสั่ง | คำอธิบาย |
| --- | --- |
| `new <name>` | สร้างโฟลเดอร์โปรเจกต์ ต้องเป็น npm slug ตัวพิมพ์เล็ก (เช่น `my-app`) |
| `add <pkg...>` | เพิ่มแพ็กเกจเสริม (`ai`, `stripe`, `email`, `storage`) ในโฟลเดอร์โปรเจกต์**ปัจจุบัน** |

## ตัวเลือก

| แฟล็ก | คำอธิบาย |
| --- | --- |
| `--packages <list>` | (`new`) แพ็กเกจเสริมที่จะรวม คั่นด้วยจุลภาค ข้ามตัวเลือกแบบโต้ตอบ |
| `--no-install` | ข้าม `bun install` |
| `--no-git` | (`new`) ข้าม `git init` |
| `--dry-run` | แสดงการกระทำโดยไม่เขียนไฟล์ |
| `-v`, `--version` | แสดงเวอร์ชัน CLI |
| `-h`, `--help` | แสดงความช่วยเหลือ |

## การเลือกแพ็กเกจ (`new`)

รหัสที่รองรับ: `ai`, `stripe`, `email`, `storage`

| โหมด | พฤติกรรม |
| --- | --- |
| `--packages ai,stripe` | รวมเฉพาะแพ็กเกจเหล่านั้น ข้ามตัวเลือกโต้ตอบ |
| `--packages` เป็นรายการว่าง | ไม่รวมแพ็กเกจเสริม |
| ไม่มี `--packages` + TTY | เลือกหลายรายการแบบโต้ตอบ (ค่าเริ่มต้นไม่เลือกอะไร) กดยกเลิกจะออกด้วยรหัส 1 |
| ไม่มี `--packages` + non-TTY | ไม่รวมแพ็กเกจเสริม (ไม่ถาม) |

แพ็กเกจหลัก (`database`, `shared`, `ui`, `locale`) มีเสมอ โฟลเดอร์แพ็กเกจเสริมที่ไม่ได้เลือกจะถูกลบ และบล็อกใน `.env.example` ที่ตรงกันจะถูกตัดออก แพ็กเกจที่เลือกจะถูกลิงก์เข้า `apps/api`

## เพิ่มแพ็กเกจทีหลัง (`add`)

รันภายในโปรเจกต์ valley ที่มีอยู่แล้ว:

```bash
cd my-app
valley add ai
valley add ai stripe --no-install
```

| โหมด | พฤติกรรม |
| --- | --- |
| `valley add ai stripe` | เพิ่มแพ็กเกจเหล่านั้น (คั่นด้วยช่องว่างหรือจุลภาค) |
| `valley add` + TTY | เลือกหลายรายการแบบโต้ตอบ (ซ่อนแพ็กเกจที่มีอยู่แล้ว) |
| `valley add` + non-TTY | ผิดพลาด — ต้องระบุรหัสแพ็กเกจ |

แต่ละแพ็กเกจจะถูกคัดลอกจากแหล่งแพ็กเกจของ valley เปลี่ยนสโคป `@valley` เป็นของโปรเจกต์ ลิงก์เข้า `apps/api` เติมบล็อก `.env.example` ที่ขาด และรัน `bun install` (ยกเว้น `--no-install`) จะล้มเหลวถ้า `packages/<id>` มีอยู่แล้ว

## สิ่งที่ scaffolding ทำ (`new`)

1. คัดลอก `templates/valley` ไปที่ `./<name>` (ข้าม `node_modules`, แคชบิลด์, ไฟล์ `.env` ยกเว้น `.env.example`)
2. คัดลอกแพ็กเกจจาก `packages/` และ playbook ของ CLI (`.agents`, `.skills`, `.cursor/rules`)
3. ใช้การเลือกแพ็กเกจเสริม
4. เปลี่ยนสโคป `@valley` เป็น `@<name>`
5. (ถ้าเปิด) `git init` และ `bun install`

## ตัวอย่าง

```bash
npx valley new my-app
bunx valley new my-app --packages ai,stripe
bun run valley -- new my-app --no-install --no-git
bunx valley new my-app --dry-run
cd my-app && valley add email storage
```

## พัฒนา CLI บนเครื่อง

จากรีโปนี้:

```bash
bun run valley -- new my-app
# หรือ
bun link
valley new my-app
valley add ai
```
