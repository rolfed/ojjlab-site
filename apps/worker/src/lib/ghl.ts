import type { Env } from '../types/env.js'

const GHL_BASE_URL = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const GHL_TIMEOUT_MS = 5_000

export type GhlStatus = 'ok' | 'degraded'

function authHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.GHL_API_KEY}`,
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
  }
}

/**
 * Verifies GHL API reachability and credential validity by fetching
 * sub-account metadata. Returns only a status — never proxies the response.
 */
export async function checkGhlHealth(env: Env): Promise<GhlStatus> {
  try {
    const res = await fetch(
      `${GHL_BASE_URL}/locations/${env.GHL_LOCATION_ID}`,
      {
        method: 'GET',
        headers: authHeaders(env),
        signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      },
    )
    return res.ok ? 'ok' : 'degraded'
  } catch {
    return 'degraded'
  }
}

// TODO: createContact(payload, env) — implemented with lead capture handler
// TODO: updateCalendarSchedule(calendarId, payload, env) — implemented with admin handler
