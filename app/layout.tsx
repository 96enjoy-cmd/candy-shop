import type { Metadata } from "next";
import { Mali } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const display = Mali({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "DNN | ร้านขนม & เบเกอรี่",
  description: "จัดการออเดอร์ ยอดขาย และต้นทุนร้านขนม DNN",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={display.variable}>
      <body className="font-display">
        <div className="min-h-screen">
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-center text-xs text-cocoa-soft/70">
            🧁 DNN · ทำด้วยความรักและแมวเหมียว 🐱
          </footer>
        </div>
      </body>
    </html>
  );
}
