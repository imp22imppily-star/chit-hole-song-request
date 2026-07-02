import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        accNavy: "#050B1F",
        accBlue: "#008CFF",
        accCyan: "#38DFFF",
        accDark: "#020617",
        accWhite: "#F8FAFC"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(56, 223, 255, 0.28)",
        card: "0 24px 80px rgba(0, 140, 255, 0.16)"
      },
      backgroundImage: {
        "grid-glow":
          "linear-gradient(rgba(56,223,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,223,255,.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
