import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  define: {
    // Vite 7 no longer injects process.env.NODE_ENV into browser bundles by
    // default, which breaks Vue's __DEV__ resolution and silently disables
    // DevTools. Explicitly opt in when running the dev server.
    __VUE_PROD_DEVTOOLS__: command !== 'build',
  },
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: Number(process.env['PORT']) || 4301,
    // Bind 0.0.0.0 so the dev server is reachable from outside the container.
    host: true,
    // Bind-mount file events don't cross into the container on macOS/Windows,
    // so Vite must poll for HMR to work.
    watch: process.env['VITE_DEV_POLLING'] === 'true' ? { usePolling: true } : undefined,
    // Behind the nginx + OrbStack HTTPS proxy the HMR client must dial the public
    // host over wss on 443, not the container's localhost:4301.
    hmr: process.env['VITE_HMR_HOST']
      ? { host: process.env['VITE_HMR_HOST'], protocol: 'wss', clientPort: 443 }
      : undefined,
    // Vite blocks unknown Host headers by default; allow the proxied domain.
    allowedHosts: process.env['VITE_HMR_HOST'] ? [process.env['VITE_HMR_HOST']] : undefined,
  },
}));
