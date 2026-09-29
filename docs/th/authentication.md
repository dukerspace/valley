# การยืนยันตัวตน

Valley มี auth คู่: **User** (คุกกี้) สำหรับ frontend และ **Admin** (Bearer) สำหรับ backoffice ทั้งคู่ใช้ JWT ที่เซ็นด้วย `JWT_SECRET` ภายใต้พรีฟิกซ์ `/api/v1`

## ผู้ใช้ (frontend) — คุกกี้

ล็อกอินและรีเฟรชตั้งคุกกี้ HttpOnly `valley_access_token` และ `valley_refresh_token` Frontend เรียก API ด้วย `credentials: 'include'` และไม่เก็บโทเคนใน `localStorage`

มิดเดิลแวร์ของ API รับ **Bearer** หรือคุกกี้ access; JWT ต้องเป็นชนิด `access` + `user`

| เมธอด | พาธ | หมายเหตุ |
| --- | --- | --- |
| POST | `/api/v1/users` | สมัคร |
| POST | `/api/v1/auth/login` | ตั้งคุกกี้ |
| POST | `/api/v1/auth/refresh` | รีเฟรชเซสชัน |
| POST | `/api/v1/auth/logout` | ล้างคุกกี้ |
| GET / PATCH | `/api/v1/users/me` | ผู้ใช้ปัจจุบัน (ต้อง auth) |
| PUT | `/api/v1/password` | เปลี่ยนรหัสผ่าน (ต้อง auth) |
| POST | `/api/v1/password/forgot` | ขอรีเซ็ต |
| POST | `/api/v1/password/reset` | ทำรีเซ็ตให้เสร็จ |

ตัวช่วยฝั่งไคลเอ็นต์อยู่ที่ `apps/frontend/src/lib/auth.ts` และ `apps/frontend/src/lib/api.ts`

## แอดมิน (backoffice) — Bearer

ล็อกอินและ init คืนโทเคนใน JSON body (ไม่มีคุกกี้) Backoffice เก็บ `valley_admin_access_token` / `valley_admin_refresh_token` ใน `localStorage` แล้วส่ง `Authorization: Bearer …`

มิดเดิลแวร์รับเฉพาะ **Bearer**; JWT ชนิด `access` + `admin` การ CRUD แอดมินต้องมีบทบาท `SUPER_ADMIN`

| เมธอด | พาธ | หมายเหตุ |
| --- | --- | --- |
| GET / POST | `/api/v1/admins/init` | สร้างซูเปอร์แอดมินครั้งแรก |
| POST | `/api/v1/admins/login` | คืนโทเคน |
| POST | `/api/v1/admins/refresh` | รีเฟรช |
| POST | `/api/v1/admins/forgot-password` | ขอรีเซ็ต |
| POST | `/api/v1/admins/reset-password` | ทำรีเซ็ตให้เสร็จ |
| GET | `/api/v1/admins/me` | แอดมินปัจจุบัน (Bearer) |
| CRUD | `/api/v1/admins/` | บัญชีแอดมิน (ซูเปอร์แอดมิน) |
| CRUD | `/api/v1/admins/users` | จัดการผู้ใช้ (Bearer) |

ตัวช่วยฝั่งไคลเอ็นต์: `apps/backoffice/src/lib/auth.ts` และ `apps/backoffice/src/lib/api.ts`

## รีเซ็ตรหัสผ่านตอนพัฒนา

ไม่มี SMTP เป็นค่าเริ่มต้น ลิงก์รีเซ็ตจะถูก **พิมพ์ลง API stdout** คัดลอก URL จากคอนโซล

## รูปแบบคำตอบ

เพย์โหลดสำเร็จใช้ชนิดร่วมจาก `packages/shared` (`IResponseData`, `IResponsePaginate`, `IErrorResponse`)

## เกี่ยวข้อง

- [API](api.md)
- [ตัวแปรสภาพแวดล้อม](environment.md)
