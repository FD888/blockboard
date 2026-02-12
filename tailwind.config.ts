import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // SPbGU Brand Colors (source: pr.spbu.ru)
        spbgu: {
          red: "#9F2D20",
          "red-bright": "#CA0610",
          teal: "#93CFBD",
          "teal-muted": "#A7C5BD",
          gray: "#A8ADB4",
          "gray-dark": "#76767C",
          "gray-light": "#BDBDBD",
        },
        // Dark theme semantic colors
        background: "#0a0e1a",
        surface: {
          DEFAULT: "#111827",
          light: "#1a1f36",
        },
        border: "#1e293b",
        primary: {
          DEFAULT: "#CA0610",
          dark: "#9F2D20",
          light: "#e53e3e",
        },
        secondary: {
          DEFAULT: "#93CFBD",
          muted: "#A7C5BD",
          dark: "#6ba897",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      fontSize: {
        "fluid-xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
        "fluid-sm": "clamp(0.875rem, 0.8rem + 0.375vw, 1rem)",
        "fluid-base": "clamp(1rem, 0.925rem + 0.375vw, 1.125rem)",
        "fluid-lg": "clamp(1.125rem, 1rem + 0.625vw, 1.375rem)",
        "fluid-xl": "clamp(1.25rem, 1.1rem + 0.75vw, 1.625rem)",
        "fluid-2xl": "clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)",
        "fluid-3xl": "clamp(1.875rem, 1.5rem + 1.875vw, 3rem)",
        "fluid-4xl": "clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem)",
      },
      borderColor: {
        DEFAULT: "#1e293b",
      },
      boxShadow: {
        glow: "0 0 20px rgba(147, 207, 189, 0.15)",
        "glow-red": "0 0 20px rgba(202, 6, 16, 0.15)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-dark": "linear-gradient(to bottom, #0a0e1a, #111827)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
