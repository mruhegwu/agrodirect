/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agro: {
          50: '#F2F8F5',
          100: '#E1F0E8',
          200: '#C2E0D1',
          300: '#94C7B0',
          400: '#5FA88A',
          500: '#2D6A4F', // Primary agricultural green
          600: '#23553F',
          700: '#1B4332', // Deep forest green
          800: '#153427',
          900: '#0E241B',
        },
        harvest: {
          50: '#FDF7F5',
          100: '#FAECE7',
          200: '#F4D4CA',
          300: '#EBB4A5',
          400: '#E76F51', // Warm orange / terracotta accent
          500: '#D65332',
          600: '#B83F20',
          700: '#933118',
          800: '#752A17',
          900: '#602516',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAF8F5', // Warm off-white
          200: '#F4EFEA',
          300: '#EDE4DC',
          400: '#E2D5C8',
          500: '#D5C4B4',
        },
        charcoal: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#2D3436', // Dark text
          900: '#212529',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(45, 106, 79, 0.08)',
        'card-hover': '0 12px 30px -4px rgba(45, 106, 79, 0.16)',
        'modal': '0 25px 50px -12px rgba(27, 67, 50, 0.25)',
      }
    },
  },
  plugins: [],
}
