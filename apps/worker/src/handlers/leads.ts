import type { Env } from '../types/env.js'
import type { RequestContext } from '../lib/logger.js'
import { log } from '../lib/logger.js'

// TODO: implement POST /api/leads/start
//   - Validate 4-field payload (firstName, email, phone, program) via Zod
//   - Check CORS and rate limit
//   - Create GHL contact with program tag via ghl.createContact()
//   - Return { success: true, program } on 201
export function handleLeadsStart(
  request: Request,
  env: Env,
  ctx: RequestContext,
  startTime: number,
): Promise<Response> {
  const ms = Date.now() - startTime
  log('warn', ctx, 501, ms, env, 'not_implemented')
  return Promise.resolve(Response.json({ error: 'Not implemented' }, { status: 501 }))
}
