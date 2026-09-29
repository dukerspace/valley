# อ้างอิง CLI

```text
create-valley <name> [options]
```

เรียกได้ด้วย `npx create-valley`, `bunx create-valley` หรือ `bun run create-valley` จากรีโปนี้

## อาร์กิวเมนต์

| อาร์กิวเมนต์ | คำอธิบาย |
| --- | --- |
| `name` | โฟลเดอร์ที่จะสร้าง ต้องเป็น npm slug ตัวพิมพ์เล็ก (เช่น `my-app`) |

## ตัวเลือก

| แฟล็ก | คำอธิบาย |
| --- | --- |
| `--packages <list>` | แพ็กเกจเสริมที่จะรวม (`ai`, `stripe`, `email`, `storage`) คั่นด้วยจุลภาค ข้ามตัวเลือกแบบโต้ตอบ |
| `--no-install` | ข้าม `bun install` |
| `--no-git` | ข้าม `git init` |
| `--dry-run` | แสดงการกระทำโดยไม่เขียนไฟล์ |
| `-v`, `--version` | แสดงเวอร์ชัน CLI |
| `-h`, `--help` | แสดงความช่วยเหลือ |

## การเลือกแพ็กเกจ

รหัสที่รองรับ: `ai`, `stripe`, `email`, `storage`

| โหมด | พฤติกรรม |
| --- | --- |
| `--packages ai,stripe` | รวมเฉพาะแพ็กเกจเหล่านั้น ข้ามตัวเลือกโต้ตอบ |
| `--packages` เป็นรายการว่าง | ไม่รวมแพ็กเกจเสริม |
| ไม่มี `--packages` + TTY | เลือกหลายรายการแบบโต้ตอบ (ค่าเริ่มต้นไม่เลือกอะไร) กดยกเลิกจะออกด้วยรหัส 1 |
| ไม่มี `--packages` + non-TTY | ไม่รวมแพ็กเกจเสริม (ไม่ถาม) |

แพ็กเกจหลัก (`database`, `shared`, `ui`, `locale`) มีเสมอ โฟลเดอร์แพ็กเกจเสริมที่ไม่ได้เลือกจะถูกลบ และบล็อกใน `.env.example` ที่ตรงกันจะถูกตัดออก แพ็กเกจที่เลือกจะถูกลิงก์เข้า `apps/api`

## สิ่งที่ scaffolding ทำ

1. คัดลอก `templates/valley` ไปที่ `./<name>` (ข้าม `node_modules`, แคชบิลด์, ไฟล์ `.env` ยกเว้น `.env.example`)
2. ใช้การเลือกแพ็กเกจเสริม
3. เปลี่ยนสโคป `@valley` เป็น `@<name>`
4. (ถ้าเปิด) `git init` และ `bun install`

## ตัวอย่าง

```bash
npx create-valley my-app
bunx create-valley my-app --packages ai,stripe
bun run create-valley my-app --no-install --no-git
bunx create-valley my-app --dry-run
```

## พัฒนา CLI บนเครื่อง

จากรีโป create-valley:

```bash
bun run create-valley my-app
# หรือ
bun link
create-valley my-app
```
