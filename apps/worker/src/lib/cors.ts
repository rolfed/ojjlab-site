import type { Env } from '../types/env.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Max-Age': '86400',
} as const

function isAllowedOrigin(origin: string, env: Env): boolean {
  if (origin === env.ALLOWED_ORIGIN) return true

  // Non-production: also allow CF Pages previews and localhost
  if (env.ENVIRONMENT !== 'production') {
    if (origin.endsWith('.pages.dev')) return true
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true
  }

  return false
}

export function corsHeaders(origin: string | null, env: Env): HeadersInit {
  if (!origin || !isAllowedOrigin(origin, env)) return {}
  return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin }
}

export function handlePreflight(request: Request, env: Env): Response | null {
  if (request.method !== 'OPTIONS') return null
  const origin = request.headers.get('Origin')
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, env),
  })
}

// Returns true only when an Origin header is present and not allowed.
// Server-to-server calls (curl, integration tests) send no Origin and are allowed.
export function isCorsViolation(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin')
  if (!origin) return false
  return !isAllowedOrigin(origin, env)
}
