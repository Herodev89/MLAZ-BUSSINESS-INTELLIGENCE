/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* ── MLAZ Brand System ── */
        brand: {
          DEFAULT: "#3D1F0E",    // Deep chocolate brown
          light:   "#6B3A1F",    // Medium brown
          lighter: "#9C5A35",    // Warm chestnut
        },
        accent: {
          DEFAULT: "#B8860B",    // Dark goldenrod
          light:   "#D4A017",    // Bright gold
          pale:    "#F0D070",    // Soft gold tint
        },
        surface: {
          DEFAULT: "#FAF7F2",    // Warm off-white (main bg)
          card:    "#FFFFFF",    // Cards
          warm:    "#F5EFE6",    // Sand / secondary bg
          muted:   "#EDE6DC",    // Slightly deeper sand
        },
        sidebar: {
          DEFAULT: "#2A1208",    // Very dark espresso
          hover:   "#3D1F0E",    // Brand brown
          active:  "#4A2510",    // Active item bg
          border:  "#4D2B14",    // Sidebar dividers
          text:    "#C4A882",    // Sidebar muted text
          icon:    "#8B6A4A",    // Sidebar icons (inactive)
        },
        muted: {
          DEFAULT: "#6B5744",    // Brown-gray text
          light:   "#9B7E68",    // Lighter muted text
        },
        border: {
          DEFAULT: "#E8DDD0",    // Main border
          dark:    "#C4A882",    // Stronger border
        },
        success: {
          DEFAULT: "#2D6A4F",
          light:   "#D4EDDA",
          dark:    "#1A4030",
        },
        warning: {
          DEFAULT: "#C77B00",
          light:   "#FFF3CD",
          dark:    "#7D4E00",
        },
        error: {
          DEFAULT: "#9B2335",
          light:   "#F8D7DA",
          dark:    "#5C1520",
        },
        info: {
          DEFAULT: "#1E5F8A",
          light:   "#D1ECF1",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card:   "0 1px 3px 0 rgb(61 31 14 / 0.06), 0 1px 2px -1px rgb(61 31 14 / 0.06)",
        "card-md": "0 4px 6px -1px rgb(61 31 14 / 0.08), 0 2px 4px -2px rgb(61 31 14 / 0.05)",
        "card-lg": "0 10px 15px -3px rgb(61 31 14 / 0.08), 0 4px 6px -4px rgb(61 31 14 / 0.05)",
        sidebar: "2px 0 8px 0 rgb(0 0 0 / 0.15)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.3s ease-out",
        "slide-in-left":  "slide-in-left 0.25s ease-out",
        shimmer:          "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};
