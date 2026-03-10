import type { Env } from '../types/env.js'
import { CreateHighLevelContactRequest, CreateHighLevelContactResponse, GhlStatus } from './ghl.types'

const GHL_BASE_URL = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const GHL_TIMEOUT_MS = 5_000


export class GhlApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: string,
  ) {
    super(message)
    this.name = 'GhlApiError'
  }
}

function authHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.GHL_API_KEY}`,
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

/**
 * Verifies GHL API reachability and credential validity by fetching
 * sub-account metadata. Returns only a status — never proxies the response.
 */
export async function checkGhlHealth(env: Env): Promise<GhlStatus> {
  const endpoint = `${GHL_BASE_URL}/locations/${env.GHL_LOCATION_ID}`;
  try {
    const res = await fetch(
      endpoint,
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

export async function createContact(
  env: Env, contact: CreateHighLevelContactRequest
): Promise<CreateHighLevelContactResponse> {
  const endpoint = `${GHL_BASE_URL}/contacts`;
  const payload = JSON.stringify(contact); 

  try {

    const response = await fetch(
      endpoint,
      {
        method: 'POST',
        headers: authHeaders(env),
        body: payload 
      });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new GhlApiError('Failed to create GHL contact',
      response.status,
      errorBody);
    }

    const jsonResponse: CreateHighLevelContactResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    if (error instanceof GhlApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new Error(`Unexpected error creating GHL contact: ${error.message}`);
    }

    throw new Error('Unexpected unknown error creating GHL contact');
  }

}

// TODO: createContact(payload, env) — implemented with lead capture handler
// TODO: updateCalendarSchedule(calendarId, payload, env) — implemented with admin handler
