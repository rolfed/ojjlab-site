import { isCorsViolation } from "../lib/cors"
import { createContact } from "../lib/ghl"
import { CreateHighLevelContactRequest } from "../lib/ghl.types"
import { log, RequestContext } from "../lib/logger"
import { Env } from "../types/env"
import { LeadSchema, validateEmail, validatePhone } from "../validation/leads"

export async function handleLeadsStart(
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

  try {
    const rawBody: unknown = await request.json()
    const parsed = LeadSchema.safeParse(rawBody)

    if (!parsed.success) {
      const ms = Date.now() - startTime
      log('warn', ctx, 400, ms, env, 'invalid_request')

      return Response.json(
        { error: 'Invalid request', issues: parsed.error.issues },
        { status: 400 },
      )
    }

    const body = parsed.data

    const email = validateEmail(body.email)
    if (!email) {
      const ms = Date.now() - startTime
      log('warn', ctx, 400, ms, env, 'invalid_email')

      return Response.json(
        { error: 'Invalid email address' },
        { status: 400 },
      )
    }

    const phone = body.phone ? validatePhone(body.phone) : undefined
    if (body.phone && !phone) {
      const ms = Date.now() - startTime
      log('warn', ctx, 400, ms, env, 'invalid_phone')

      return Response.json(
        { error: 'Invalid phone number' },
        { status: 400 },
      )
    }

    const newContact: CreateHighLevelContactRequest = {
      firstName: body.firstName,
      lastName: body.lastName,
      email,
      phone,
      locationId: env.GHL_LOCATION_ID,
      tags: body.tags ?? ['local-testing'],
      source: body.source
    }

    const ghlResponse = await createContact(env, newContact)

    const ms = Date.now() - startTime
    log('info', ctx, 201, ms, env, 'contact_created');

    return Response.json(
      {
        ok: true,
        contactId: ghlResponse.contact?.id ?? null,
      },
      { status: 201 },
    )
  } catch (error) {
    const ms = Date.now() - startTime
    log('error', ctx, 500, ms, env, 'contact_creation_failed')

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
