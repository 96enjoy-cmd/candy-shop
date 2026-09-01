-- ========================================================
--  Candy Shop - Supabase Schema
--  รันสคริปต์นี้ใน Supabase > SQL Editor (กด "New query" แล้ว Run)
-- ========================================================

-- ---------- วัตถุดิบ / ต้นทุน (Ingredients) ----------
create table if not exists ingredients (
  id          bigint generated always as identity primary key,
  name        text not null,               -- ชื่อวัตถุดิบ เช่น แป้ง, น้ำตาล
  unit        text not null default 'กรัม', -- หน่วย เช่น กรัม, มล., ฟอง
  cost_per_unit numeric not null default 0, -- ต้นทุนต่อหน่วย (บาท)
  stock       numeric not null default 0,   -- คงเหลือ (ไม่บังคับใช้)
  note        text,
  created_at  timestamptz not null default now()
);

-- ---------- สินค้า / เมนูขนม (Products) ----------
create table if not exists products (
  id          bigint generated always as identity primary key,
  name        text not null,               -- ชื่อขนม
  price       numeric not null default 0,   -- ราคาขาย (บาท)
  cost        numeric not null default 0,   -- ต้นทุนรวมต่อชิ้น (คำนวณ/กรอกเอง)
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- ออเดอร์ (Orders) ----------
create table if not exists orders (
  id          bigint generated always as identity primary key,
  customer    text,                         -- ชื่อลูกค้า (ไม่บังคับ)
  channel     text default 'หน้าร้าน',       -- ช่องทาง เช่น หน้าร้าน, Line, Facebook
  status      text not null default 'สำเร็จ', -- สำเร็จ / รอทำ / ยกเลิก
  total       numeric not null default 0,    -- ยอดรวม (บาท)
  cost_total  numeric not null default 0,    -- ต้นทุนรวมของออเดอร์
  created_at  timestamptz not null default now()
);

-- ---------- รายการในออเดอร์ (Order items) ----------
create table if not exists order_items (
  id          bigint generated always as identity primary key,
  order_id    bigint not null references orders(id) on delete cascade,
  product_id  bigint references products(id),
  product_name text not null,
  qty         numeric not null default 1,
  price       numeric not null default 0,    -- ราคาต่อชิ้น ณ ตอนขาย
  cost        numeric not null default 0     -- ต้นทุนต่อชิ้น ณ ตอนขาย
);

create index if not exists idx_orders_created on orders(created_at);
create index if not exists idx_order_items_order on order_items(order_id);

-- ---------- เปิดสิทธิ์ให้ anon key ใช้งานได้ (โหมดง่าย ไม่มีระบบล็อกอิน) ----------
alter table ingredients  enable row level security;
alter table products     enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;

do $$
begin
  -- อนุญาตทุก operation ให้ทั้ง anon และ authenticated (ร้านใช้เองภายใน)
  perform 1;
end $$;

drop policy if exists "public all ingredients" on ingredients;
drop policy if exists "public all products"    on products;
drop policy if exists "public all orders"      on orders;
drop policy if exists "public all order_items" on order_items;

create policy "public all ingredients" on ingredients for all using (true) with check (true);
create policy "public all products"    on products    for all using (true) with check (true);
create policy "public all orders"      on orders      for all using (true) with check (true);
create policy "public all order_items" on order_items for all using (true) with check (true);

-- ---------- ข้อมูลตัวอย่าง ----------
insert into ingredients (name, unit, cost_per_unit) values
  ('แป้งสาลี', 'กรัม', 0.03),
  ('น้ำตาล', 'กรัม', 0.025),
  ('เนย', 'กรัม', 0.25),
  ('ไข่ไก่', 'ฟอง', 4.5)
on conflict do nothing;

insert into products (name, price, cost) values
  ('คุกกี้เนยสด', 25, 9),
  ('บราวนี่', 35, 14),
  ('มัฟฟินช็อกโกแลต', 30, 12)
on conflict do nothing;
