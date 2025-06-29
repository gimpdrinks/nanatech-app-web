/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary backgrounds
        'primary-bg': '#FFFFFF',
        'secondary-bg': '#F8F9FA', 
        'tertiary-bg': '#E9ECEF',
        
        // Primary borders and dividers
        'primary-border': '#DEE2E6',
        'secondary-border': '#CED4DA',
        
        // Text colors
        'primary-text': '#212529',
        'secondary-text': '#6C757D',
        'tertiary-text': '#ADB5BD',
        
        // Accent colors (same for both themes)
        accent: {
          pink: '#FF8A9B',
          green: '#7DB3A0',
          blue: '#6C8FEF',
          yellow: '#FFD93D',
          red: '#FF6B6B',
          purple: '#9C88FF',
        },
        
        // Dark mode overrides
        dark: {
          'primary-bg': '#121212',
          'secondary-bg': '#2A2A2A',
          'tertiary-bg': '#404040',
          'primary-border': '#404040',
          'secondary-border': '#555555',
          'primary-text': '#FFFFFF',
          'secondary-text': '#B0B0B0',
          'tertiary-text': '#808080',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        breathe: 'breathe 2.5s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '1'
          },
          '50%': { 
            transform: 'scale(1.05)',
            opacity: '0.9'
          },
        },
        bounceGentle: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
          },
          '50%': { 
            transform: 'translateY(-8px) scale(1.02)',
          },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 138, 155, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(255, 138, 155, 0.6), 0 0 80px rgba(255, 138, 155, 0.2)',
          },
        },
      },
    },
  },
  plugins: [],
};