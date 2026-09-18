import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(appDir, '../..')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const host = env.FRONTEND_HOST || '127.0.0.1'
  const port = Number(env.FRONTEND_PORT || 3000)

  return {
    envDir: rootDir,
    server: {
      host,
      port,
      strictPort: true,
    },
    preview: {
      host,
      port,
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [tanstackStart(), nitro({ preset: 'bun' }), viteReact(), tailwindcss()],
  }
})
