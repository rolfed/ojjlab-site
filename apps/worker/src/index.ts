import type { Env } from './types/env.js'
import type { RequestContext } from './lib/logger.js'
import { log } from './lib/logger.js'
import { route } from './router.js'

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now()
    const url = new URL(request.url)

    const requestCtx: RequestContext = {
      requestId: crypto.randomUUID(),
      method: request.method,
      path: url.pathname,
    }

    try {
      return await route(request, env, requestCtx, startTime)
    } catch (err) {
      const ms = Date.now() - startTime
      const message = err instanceof Error ? err.message : 'unknown_error'
      log('error', requestCtx, 500, ms, env, message)
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  },
} satisfies ExportedHandler<Env>
