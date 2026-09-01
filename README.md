# 🍬 ระบบจัดการร้านขนม (Candy Shop)

เว็บจัดการร้านขนม 2 เมนูหลัก:

1. **แดชบอร์ด / ออเดอร์** — เปิดออเดอร์ ดูยอดขายวันนี้/เดือนนี้ กำไร กราฟ 7 วัน และขนมขายดี
2. **ต้นทุน / วัตถุดิบ** — จัดการราคาขาย/ต้นทุนสินค้า และรายการวัตถุดิบ

เทคโนโลยี: **Next.js 15 + Supabase + Tailwind + Recharts**

---

## 1) ตั้งค่า Supabase (ฐานข้อมูล)

1. สร้างโปรเจคที่ [supabase.com](https://supabase.com) (ฟรี)
2. เปิด **SQL Editor → New query** วางเนื้อหาไฟล์ [`supabase_schema.sql`](./supabase_schema.sql) แล้วกด **Run**
3. ไปที่ **Project Settings → API** คัดลอก:
   - `Project URL`
   - `anon public` key

## 2) รันในเครื่อง

```bash
cp .env.local.example .env.local   # แล้วใส่ค่า URL + anon key
npm install
npm run dev
```

เปิด http://localhost:3000

## 3) Deploy ขึ้น Vercel (ออนไลน์)

1. push โค้ดขึ้น GitHub
2. เข้า [vercel.com](https://vercel.com) → **Add New → Project** → เลือก repo
3. ที่หน้า Configure ใส่ **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. กด **Deploy** — เสร็จแล้วจะได้ลิงก์ใช้งานออนไลน์

> หมายเหตุ: สคีมานี้เปิดสิทธิ์ให้ anon key อ่าน/เขียนได้ (ร้านใช้เองภายใน)
> ถ้าต้องการระบบล็อกอิน/จำกัดสิทธิ์ แจ้งเพิ่มได้ภายหลัง
