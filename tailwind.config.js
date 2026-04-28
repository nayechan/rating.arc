/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        platinum: '#00B8D4',
        diamond: '#1E90FF',
        ruby: '#FF0000',
      },
    },
  },
  plugins: [],
}
