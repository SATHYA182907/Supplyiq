/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#FFFCF8',
        },
        beige: {
          50: '#FFFCF8',
          100: '#F9F3EA',
          200: '#F5EDE2',
          300: '#EFE3D3',
          400: '#E4D3BD',
          500: '#D2B48C',
          600: '#B58A5A',
          700: '#946C41',
          800: '#73512E',
          900: '#4A331A',
        },
        primary: {
          DEFAULT: '#B58A5A',
          hover: '#9E7445',
          light: '#F5EDE2',
          text: '#29251F',
        },
        accent: {
          DEFAULT: '#D2B48C',
          light: '#F9F3EA',
        },
        ink: {
          primary: '#29251F',
          secondary: '#77716A',
          muted: '#A59F96',
        },
        border: {
          DEFAULT: '#EAE3D9',
          subtle: '#F3EFE9',
          active: '#D2B48C',
        },
        status: {
          success: '#348568',
          'success-bg': '#EDF7F3',
          warning: '#D69A43',
          'warning-bg': '#FDF8ED',
          error: '#D96C62',
          'error-bg': '#FDF2F1',
          info: '#6689A7',
          'info-bg': '#F0F5FA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'beige-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #F8F1E8 50%, #EFE3D3 100%)',
        'beige-subtle': 'linear-gradient(135deg, #FFFFFF 0%, #FAF5EE 100%)',
        'beige-card': 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF8 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #B58A5A 0%, #D2B48C 50%, #B58A5A 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(41, 37, 31, 0.05), 0 1px 4px -1px rgba(41, 37, 31, 0.03)',
        'card': '0 4px 16px -4px rgba(41, 37, 31, 0.06), 0 2px 6px -2px rgba(41, 37, 31, 0.03)',
        'dropdown': '0 10px 25px -5px rgba(41, 37, 31, 0.08), 0 8px 10px -6px rgba(41, 37, 31, 0.04)',
      }
    },
  },
  plugins: [],
}
