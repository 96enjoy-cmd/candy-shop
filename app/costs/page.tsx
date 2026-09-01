"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { baht, Ingredient, Product, Equipment } from "@/lib/types";
import ConfigNotice from "@/components/ConfigNotice";

export default function CostsPage() {
  const [tab, setTab] = useState<"products" | "ingredients" | "equipment">(
    "products"
  );

  if (!isSupabaseConfigured) return <ConfigNotice />;

  const tabs = [
    { key: "products", label: "🍰 สินค้า / เมนู" },
    { key: "ingredients", label: "🥣 วัตถุดิบ" },
    { key: "equipment", label: "🔧 อุปกรณ์" },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">ต้นทุน / วัตถุดิบ</h1>

      <div className="flex gap-1 rounded-2xl bg-pink-50 p-1 text-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`flex-1 rounded-xl py-2 font-medium transition ${
              tab === t.key
                ? "bg-white shadow text-brand-dark"
                : "text-cocoa-soft hover:text-brand-dark"
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <ProductsTab />
      ) : tab === "ingredients" ? (
        <IngredientsTab />
      ) : (
        <EquipmentTab />
      )}
    </div>
  );
}

/* ============ สินค้า / เมนู ============ */
function ProductsTab() {
  const [rows, setRows] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", price: "", cost: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("name");
    setRows((data as Product[]) || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!supabase || !form.name) return;
    await supabase.from("products").insert({
      name: form.name,
      price: Number(form.price) || 0,
      cost: Number(form.cost) || 0,
    });
    setForm({ name: "", price: "", cost: "" });
    load();
  }

  async function update(p: Product, patch: Partial<Product>) {
    if (!supabase) return;
    await supabase.from("products").update(patch).eq("id", p.id);
    load();
  }

  async function del(p: Product) {
    if (!supabase) return;
    if (!confirm(`ลบ "${p.name}"?`)) return;
    await supabase.from("products").delete().eq("id", p.id);
    load();
  }

  return (
    <div className="space-y-4">
      {/* เพิ่มสินค้า */}
      <div className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">ชื่อขนม</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="เช่น คุกกี้เนย"
          />
        </div>
        <div>
          <label className="label">ราคาขาย</label>
          <input
            className="input"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div>
          <label className="label">ต้นทุน/ชิ้น</label>
          <input
            className="input"
            type="number"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full" onClick={add}>
            ＋ เพิ่ม
          </button>
        </div>
      </div>

      {/* ตาราง */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-50/60 text-left text-xs text-cocoa-soft">
            <tr>
              <th className="px-4 py-2">ขนม</th>
              <th className="px-4 py-2 text-right">ราคาขาย</th>
              <th className="px-4 py-2 text-right">ต้นทุน</th>
              <th className="px-4 py-2 text-right">กำไร/ชิ้น</th>
              <th className="px-4 py-2 text-right">%กำไร</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-cocoa-soft/70">
                  กำลังโหลด…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-cocoa-soft/70">
                  ยังไม่มีสินค้า
                </td>
              </tr>
            ) : (
              rows.map((p) => {
                const profit = p.price - p.cost;
                const margin = p.price ? (profit / p.price) * 100 : 0;
                return (
                  <tr key={p.id} className="border-t border-pink-50">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-2 py-2 text-right">
                      <EditNum value={p.price} onSave={(v) => update(p, { price: v })} />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <EditNum value={p.cost} onSave={(v) => update(p, { cost: v })} />
                    </td>
                    <td className="px-4 py-2 text-right text-green-600">
                      {baht(profit)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right ${
                        margin < 30 ? "text-red-500" : "text-cocoa-soft"
                      }`}
                    >
                      {margin.toFixed(0)}%
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="text-xs text-red-400 hover:text-red-600"
                        onClick={() => del(p)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-cocoa-soft/70">
        💡 คลิกที่ตัวเลขราคา/ต้นทุนเพื่อแก้ไขได้เลย · แถว %กำไรสีแดง = ต่ำกว่า 30%
      </p>
    </div>
  );
}

/* ============ วัตถุดิบ ============ */
function IngredientsTab() {
  const [rows, setRows] = useState<Ingredient[]>([]);
  const [form, setForm] = useState({ name: "", unit: "กรัม", cost_per_unit: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from("ingredients").select("*").order("name");
    setRows((data as Ingredient[]) || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!supabase || !form.name) return;
    await supabase.from("ingredients").insert({
      name: form.name,
      unit: form.unit || "หน่วย",
      cost_per_unit: Number(form.cost_per_unit) || 0,
    });
    setForm({ name: "", unit: "กรัม", cost_per_unit: "" });
    load();
  }

  async function update(r: Ingredient, patch: Partial<Ingredient>) {
    if (!supabase) return;
    await supabase.from("ingredients").update(patch).eq("id", r.id);
    load();
  }

  async function del(r: Ingredient) {
    if (!supabase) return;
    if (!confirm(`ลบ "${r.name}"?`)) return;
    await supabase.from("ingredients").delete().eq("id", r.id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">ชื่อวัตถุดิบ</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="เช่น แป้งสาลี"
          />
        </div>
        <div>
          <label className="label">หน่วย</label>
          <input
            className="input"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="กรัม / ฟอง / มล."
          />
        </div>
        <div>
          <label className="label">ต้นทุน/หน่วย</label>
          <input
            className="input"
            type="number"
            value={form.cost_per_unit}
            onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full" onClick={add}>
            ＋ เพิ่ม
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-50/60 text-left text-xs text-cocoa-soft">
            <tr>
              <th className="px-4 py-2">วัตถุดิบ</th>
              <th className="px-4 py-2">หน่วย</th>
              <th className="px-4 py-2 text-right">ต้นทุน/หน่วย</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-cocoa-soft/70">
                  กำลังโหลด…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-cocoa-soft/70">
                  ยังไม่มีวัตถุดิบ
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-pink-50">
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2 text-cocoa-soft">{r.unit}</td>
                  <td className="px-2 py-2 text-right">
                    <EditNum
                      value={r.cost_per_unit}
                      onSave={(v) => update(r, { cost_per_unit: v })}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      className="text-xs text-red-400 hover:text-red-600"
                      onClick={() => del(r)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ ค่าอุปกรณ์ ============ */
function EquipmentTab() {
  const [rows, setRows] = useState<Equipment[]>([]);
  const [form, setForm] = useState({ name: "", price: "", source_url: "", note: "" });
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Equipment[]) || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function fetchFromLink() {
    const link = form.source_url.trim();
    if (!link) return;
    setFetching(true);
    setHint(null);
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(link)}`);
      const data = await res.json();
      setForm((f) => ({
        ...f,
        name: data.name || f.name,
        price: data.price != null ? String(data.price) : f.price,
        source_url: data.source_url || f.source_url,
      }));
      setHint(
        data.note ||
          (data.ok ? "✅ ดึงข้อมูลสำเร็จ ตรวจดูอีกครั้งก่อนบันทึกได้เลย" : "ดึงข้อมูลไม่ได้ — กรอกเองได้เลย")
      );
    } catch {
      setHint("เชื่อมต่อไม่ได้ — กรอกชื่อ/ราคาเองได้เลย");
    } finally {
      setFetching(false);
    }
  }

  async function add() {
    if (!supabase || !form.name) return;
    await supabase.from("equipment").insert({
      name: form.name,
      price: Number(form.price) || 0,
      source_url: form.source_url || null,
      note: form.note || null,
    });
    setForm({ name: "", price: "", source_url: "", note: "" });
    setHint(null);
    load();
  }

  async function update(r: Equipment, patch: Partial<Equipment>) {
    if (!supabase) return;
    await supabase.from("equipment").update(patch).eq("id", r.id);
    load();
  }

  async function del(r: Equipment) {
    if (!supabase) return;
    if (!confirm(`ลบ "${r.name}"?`)) return;
    await supabase.from("equipment").delete().eq("id", r.id);
    load();
  }

  const total = rows.reduce((s, r) => s + Number(r.price || 0), 0);

  return (
    <div className="space-y-4">
      {/* เพิ่มอุปกรณ์ */}
      <div className="card space-y-3 p-4">
        {/* วางลิงก์ */}
        <div>
          <label className="label">
            วางลิงก์ Shopee / TikTok Shop (ไม่บังคับ) — กด “ดึงข้อมูล”
          </label>
          <div className="flex gap-2">
            <input
              className="input"
              value={form.source_url}
              onChange={(e) => setForm({ ...form, source_url: e.target.value })}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (text) {
                  setForm((f) => ({ ...f, source_url: text }));
                }
              }}
              placeholder="เช่น https://shopee.co.th/... หรือ https://vt.tiktok.com/..."
            />
            <button
              className="btn-primary whitespace-nowrap"
              onClick={fetchFromLink}
              disabled={fetching || !form.source_url.trim()}
            >
              {fetching ? "กำลังดึง…" : "🔎 ดึงข้อมูล"}
            </button>
          </div>
          {hint && <p className="mt-1 text-xs text-brand-dark">{hint}</p>}
        </div>

        {/* ชื่อ + ราคา */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <label className="label">ชื่ออุปกรณ์</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="เช่น เตาอบ, เครื่องตีแป้ง"
            />
          </div>
          <div>
            <label className="label">ราคา</label>
            <input
              className="input"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={add}>
              ＋ เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* สรุปยอดรวม */}
      {rows.length > 0 && (
        <div className="card flex items-center justify-between p-4">
          <span className="text-sm text-cocoa-soft">รวมค่าอุปกรณ์ทั้งหมด</span>
          <span className="text-xl font-bold text-brand-dark">{baht(total)}</span>
        </div>
      )}

      {/* ตาราง */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-50/60 text-left text-xs text-cocoa-soft">
            <tr>
              <th className="px-4 py-2">อุปกรณ์</th>
              <th className="px-4 py-2 text-right">ราคา</th>
              <th className="px-4 py-2">ลิงก์</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-cocoa-soft/70">
                  กำลังโหลด…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-cocoa-soft/70">
                  ยังไม่มีอุปกรณ์ — วางลิงก์หรือกรอกเองด้านบน
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-pink-50">
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-2 py-2 text-right">
                    <EditNum value={r.price} onSave={(v) => update(r, { price: v })} />
                  </td>
                  <td className="px-4 py-2">
                    {r.source_url ? (
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-dark underline hover:text-brand"
                      >
                        เปิดลิงก์ ↗
                      </a>
                    ) : (
                      <span className="text-xs text-cocoa-soft/60">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      className="text-xs text-red-400 hover:text-red-600"
                      onClick={() => del(r)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-cocoa-soft/70">
        💡 วางลิงก์ Shopee/TikTok แล้วกด “ดึงข้อมูล” ระบบจะพยายามเติมชื่อ/ราคาให้ ·
        ถ้าเว็บกันบอตหรือราคาโหลดด้วย JS อาจต้องกรอกเอง
      </p>
    </div>
  );
}

/* ตัวเลขคลิกแก้ไขได้ */
function EditNum({
  value,
  onSave,
}: {
  value: number;
  onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(String(value));
  if (!editing)
    return (
      <button
        className="rounded px-2 py-1 hover:bg-pink-50"
        onClick={() => {
          setV(String(value));
          setEditing(true);
        }}
      >
        {baht(value)}
      </button>
    );
  return (
    <input
      autoFocus
      type="number"
      className="w-24 rounded-lg border border-brand px-2 py-1 text-right"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (Number(v) !== value) onSave(Number(v) || 0);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}
