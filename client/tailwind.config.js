/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#090A0F',
          900: '#0F1117',
          850: '#13161F',
          800: '#1A1E29',
          750: '#212634',
          700: '#2A3042',
          600: '#3B435C',
          500: '#525D7E',
        },
        lime: {
          300: '#EAFF66',
          400: '#D9FF1A',
          500: '#CCFF00', // Electric Lime Primary
          600: '#B0DC00',
          700: '#8FB300',
        },
        brand: {
          DEFAULT: '#CCFF00',
          hover: '#D9FF1A',
          dark: '#0F1117',
          card: '#1A1E29',
          border: '#2A3042',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'lime-glow': '0 0 25px -5px rgba(204, 255, 0, 0.35)',
        'lime-glow-sm': '0 0 15px -3px rgba(204, 255, 0, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
