import type { Env } from '../types/env.js'
import { getHighLevelClient } from './ghl.client.js'
import type { CreateHighLevelContactRequest } from './ghl.types'

export type GhlStatus = 'ok' | 'degraded'

export interface UpdateCalendarScheduleRequest {
  name?: string
  description?: string
  isActive?: boolean
  slotDuration?: number
  openHours?: unknown
  allowBookingAfter?: number
  allowBookingFor?: number
}

export class GhlError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'GhlError'
  }
}

/**
 * Verifies GHL API reachability and credential validity by reading
 * the configured sub-account (location). Returns only service health.
 */
export async function checkGhlHealth(env: Env): Promise<GhlStatus> {
  try {
    const highLevel = getHighLevelClient(env)

    // Adjust this method name if your installed SDK exposes a slightly different namespace.
    await highLevel.locations.getLocation({
      locationId: env.GHL_LOCATION_ID,
    })

    return 'ok'
  } catch {
    return 'degraded'
  }
}

/**
 * Creates a contact in HighLevel.
 * Throws a controlled error instead of returning status-only data.
 */
export async function createContact(
  env: Env,
  payload: CreateHighLevelContactRequest,
) {
  try {
    const highLevel = getHighLevelClient(env)

    const response = await highLevel.contacts.createContact({
      ...payload,
      locationId: payload.locationId ?? env.GHL_LOCATION_ID,
    })

    return response
  } catch (error) {
    throw new GhlError('Failed to create HighLevel contact', error)
  }
}

/**
 * Updates a calendar by ID.
 * The exact request shape depends on which calendar fields you support.
 */
export async function updateCalendarSchedule(
  env: Env,
  calendarId: string,
  payload: UpdateCalendarScheduleRequest,
) {
  try {
    const highLevel = getHighLevelClient(env)

    // Adjust method name if the SDK emits a different calendars namespace shape.
    const response = await highLevel.calendars.updateCalendar({
      calendarId,
      ...payload,
    })

    return response
  } catch (error) {
    throw new GhlError(`Failed to update HighLevel calendar: ${calendarId}`, error)
  }
}
