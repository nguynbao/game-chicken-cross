import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Crucial for YouTube Playables / iframes
  build: {
    target: 'esnext',
    assetsInlineLimit: 10000000, // Inline small assets / fonts so bundle is self-contained
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 3002,
    open: true,
  },
});
