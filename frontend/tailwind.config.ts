import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        shell: "var(--bg-shell)",
        primary: {
          DEFAULT: "var(--primary)",
          deep: "var(--primary-deep)",
        },
        muted: "var(--text-muted)",
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-bg)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-bg)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(31,42,77,0.08)",
      },
      borderRadius: {
        'card': '24px',
        'tile': '16px',
        'pill': '999px',
      }
    },
  },
  plugins: [],
};
export default config;
