import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{mdx,md}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f6f3",
          100: "#eeece5",
          200: "#d9d4c6",
          300: "#b9b0a0",
          400: "#8a8170",
          500: "#5a5346",
          600: "#3d372d",
          700: "#2a261f",
          800: "#1a1813",
          900: "#0f0e0a"
        },
        sand: {
          50: "#fbf8f1",
          100: "#f3ecdc",
          200: "#e6d6b3",
          300: "#d4ba85",
          400: "#bf9b5c",
          500: "#a07f43"
        },
        // Brand accent — burnt terracotta. Kept under the `electric` key so
        // existing class names continue to work; only the hex values changed.
        electric: {
          50: "#fbf1eb",
          100: "#f5dccc",
          200: "#ebb89a",
          300: "#dd8e63",
          400: "#cf6d3d",
          500: "#c2562b",
          600: "#9f4520",
          700: "#7c351a",
          800: "#582414"
        }
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: [
          "'Inter'",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,14,10,0.04), 0 8px 24px rgba(15,14,10,0.06)",
        pop: "0 8px 32px rgba(15,14,10,0.10), 0 2px 8px rgba(15,14,10,0.06)"
      },
      backgroundImage: {
        "hero-grad":
          "radial-gradient(80% 60% at 20% 10%, rgba(194,86,43,0.16) 0%, rgba(194,86,43,0) 60%), radial-gradient(70% 50% at 90% 0%, rgba(212,186,133,0.30) 0%, rgba(212,186,133,0) 60%)",
        "sand-grad":
          "linear-gradient(180deg, #fbf8f1 0%, #f3ecdc 100%)"
      }
    }
  },
  plugins: []
};

export default config;
