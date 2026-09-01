"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "แดชบอร์ด / ออเดอร์", icon: "📊" },
  { href: "/costs", label: "ต้นทุน / วัตถุดิบ", icon: "🧾" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-pink-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2 font-bold text-brand-dark">
          <span className="text-2xl">🍬</span>
          <span className="hidden sm:inline">ร้านขนม</span>
        </div>
        <nav className="flex gap-1">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand text-white"
                    : "text-gray-600 hover:bg-pink-50"
                }`}
              >
                <span className="mr-1">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
