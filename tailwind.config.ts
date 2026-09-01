import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // โทนหลัก: คาราเมล/น้ำผึ้ง จากโลโก้ DNN
        brand: {
          DEFAULT: "#d98a3d", // น้ำผึ้งคาราเมล (ปุ่มหลัก)
          dark: "#a85f22", // น้ำตาลเข้ม (หัวข้อ/hover)
          light: "#fdf1de", // ครีมอ่อน
        },
        // สีน้ำตาลตัวอักษรแบบโลโก้
        cocoa: {
          DEFAULT: "#5b3d2e",
          soft: "#8a6650",
        },
        // แมวส้ม / accent อุ่น
        caramel: "#f0912f",
        // ชมพูพาสเทล (แก้ม/ดอกไม้)
        blush: "#f4b8c4",
        cream: "#fdf8f0",
        // remap ชุด pink เดิม → โทนครีม/น้ำตาลอุ่น เพื่อให้คลาสเดิมทั้งแอปกลมกลืน
        pink: {
          50: "#fdf6ea",
          100: "#f7e7cf",
          200: "#eed3ac",
          300: "#e4bd86",
          400: "#d99f57",
          500: "#cf8434",
          600: "#b9701f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        cozy: "0 6px 20px -8px rgba(168, 95, 34, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
