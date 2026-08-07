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
        // Was rgba(24,45,39,0.08) — a dark, near-black shadow at 8% opacity
        // sitting on top of an already-dark page background (#0a1220) is
        // essentially invisible; shadows read as depth by being *lighter*
        // than their surroundings, not darker-on-dark. That left each route
        // card's separation from its neighbors resting almost entirely on a
        // 12px gap + a 1px border only one shade lighter than the card
        // itself, which reads as "barely separated" rather than clearly
        // distinct boxes, especially scrolled past quickly on a phone.
        // Pure black at higher opacity/spread actually shows up as a real
        // dark halo against the page background instead of blending in.
        soft: "0 18px 36px rgba(0,0,0,0.45)",
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
