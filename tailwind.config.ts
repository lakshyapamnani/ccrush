import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // College Crush brand colors
        brand: {
          dark: "#2B0F1E",
          deep: "#3E0F2C",
          pink: "#FF3C8E",
          pinkLight: "#FF007A",
          accent: "#FF1493",
          mutedText: "#A0A0A0",
          cardBg: "#1a0f16",
          success: "#10b981",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #2B0F1E 0%, #3E0F2C 100%)",
        "gradient-pink":
          "linear-gradient(135deg, #FF3C8E 0%, #FF007A 100%)",
        "gradient-button":
          "linear-gradient(135deg, #FF3C8E 0%, #FF007A 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 60, 142, 0.4)",
        "glow-lg": "0 0 40px rgba(255, 60, 142, 0.6)",
        "glow-sm": "0 0 10px rgba(255, 60, 142, 0.3)",
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
            boxShadow: "0 0 20px rgba(255, 60, 142, 0.4)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 40px rgba(255, 60, 142, 0.8)",
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
