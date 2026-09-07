/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },

      colors: {
        accent: {
          violet: '#8B5CF6', // electric violet
          cyan: '#06B6D4',   // cyan
          lime: '#84CC16',   // lime green
        },
        dark: {
          bg: '#0A0A0F',     // near-black background
          surface: '#1A1A24', // elevated surface
          border: '#2A2A3A',  // subtle borders
        }
      },

      animation: {
        marquee: "marquee 15s linear infinite",
        blink: "blink 1s step-end infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        'fade-up': 'fadeUp 0.6s ease-out',
      },

      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      borderRadius: {
        'tech': '6px',
        'tech-lg': '10px',
      },

    },
  },
  plugins: [],
}
