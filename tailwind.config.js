/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4f46e5',
          light: '#6366f1',
        },
        surface: {
          0: '#ffffff',
          1: '#f3f4f6',
          2: '#e5e7eb',
        },
        text: {
          primary: '#111827',
          secondary: '#4b5563',
        },
        accent: '#10b981',
        danger: '#ef4444',
        dark: {
          surface: {
            0: '#1a1b1e',
            1: '#2c2e33',
            2: '#3d4046',
          },
          text: {
            primary: '#e5e7eb',
            secondary: '#9ca3af',
          }
        }
      },
    },
  },
  plugins: [],
} 