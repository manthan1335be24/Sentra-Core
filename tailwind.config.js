/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sentra-accent': 'var(--sentra-accent)',
        'sentra-bg': 'var(--sentra-bg)',
        'sentra-glass': 'var(--sentra-glass)',
      },
      boxShadow: {
        'glow': '0 0 15px -3px var(--sentra-accent)',
        'cyber': '0 0 30px -5px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.05)',
      },
      letterSpacing: {
        'ultra-widest': '.25em',
      }
    },
  },
  plugins: [],
}