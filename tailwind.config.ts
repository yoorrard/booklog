import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif"
        ]
      },
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef1",
          200: "#d8d8de",
          300: "#b8b8c2",
          400: "#8a8a95",
          500: "#636370",
          600: "#474751",
          700: "#2f2f38",
          800: "#1d1d24",
          900: "#0f0f14"
        },
        brand: {
          50: "#eef5ff",
          100: "#dbe9ff",
          200: "#b7d2ff",
          300: "#88b2ff",
          400: "#5a8dff",
          500: "#3b6bfa",
          600: "#2a4fe3",
          700: "#243eba",
          800: "#223693",
          900: "#1f2f72"
        },
        accent: {
          50: "#fdf5ff",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce"
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,20,40,0.04), 0 6px 24px -8px rgba(20,20,40,0.10)",
        pop: "0 10px 40px -10px rgba(59,107,250,0.35)"
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
