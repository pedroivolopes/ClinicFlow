import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design System ClinicFlow
        navy:  '#22223B',
        cyan:  '#00FFFF',
        cloud: '#F8F9FA',
        muted: '#4A4E69',
        danger:'#E63946',
        border:'#E9ECEF',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0,0,0,0.05)',
        cyan: '0 0 12px rgba(0,255,255,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
