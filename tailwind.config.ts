import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F5F0',
        surface: '#FFFFFF',
        'surface-alt': '#FAF8F3',
        border: '#E7E3D9',
        'border-strong': '#D6D1C3',
        text: '#1A1A1F',
        'text-muted': '#6B6960',
        'text-faint': '#9C998E',
        accent: '#C2410C',
        today: '#DC2626',
        'weekend-tint': '#F2EFE7',
        
        // Project colors
        p1: '#B4633E',
        'p1-soft': '#E8D4C7',
        p2: '#4A6B82',
        'p2-soft': '#D2DCE3',
        p3: '#5C7252',
        'p3-soft': '#D8E0D2',
        p4: '#A88A3C',
        'p4-soft': '#E8DEC2',
        p5: '#7A5C7B',
        'p5-soft': '#DDD2DE',
        
        // Status colors
        'st-done': '#16A34A',
        'st-done-soft': '#DCFCE7',
        'st-progress': '#D97706',
        'st-progress-soft': '#FEF3C7',
        'st-planned': '#94A3B8',
        'st-planned-soft': '#F1F5F9',
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
