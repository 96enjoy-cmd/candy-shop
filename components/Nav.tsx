"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "แดชบอร์ด / ออเดอร์", icon: "🧁" },
  { href: "/costs", label: "ต้นทุน / วัตถุดิบ", icon: "🍞" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-pink-100 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-light text-lg shadow-cozy ring-1 ring-pink-200">
            🐱
          </span>
          <div className="leading-none">
            <div className="font-display text-lg font-extrabold tracking-wide text-cocoa">
              DNN
            </div>
            <div className="hidden text-[10px] font-medium text-cocoa-soft sm:block">
              ร้านขนม &amp; เบเกอรี่
            </div>
          </div>
        </Link>
        <nav className="ml-auto flex gap-1">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-brand text-white shadow-cozy"
                    : "text-cocoa-soft hover:bg-pink-50"
                }`}
              >
                <span className="mr-1">{l.icon}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
