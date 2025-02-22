import {resolve} from "path";
import {defineConfig} from "vite";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import react from "@vitejs/plugin-react";
import {TanStackRouterVite} from "@tanstack/router-plugin/vite";


const __dirname = dirname(fileURLToPath(import.meta.url));


/** @type {import("vite").UserConfig} */
export default defineConfig({
    plugins: [
        TanStackRouterVite(),
        react({ babel: { plugins: [["babel-plugin-react-compiler"]] } }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
    server: {
        open: true,
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            }
        }
    },
});
