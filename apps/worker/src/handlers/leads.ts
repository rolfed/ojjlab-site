import { corsHeaders, isCorsViolation } from "../lib/cors"
import { createContact } from "../lib/ghl"
import { CreateHighLevelContactRequest } from "../lib/ghl.types"
import { log, RequestContext } from "../lib/logger"
import { Env } from "../types/env"
import { LeadSchema, validateEmail, validatePhone } from "../validation/leads"

function jsonResponse(
  request: Request,
  env: Env,
  body: unknown,
  status: number
): Response {
  const origin = request.headers.get('Origin');

  return new Response(
    JSON.stringify(body), 
    {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders(origin, env)
    }
  })
}

export async function handleLeadsStart(
  request: Request,
  env: Env,
  ctx: RequestContext,
  startTime: number,
): Promise<Response> {

  if (isCorsViolation(request, env)) {
    const ms = Date.now() - startTime
    log('warn', ctx, 403, ms, env, 'cors_violation')
    return jsonResponse(request, env, { error: 'Forbidden' }, 403);
  }

  try {
    const rawBody: unknown = await request.json()
    const parsed = LeadSchema.safeParse(rawBody)

    if (!parsed.success) {
      const ms = Date.now() - startTime
      log('warn', ctx, 400, ms, env, 'invalid_request')

      return jsonResponse(
        request,
        env,
        { error: 'Invalid request', issues: parsed.error.issues },
        400
      );
    }

    const body = parsed.data

    const email = validateEmail(body.email)
    if (!email) {
      const ms = Date.now() - startTime
      log('warn', ctx, 400, ms, env, 'invalid_email')

      return jsonResponse(
        request, 
        env, 
        { error: 'Invalid email address'}, 
        400
      );
    }

    const phone = body.phone ? validatePhone(body.phone) : undefined
    if (body.phone && !phone) {
      const ms = Date.now() - startTime
      log('warn', ctx, 400, ms, env, 'invalid_phone')

      return jsonResponse(
        request, 
        env, 
        { error: 'Invalid phone number' }, 
        400);
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

    return jsonResponse(
      request, 
      env, 
      {
        success: true,
        data: {
          contactId: ghlResponse.contact?.id ?? null,
          accepted: true
        }
      },
      201
    );
  } catch {
    const ms = Date.now() - startTime
    log('error', ctx, 500, ms, env, `contact_creation_failed`)

    return jsonResponse(
      request, 
      env, 
      { error: 'Internal server error' },
     500 
    );
  }
}
