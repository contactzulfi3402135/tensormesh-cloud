import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// TENSOR MESH — Build configuration
// https://tensormesh.cloud/docs/architecture-whitepaper
//
// The dev server is reachable both directly (http://localhost:5173) and through a
// TLS-terminating preview proxy. Set HMR_CLIENT_PORT=443 when running behind the
// proxy so the HMR socket targets the proxied port instead of the origin port.
const hmrClientPort = process.env.HMR_CLIENT_PORT ? Number(process.env.HMR_CLIENT_PORT) : undefined

export default defineConfig({
  // Absolute base so hashed assets resolve from the domain root on Vercel
  // regardless of trailing slashes or deep-linked URLs.
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Preview is served through a proxied sandbox host; allow it explicitly.
    allowedHosts: true,
    hmr: hmrClientPort ? { clientPort: hmrClientPort } : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200,
    sourcemap: false,
  },
})
