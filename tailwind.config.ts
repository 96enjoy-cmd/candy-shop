import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#e0568a",
          dark: "#c23a6e",
          light: "#fbe4ee",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
