import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        host: "0.0.0.0",
        port: 5173,
        strictPort: true,
        watch: {
            usePolling: true,
        },
        proxy: {
            // Forwards any request starting with /api to FastAPI inside Docker
            "/api": {
                target: "http://api:8000",
                changeOrigin: true,
            },
        },
    },
});
