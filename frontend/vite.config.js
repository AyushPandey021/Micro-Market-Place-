import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api/auth': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            '/api/products': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            '/api/cart': {
                target: 'http://localhost:5002',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            '/api/orders': {
                target: 'http://localhost:5001',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            '/api/ai-buddy': {
                target: 'http://localhost:5006',
                changeOrigin: true,
                secure: false,
                ws: true,
                rewrite: (path) => path.replace(/^\/api\/ai-buddy/, '/ai-buddy')
            },
            '/socket.io': {
                target: 'http://localhost:5006',
                ws: true,
                changeOrigin: true,
                secure: false
            },
            '/api': {
                target: 'http://localhost:5001', // Default to order service
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            }
        }
    }
});
