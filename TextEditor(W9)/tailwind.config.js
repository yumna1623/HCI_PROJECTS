// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        'neon-cyan':   '#00f5ff',
        'neon-purple': '#bf5fff',
        'neon-pink':   '#ff2d78',
        'neon-green':  '#00ff9d',
        'neon-orange': '#ff9500',
        'surface':     '#0b0f1e',
        'surface2':    '#111829',
        'surface3':    '#161f35',
        'border-dim':  '#1e2a45',
        'border2':     '#263452',
        'dim':         '#4a5e80',
      },
    },
  },
  plugins: [],
}