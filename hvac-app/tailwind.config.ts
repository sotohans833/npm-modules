import type { Config } from "tailwindcss";

/**
 * Brand palette taken from the All Weather Heating & Cooling logo:
 * a warm orange (heating) paired with a cool blue (cooling).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        heat: {
          50: "#FFF5EC",
          100: "#FFE7D1",
          200: "#FFCBA3",
          300: "#FFAA6B",
          400: "#FB8B37",
          500: "#F5811F",
          600: "#DB6810",
          700: "#B14F0D",
          800: "#8A3E10",
          900: "#6E3311",
        },
        cool: {
          50: "#ECF6FD",
          100: "#D2EAFA",
          200: "#A6D5F5",
          300: "#6FB9EC",
          400: "#3B98DC",
          500: "#1E7AC0",
          600: "#155F9B",
          700: "#124C7C",
          800: "#123F65",
          900: "#0B2942",
        },
        ink: {
          DEFAULT: "#0B1B2B",
          soft: "#3D4E5E",
          faint: "#6B7C8C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,27,43,.06), 0 8px 24px -12px rgba(11,27,43,.18)",
        lift: "0 2px 4px rgba(11,27,43,.06), 0 18px 40px -18px rgba(11,27,43,.30)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
