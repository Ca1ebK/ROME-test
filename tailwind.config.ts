import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ROME Warehouse Color Palette
        // High-contrast for visibility in warehouse environments
        warehouse: {
          black: "#0A0A0A",
          white: "#FAFAFA",
          orange: "#FF6B00",        // Safety orange - primary action
          "orange-dark": "#CC5500", // Hover state
          "orange-light": "#FF8533", // Light variant
          gray: {
            100: "#F5F5F5",
            200: "#E5E5E5",
            300: "#D4D4D4",
            400: "#A3A3A3",
            500: "#737373",
            600: "#525252",
            700: "#404040",
            800: "#262626",
            900: "#171717",
          },
          success: "#22C55E",  // Green for success states
          error: "#EF4444",    // Red for errors
          warning: "#F59E0B",  // Amber for warnings
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Large sizes for kiosk visibility
        "kiosk-sm": ["1.25rem", { lineHeight: "1.75rem" }],
        "kiosk-base": ["1.5rem", { lineHeight: "2rem" }],
        "kiosk-lg": ["2rem", { lineHeight: "2.5rem" }],
        "kiosk-xl": ["3rem", { lineHeight: "3.5rem" }],
        "kiosk-2xl": ["4rem", { lineHeight: "4.5rem" }],
        "kiosk-pin": ["5rem", { lineHeight: "5.5rem" }],
      },
      spacing: {
        "kiosk": "1.5rem",
        "kiosk-lg": "2rem",
        "kiosk-xl": "3rem",
      },
      borderRadius: {
        "kiosk": "1rem",
      },
      boxShadow: {
        "kiosk": "0 4px 20px rgba(0, 0, 0, 0.25)",
        "kiosk-pressed": "inset 0 4px 10px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounce 1s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
