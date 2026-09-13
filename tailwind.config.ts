import type { Config } from "tailwindcss";

/**
 * Palette « salle obscure » : noirs chauds, un seul accent doré (la lumière du
 * projecteur) et un vert sauge réservé aux états positifs. Aucun dégradé
 * multicolore, aucune couleur décorative en plus.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0C0C0E",
        ink: {
          500: "#22222A",
          600: "#1B1B21",
          700: "#15151A",
          800: "#111114",
          900: "#0C0C0E",
          950: "#08080A",
          DEFAULT: "#0C0C0E",
        },
        line: "#2A2A31",
        mist: {
          50: "#FAF8F4",
          100: "#F5F2EC",
          200: "#E6E2DA",
          300: "#C9C4BA",
          400: "#9E988E",
          500: "#7B756B",
          600: "#575249",
          700: "#403C35",
          800: "#2C2925",
          900: "#1D1B18",
          950: "#121110",
        },
        gold: {
          50: "#FDF8EC",
          100: "#FAF0D8",
          200: "#F5E3B4",
          300: "#EFCE86",
          400: "#E0B357",
          500: "#C9972F",
          600: "#A2761F",
          700: "#7C5A18",
          800: "#574011",
          900: "#3A2B0D",
          950: "#221908",
        },
        sage: {
          50: "#F0F6F2",
          100: "#DCEAE3",
          200: "#BCD6C9",
          300: "#A5C9B8",
          400: "#82AF9C",
          500: "#5F8C7A",
          600: "#47695C",
          700: "#345043",
          800: "#24382F",
          900: "#17251F",
          950: "#0D1613",
        },
        surface: {
          DEFAULT: "#15151A",
          hover: "#1E1E25",
          elevated: "#1B1B21",
          border: "#2A2A31",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        // Anciens noms conservés pour ne rien casser : rendus volontairement sobres.
        glow: "0 1px 0 0 rgba(255,255,255,0.03), 0 12px 32px -24px rgba(0,0,0,0.9)",
        "glow-lg": "0 1px 0 0 rgba(255,255,255,0.04), 0 24px 60px -32px rgba(0,0,0,0.95)",
        "glow-cyan": "0 1px 0 0 rgba(255,255,255,0.03), 0 12px 32px -24px rgba(0,0,0,0.9)",
        "glow-purple": "0 1px 0 0 rgba(255,255,255,0.03), 0 12px 32px -24px rgba(0,0,0,0.9)",
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 50px -40px rgba(0,0,0,1)",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
