// Builds the wallet button (wallet/main.jsx) into one static, minified file at the project root: /wallet.js.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: root,
    emptyOutDir: false,
    copyPublicDir: false,
    minify: true,
    rollupOptions: {
      input: fileURLToPath(new URL('./main.jsx', import.meta.url)),
      output: { entryFileNames: 'wallet.js', codeSplitting: false },
    },
  },
});
