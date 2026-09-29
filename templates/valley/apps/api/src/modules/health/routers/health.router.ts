import { Hono } from 'hono'
import * as healthHandler from '../handlers/health.handler.ts'

export const healthRoutes = new Hono()

healthRoutes.get('/', healthHandler.getHealth)
