/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      'colors': {
        'invisible': 'transparent',
        'primary': '#fffff4'
      }
    }
  },

  plugins: []
} satisfies Config
