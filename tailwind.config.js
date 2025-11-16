/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins-Regular', 'sans-serif'],
        medium: ['Poppins-Medium', 'sans-serif'],
        semibold: ['Poppins-SemiBold', 'sans-serif'],
        bold: ['Poppins-Bold', 'sans-serif'],
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUpBounce: {
          '0%': { opacity: 0, transform: 'translateY(100%) translateX(-50%)' },
          '70%': { opacity: 1, transform: 'translateY(-10%) translateX(-50%)' },
          '100%': { opacity: 1, transform: 'translateY(0) translateX(-50%)' },
        }
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        fadeInUp: 'fadeInUp 0.3s ease-out',
        slideUpBounce: 'slideUpBounce 0.5s ease-out',
      },
      colors: {
        primary: '#2563eb',
      },
    },
  },
  plugins: [],
}