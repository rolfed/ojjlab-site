import type { Env } from './types/env.js'
import type { RequestContext } from './lib/logger.js'
import { handlePreflight } from './lib/cors.js'
import { handleHealth } from './handlers/health.js'
import { handleLeadsStart } from './handlers/leads.js'
import { handleAdminCalendar } from './handlers/admin/calendar.js'

type Handler = (
  request: Request,
  env: Env,
  ctx: RequestContext,
  startTime: number,
) => Promise<Response>

const routes: Array<{ method: string; pattern: URLPattern; handler: Handler }> = [
  {
    method: 'GET',
    pattern: new URLPattern({ pathname: '/api/health' }),
    handler: handleHealth,
  },
  {
    method: 'POST',
    pattern: new URLPattern({ pathname: '/api/leads/start' }),
    handler: handleLeadsStart,
  },
  {
    method: 'PUT',
    pattern: new URLPattern({ pathname: '/api/admin/calendar/schedule' }),
    handler: handleAdminCalendar,
  },
]

export function route(
  request: Request,
  env: Env,
  requestCtx: RequestContext,
  startTime: number,
): Promise<Response> {
  const preflight = handlePreflight(request, env)
  if (preflight) return Promise.resolve(preflight)

  const url = new URL(request.url)
  for (const { method, pattern, handler } of routes) {
    if (request.method === method && pattern.test(url)) {
      return handler(request, env, requestCtx, startTime)
    }
  }

  return Promise.resolve(
    Response.json({ error: 'Not found' }, { status: 404 }),
  )
}
