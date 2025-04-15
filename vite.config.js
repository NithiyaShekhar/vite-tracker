// vite.config.js
export default {
    build: {
      lib: {
        entry: './src/trackx.js',
        formats: ['iife'], // Immediately-invoked function expression
        name: 'TrackX',
        fileName: () => `trackx.js`,
      },
      minify: 'terser',
    },
  };
  