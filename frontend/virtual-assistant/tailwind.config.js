/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        pulsate: {
          '0%, 100%': { transform: 'scaleY(0.2)' },
          '50%': { transform: 'scaleY(1)' },
        },
        vibrate: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '50%': { transform: 'translateX(2px)' },
          '75%': { transform: 'translateX(-2px)' },
        },
      },
      animation: {
        pulsate1: 'pulsate 1s ease-in-out infinite',
        pulsate2: 'pulsate 1s ease-in-out 1s infinite 0.15s',
        pulsate3: 'pulsate 1s ease-in-out 1s infinite 0.3s',
        pulsate4: 'pulsate 1s ease-in-out 1s infinite 0.45s',
        pulsate5: 'pulsate 1s ease-in-out 1s infinite 0.6s',
        vibrate: 'vibrate 0.2s linear infinite',
      },
    },
  },
  plugins: [],
};
