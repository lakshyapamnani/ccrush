import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hinge-style light brand colors
        brand: {
          dark: "#ffffff",
          deep: "#f9fafb",
          pink: "#8b5cf6",
          pinkLight: "#a78bfa",
          accent: "#8b5cf6",
          mutedText: "#6b7280",
          cardBg: "#ffffff",
          success: "#10b981",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)",
        "gradient-pink":
          "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
        "gradient-button":
          "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
      },
      boxShadow: {
        glow: "0 4px 14px 0 rgba(139, 92, 246, 0.39)",
        "glow-lg": "0 6px 20px rgba(139, 92, 246, 0.4)",
        "glow-sm": "0 2px 4px rgba(0,0,0,0.06)",
        "card": "0 4px 12px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        "2xl": "1.5rem",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "match-pop": "match-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 4px 14px 0 rgba(139, 92, 246, 0.39)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 6px 20px rgba(139, 92, 246, 0.6)",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "match-pop": {
          "0%": {
            opacity: "0",
            transform: "scale(0.3)",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
      },
    },
  },
  plugins: [],
};

export default config;
