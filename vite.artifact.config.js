import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({ plugins: [react(), tailwindcss(), viteSingleFile()], base: './', publicDir: false, build: { outDir: 'dist-artifact', assetsInlineLimit: 100000000 } })
