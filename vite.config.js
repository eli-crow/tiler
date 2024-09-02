import react from '@vitejs/plugin-react'
import { fileURLToPath } from "url"
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const SRC_PATH = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
    plugins: [react(), svgr()],
    base: './',
    resolve: {
        base: './',
        alias: [
            { find: '@/', replacement: SRC_PATH + '/' },
        ]
    }
})