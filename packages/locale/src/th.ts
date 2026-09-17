import type { Messages } from './en.ts'

export const th = {
  app: {
    title: 'สถานะ Starter',
    tagline: 'ตรวจสอบสุขภาพของระบบ',
  },
  health: {
    heading: 'สถานะบริการ',
    loading: 'กำลังตรวจสอบ API และฐานข้อมูล…',
    success: 'ทุกอย่างพร้อมใช้งาน',
    error: 'ไม่สามารถเชื่อมต่อ API หรือฐานข้อมูลได้',
    status: 'สถานะ',
    database: 'ฐานข้อมูล',
    timestamp: 'ตรวจสอบเมื่อ',
    retry: 'ลองอีกครั้ง',
    up: 'พร้อม',
    down: 'ไม่พร้อม',
  },
  locale: {
    label: 'ภาษา',
    en: 'อังกฤษ',
    th: 'ไทย',
  },
} as const satisfies Messages
