"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { baht, Order, Product } from "@/lib/types";
import ConfigNotice from "@/components/ConfigNotice";

type CartLine = { product: Product; qty: number };

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("products").select("*").order("name"),
    ]);
    setOrders((o as Order[]) || []);
    setProducts((p as Product[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => computeStats(orders), [orders]);

  if (!isSupabaseConfigured) return <ConfigNotice />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">แดชบอร์ด</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          ＋ เปิดออเดอร์ใหม่
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="ยอดขายวันนี้" value={baht(stats.todaySales)} tone="brand" />
        <Stat label="ยอดขายเดือนนี้" value={baht(stats.monthSales)} />
        <Stat label="กำไรเดือนนี้" value={baht(stats.monthProfit)} tone="green" />
        <Stat label="ออเดอร์เดือนนี้" value={String(stats.monthCount)} />
      </div>

      {/* Chart */}
      <div className="card p-4">
        <h2 className="mb-3 font-semibold text-gray-700">
          ยอดขาย 7 วันล่าสุด
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3d6e4" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(v: number) => baht(v)}
                labelStyle={{ color: "#c23a6e" }}
              />
              <Bar dataKey="sales" fill="#e0568a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best sellers */}
      {stats.topProducts.length > 0 && (
        <div className="card p-4">
          <h2 className="mb-3 font-semibold text-gray-700">ขนมขายดี</h2>
          <div className="space-y-2">
            {stats.topProducts.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-gray-400">{i + 1}.</span>
                <span className="flex-1">{t.name}</span>
                <span className="font-medium">{t.qty} ชิ้น</span>
                <span className="w-24 text-right text-brand-dark">
                  {baht(t.sales)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="border-b border-pink-100 px-4 py-3 font-semibold text-gray-700">
          ออเดอร์ล่าสุด
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-400">กำลังโหลด…</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            ยังไม่มีออเดอร์ — กด “เปิดออเดอร์ใหม่” เพื่อเริ่ม
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50/60 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">วันเวลา</th>
                  <th className="px-4 py-2">ลูกค้า</th>
                  <th className="px-4 py-2">ช่องทาง</th>
                  <th className="px-4 py-2">รายการ</th>
                  <th className="px-4 py-2 text-right">ยอด</th>
                  <th className="px-4 py-2 text-right">กำไร</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 30).map((o) => (
                  <tr key={o.id} className="border-t border-pink-50">
                    <td className="px-4 py-2 text-gray-500">
                      {new Date(o.created_at).toLocaleString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2">{o.customer || "-"}</td>
                    <td className="px-4 py-2">{o.channel}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {(o.order_items || [])
                        .map((it) => `${it.product_name}×${it.qty}`)
                        .join(", ") || "-"}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {baht(o.total)}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600">
                      {baht(o.total - o.cost_total)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="text-xs text-red-400 hover:text-red-600"
                        onClick={async () => {
                          if (!supabase) return;
                          if (!confirm("ลบออเดอร์นี้?")) return;
                          await supabase.from("orders").delete().eq("id", o.id);
                          load();
                        }}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <OrderForm
          products={products}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "brand" | "green";
}) {
  const color =
    tone === "brand"
      ? "text-brand-dark"
      : tone === "green"
      ? "text-green-600"
      : "text-gray-800";
  return (
    <div className="card p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

// ---------- ฟอร์มเปิดออเดอร์ ----------
function OrderForm({
  products,
  onClose,
  onSaved,
}: {
  products: Product[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState("");
  const [channel, setChannel] = useState("หน้าร้าน");
  const [saving, setSaving] = useState(false);

  const total = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const costTotal = cart.reduce((s, l) => s + l.product.cost * l.qty, 0);

  function addProduct(p: Product) {
    setCart((c) => {
      const found = c.find((l) => l.product.id === p.id);
      if (found)
        return c.map((l) =>
          l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l
        );
      return [...c, { product: p, qty: 1 }];
    });
  }

  async function save() {
    if (!supabase || cart.length === 0) return;
    setSaving(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ customer: customer || null, channel, total, cost_total: costTotal })
      .select()
      .single();
    if (error || !order) {
      alert("บันทึกไม่สำเร็จ: " + error?.message);
      setSaving(false);
      return;
    }
    const items = cart.map((l) => ({
      order_id: order.id,
      product_id: l.product.id,
      product_name: l.product.name,
      qty: l.qty,
      price: l.product.price,
      cost: l.product.cost,
    }));
    await supabase.from("order_items").insert(items);
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-dark">เปิดออเดอร์ใหม่</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="label">ลูกค้า (ไม่บังคับ)</label>
            <input
              className="input"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="เช่น คุณเอ"
            />
          </div>
          <div>
            <label className="label">ช่องทาง</label>
            <select
              className="input"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option>หน้าร้าน</option>
              <option>Line</option>
              <option>Facebook</option>
              <option>Shopee</option>
              <option>อื่นๆ</option>
            </select>
          </div>
        </div>

        <label className="label">เลือกเมนู</label>
        <div className="mb-3 flex flex-wrap gap-2">
          {products.length === 0 && (
            <p className="text-sm text-gray-400">
              ยังไม่มีสินค้า — เพิ่มได้ที่หน้า “ต้นทุน / วัตถุดิบ”
            </p>
          )}
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addProduct(p)}
              className="btn-ghost text-xs"
            >
              {p.name} · {baht(p.price)}
            </button>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mb-3 space-y-2 rounded-xl bg-pink-50/60 p-3">
            {cart.map((l) => (
              <div key={l.product.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{l.product.name}</span>
                <input
                  type="number"
                  min={1}
                  value={l.qty}
                  onChange={(e) =>
                    setCart((c) =>
                      c.map((x) =>
                        x.product.id === l.product.id
                          ? { ...x, qty: Math.max(1, Number(e.target.value)) }
                          : x
                      )
                    )
                  }
                  className="w-16 rounded-lg border border-pink-200 px-2 py-1 text-center"
                />
                <span className="w-20 text-right">
                  {baht(l.product.price * l.qty)}
                </span>
                <button
                  className="text-red-400"
                  onClick={() =>
                    setCart((c) => c.filter((x) => x.product.id !== l.product.id))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4 flex justify-between border-t border-pink-100 pt-3 text-sm">
          <span className="text-gray-500">
            ต้นทุน {baht(costTotal)} · กำไร {baht(total - costTotal)}
          </span>
          <span className="text-lg font-bold text-brand-dark">
            รวม {baht(total)}
          </span>
        </div>

        <button
          className="btn-primary w-full"
          disabled={cart.length === 0 || saving}
          onClick={save}
        >
          {saving ? "กำลังบันทึก…" : "บันทึกออเดอร์"}
        </button>
      </div>
    </div>
  );
}

// ---------- คำนวณสถิติ ----------
function computeStats(orders: Order[]) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let todaySales = 0;
  let monthSales = 0;
  let monthProfit = 0;
  let monthCount = 0;

  const prodMap = new Map<string, { qty: number; sales: number }>();

  for (const o of orders) {
    if (o.status === "ยกเลิก") continue;
    const d = new Date(o.created_at);
    if (d >= startToday) todaySales += o.total;
    if (d >= startMonth) {
      monthSales += o.total;
      monthProfit += o.total - o.cost_total;
      monthCount += 1;
      for (const it of o.order_items || []) {
        const cur = prodMap.get(it.product_name) || { qty: 0, sales: 0 };
        cur.qty += Number(it.qty);
        cur.sales += Number(it.price) * Number(it.qty);
        prodMap.set(it.product_name, cur);
      }
    }
  }

  // 7 วันล่าสุด
  const last7: { label: string; sales: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(startToday);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const sales = orders
      .filter((o) => o.status !== "ยกเลิก")
      .filter((o) => {
        const d = new Date(o.created_at);
        return d >= day && d < next;
      })
      .reduce((s, o) => s + o.total, 0);
    last7.push({
      label: day.toLocaleDateString("th-TH", { weekday: "short" }),
      sales,
    });
  }

  const topProducts = [...prodMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return { todaySales, monthSales, monthProfit, monthCount, last7, topProducts };
}
