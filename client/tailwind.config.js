export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Times New Roman', 'serif'],
        sans:    ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        applied:   '#60a5fa',
        screening: '#f59e0b',
        interview: '#ec4899',
        offer:     '#34d399',
        rejected:  '#f87171',
        withdrawn: '#94a3b8',
      },
    },
  },
  plugins: [],
}