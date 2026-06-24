/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#1e293b', // slate-800
        primary: {
          DEFAULT: '#0f172a', // slate-900
          foreground: '#f8fafc',
        },
        secondary: {
          DEFAULT: '#f1f5f9', // slate-100
          foreground: '#0f172a',
        },
        accent: {
          DEFAULT: '#e0f2fe', // sky-100
          foreground: '#0369a1', // sky-700
        },
        muted: {
          DEFAULT: '#f8fafc',
          foreground: '#64748b',
        },
        border: '#e2e8f0', // slate-200
        beige: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 40px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
