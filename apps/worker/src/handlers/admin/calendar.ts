import type { Env } from '../../types/env.js'
import type { RequestContext } from '../../lib/logger.js'
import { log } from '../../lib/logger.js'

// TODO: implement PUT /api/admin/calendar/schedule
//   - Validate X-Admin-Token header via adminAuth.validateToken()
//   - Validate payload (calendarId, program, availability, timezone) via Zod
//   - Update GHL calendar availability via ghl.updateCalendarSchedule()
//   - Note: GHL Schedules API may be a stub — verify API availability at implementation time
export async function handleAdminCalendar(
  request: Request,
  env: Env,
  ctx: RequestContext,
  startTime: number,
): Promise<Response> {
  const ms = Date.now() - startTime
  log('warn', ctx, 501, ms, env, 'not_implemented')
  return Response.json({ error: 'Not implemented' }, { status: 501 })
}
