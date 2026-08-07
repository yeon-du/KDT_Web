import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#eaf1f4",
        forest: "#070c17",
        forest2: "#0d1728",
        green: "#17b98e",
        mint: "#0e2a3a",
        cream: "#0a1220",
        paper: "#101b2e",
        coral: "#2af5c3",
        coral2: "#8ff5e0",
        line: "#1e2c42",
        muted: "#8291a6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Apple SD Gothic Neo", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 18px 40px rgba(0,0,0,0.14)",
        soft: "0 15px 30px rgba(24,45,39,0.08)",
        panel: "0 22px 50px rgba(0,0,0,0.13)",
      },
      borderRadius: {
        xl2: "24px",
      },
      keyframes: {
        livePulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        raceMove: {
          "0%": { transform: "translateX(0)" },
        },
      },
      animation: {
        livePulse: "livePulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
