import type { Env } from '../types/env.js'
import type { RequestContext } from '../lib/logger.js'
import { log } from '../lib/logger.js'
import { checkGhlHealth } from '../lib/ghl.js'
import { corsHeaders, isCorsViolation } from '../lib/cors.js'

export async function handleHealth(
  request: Request,
  env: Env,
  ctx: RequestContext,
  startTime: number,
): Promise<Response> {

  if (isCorsViolation(request, env)) {
    const ms = Date.now() - startTime
    log('warn', ctx, 403, ms, env, 'cors_violation')
    return new Response('Forbidden', { status: 403 })
  }

  const ghl = await checkGhlHealth(env)
  const ghlStatus = ghl === 'degraded' ? 'warn' : 'info';
  const ghlError = ghl === 'degraded' ? 'ghl_degraded' : undefined;
  const status = 200
  const ms = Date.now() - startTime

  log(ghlStatus, ctx, status, ms, env, ghlError); 

  const origin = request.headers.get('Origin')
  return Response.json(
    { status: 'ok', ghl, timestamp: new Date().toISOString() },
    { status, headers: corsHeaders(origin, env) },
  )
}
