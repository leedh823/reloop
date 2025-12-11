/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'reloop-blue': '#359DFE',
        'reloop-gold': '#9F9366',
        'reloop-silver': '#ACACAC',
      },
    },
  },
  plugins: [],
}




