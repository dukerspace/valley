import { createApp } from './app.ts'

const { app, env } = createApp()

export default {
  port: env.API_PORT,
  hostname: env.API_HOST,
  fetch: app.fetch,
}

export { app, createApp }
