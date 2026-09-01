"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { baht, Ingredient, Product } from "@/lib/types";
import ConfigNotice from "@/components/ConfigNotice";

export default function CostsPage() {
  const [tab, setTab] = useState<"products" | "ingredients">("products");

  if (!isSupabaseConfigured) return <ConfigNotice />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">ต้นทุน / วัตถุดิบ</h1>

      <div className="flex gap-1 rounded-xl bg-pink-50 p-1 text-sm">
        <button
          className={`flex-1 rounded-lg py-2 font-medium ${
            tab === "products" ? "bg-white shadow text-brand-dark" : "text-cocoa-soft"
          }`}
          onClick={() => setTab("products")}
        >
          🍰 สินค้า / เมนู
        </button>
        <button
          className={`flex-1 rounded-lg py-2 font-medium ${
            tab === "ingredients"
              ? "bg-white shadow text-brand-dark"
              : "text-cocoa-soft"
          }`}
          onClick={() => setTab("ingredients")}
        >
          🥣 วัตถุดิบ
        </button>
      </div>

      {tab === "products" ? <ProductsTab /> : <IngredientsTab />}
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
