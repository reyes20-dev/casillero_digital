/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}', // Archivos de Astro y React
    './node_modules/flowbite/**/*.{js,jsx,ts,tsx}', // Archivos de Flowbite
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'), // Incluye el plugin de Flowbite
  ],
};