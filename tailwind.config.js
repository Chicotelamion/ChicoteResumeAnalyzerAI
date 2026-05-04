/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#182230',
        marine: '#145C72',
        mint: '#3EB489',
        coral: '#EF6F5E',
        cloud: '#F5F7FA'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(24, 34, 48, 0.10)'
      }
    }
  },
  plugins: []
};
