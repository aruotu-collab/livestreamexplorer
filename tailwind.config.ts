import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080b",
          900: "#0c0e13",
          800: "#13161d",
          700: "#1b1f29",
          600: "#252a36",
        },
        paper: {
          50: "#f6f1e7",
          100: "#ebe3d4",
          200: "#d8cdb8",
        },
        live: "#ff3355",
        gold: "#e2b13c",
        teal: "#2fd4c5",
        signal: "#7c9cff",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(226, 177, 60, 0.12)",
        live: "0 0 24px rgba(255, 51, 85, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
