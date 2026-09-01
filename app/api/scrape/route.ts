import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ดึงชื่อ + ราคา แบบ best-effort จากลิงก์สินค้า (Shopee / TikTok Shop ฯลฯ)
 * หมายเหตุ: Shopee/TikTok มีระบบกันบอตและโหลดราคาด้วย JS บางลิงก์อาจดึงราคาไม่ได้
 * ในกรณีนั้นจะส่งชื่อกลับเท่าที่ได้ แล้วให้ผู้ใช้กรอกราคาเอง
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "ไม่มีลิงก์" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return NextResponse.json({ error: "ลิงก์ไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const res = await fetch(url.toString(), {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "th,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      // กันค้างนานเกินไป
      signal: AbortSignal.timeout(12000),
    });

    const finalUrl = res.url || url.toString();
    const html = await res.text();

    const name = extractName(html);
    const price = extractPrice(html);

    return NextResponse.json({
      name,
      price,
      source_url: finalUrl,
      ok: Boolean(name || price),
      note:
        price == null
          ? "ดึงราคาอัตโนมัติไม่ได้ (เว็บกันบอต/โหลดด้วย JS) — กรอกราคาเองได้เลย"
          : null,
    });
  } catch {
    return NextResponse.json(
      {
        name: null,
        price: null,
        source_url: url.toString(),
        ok: false,
        note: "เข้าถึงลิงก์ไม่ได้ — กรอกชื่อ/ราคาเองได้เลย",
      },
      { status: 200 }
    );
  }
}

function meta(html: string, prop: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decode(m[1].trim());
  }
  return null;
}

function extractName(html: string): string | null {
  const ogt = meta(html, "og:title");
  if (ogt) return clean(ogt);
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  if (t) return clean(decode(t.trim()));
  return null;
}

function extractPrice(html: string): number | null {
  // 1) OpenGraph / product meta
  for (const p of ["product:price:amount", "og:price:amount", "price"]) {
    const v = meta(html, p);
    const n = toNumber(v);
    if (n != null) return n;
  }
  // 2) JSON-LD / inline json  "price":"123.00"
  const jsonPrice = html.match(/"price"\s*:\s*"?([\d.,]+)"?/i)?.[1];
  const jn = toNumber(jsonPrice);
  if (jn != null && jn > 0 && jn < 10_000_000) return jn;

  // 3) fallback: ตัวเลขที่มีสัญลักษณ์บาท ฿ หรือคำว่า บาท
  const bahtMatch =
    html.match(/฿\s*([\d.,]+)/) || html.match(/([\d.,]+)\s*บาท/);
  const bn = toNumber(bahtMatch?.[1]);
  if (bn != null && bn > 0) return bn;

  return null;
}

function toNumber(s: string | null | undefined): number | null {
  if (!s) return null;
  const n = Number(String(s).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function clean(s: string): string {
  // ตัดหางชื่อร้าน/แพลตฟอร์มออก เช่น " | Shopee Thailand"
  return s
    .replace(/\s*[|\-–]\s*(Shopee|TikTok|Lazada)[^|]*$/i, "")
    .replace(/ราคาพิเศษ|ราคาถูก/gi, "")
    .trim()
    .slice(0, 120);
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}
