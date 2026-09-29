# API

Hono API ติดตั้งเส้นทางแบบมีเวอร์ชันภายใต้ `/api/v1` (ดู `apps/api/src/routes/v1-routes.ts`) URL เริ่มต้น: `http://127.0.0.1:3001`

`GET /` ที่รากคืนชื่อ API และคำใบ้ health

## โมดูล

| พรีฟิกซ์ | โมดูล |
| --- | --- |
| `/api/v1/health` | `modules/health` |
| `/api/v1/users` | `modules/user` |
| `/api/v1/auth`, `/api/v1/password` | `modules/auth` |
| `/api/v1/admins` | `modules/admin` (รวม `/users` ซ้อน) |

## Health

| เมธอด | พาธ |
| --- | --- |
| GET | `/api/v1/health` |

## ผู้ใช้ (สาธารณะ + ต้องยืนยันตัวตน)

| เมธอด | พาธ | Auth |
| --- | --- | --- |
| POST | `/api/v1/users` | สาธารณะ — สมัคร |
| GET | `/api/v1/users/me` | User |
| PATCH | `/api/v1/users/me` | User |

## Auth และรหัสผ่าน

| เมธอด | พาธ | Auth |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | สาธารณะ |
| POST | `/api/v1/auth/refresh` | สาธารณะ |
| POST | `/api/v1/auth/logout` | สาธารณะ |
| PUT | `/api/v1/password` | User |
| POST | `/api/v1/password/forgot` | สาธารณะ |
| POST | `/api/v1/password/reset` | สาธารณะ |

## แอดมิน

| เมธอด | พาธ | Auth |
| --- | --- | --- |
| GET / POST | `/api/v1/admins/init` | สาธารณะ (bootstrap) |
| POST | `/api/v1/admins/login` | สาธารณะ |
| POST | `/api/v1/admins/refresh` | สาธารณะ |
| POST | `/api/v1/admins/forgot-password` | สาธารณะ |
| POST | `/api/v1/admins/reset-password` | สาธารณะ |
| GET | `/api/v1/admins/me` | Admin Bearer |
| GET / POST | `/api/v1/admins/` | ซูเปอร์แอดมิน |
| PATCH / DELETE | `/api/v1/admins/:id` | ซูเปอร์แอดมิน |

## จัดการผู้ใช้โดยแอดมิน

ติดตั้งที่ `/api/v1/admins/users`:

| เมธอด | พาธ | Auth |
| --- | --- | --- |
| GET | `/api/v1/admins/users` | Admin Bearer |
| POST | `/api/v1/admins/users` | Admin Bearer |
| GET | `/api/v1/admins/users/:id` | Admin Bearer |
| PATCH | `/api/v1/admins/users/:id` | Admin Bearer |
| DELETE | `/api/v1/admins/users/:id` | Admin Bearer |

## สัญญาข้อมูล

Zod schema และ envelope ของคำขอ/คำตอบอยู่ที่ `packages/shared` แฮนด์เลอร์ตรวจด้วย `zValidator` และคืนรูป `IResponseData` / `IResponsePaginate`

## เกี่ยวข้อง

- [การยืนยันตัวตน](authentication.md)
- [โครงสร้างโปรเจกต์](project-structure.md)
