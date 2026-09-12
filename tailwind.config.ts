import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0E14",
        surface: {
          DEFAULT: "#121722",
          hover: "#182030",
          elevated: "#1D263B",
          border: "#232F47",
        },
        primary: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          light: "#818CF8",
        },
        accent: {
          purple: "#A855F7",
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.3)",
        "glow-lg": "0 0 40px -10px rgba(99, 102, 241, 0.4)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.3)",
        "glow-purple": "0 0 25px -5px rgba(168, 85, 247, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
