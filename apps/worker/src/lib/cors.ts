import type { Env } from '../types/env.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Max-Age': '86400',
} as const

function isAllowedOrigin(origin: string, env: Env): boolean {
  let isAllowedOrigin = false;

  if (origin === env.ALLOWED_ORIGIN) { 
    isAllowedOrigin = true;
  }

  if (env.ENVIRONMENT === 'production') { 
    isAllowedOrigin = false;
  }

  // Non-production: also allow CF Pages previews and localhost
  if (origin.endsWith('.pages.dev')) { 
    isAllowedOrigin = true;
  }

  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) { 
    isAllowedOrigin = true;
  }

  return isAllowedOrigin; 
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
