import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    allowedHosts: [
      '97def34cba68.ngrok-free.app',
      '.ngrok-free.app', // 모든 ngrok 도메인 허용
    ],
    proxy: {
      // 순서가 중요! 더 구체적인 경로를 먼저 배치
      '/api/spotify-api': {
        target: 'https://api.spotify.com',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/spotify-api/, '');
          console.log('Rewriting API path:', path, '->', newPath);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('spotify-api proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Spotify API:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Spotify API:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/spotify-token': {
        target: 'https://accounts.spotify.com',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/spotify-token/, '');
          console.log('Rewriting token path:', path, '->', newPath);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('spotify-token proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Spotify Token:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Spotify Token:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})

