// @vitest-environment node
import { describe, it, expect } from 'vitest'

const BASE_URL = process.env['WORKER_URL'] ?? 'http://localhost:8787'

describe('GET /api/health', () => {
  it('returns 200 with correct response shape', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/json')

    const body = await res.json()
    expect(body['status']).toBe('ok')
    expect(['ok', 'degraded']).toContain(body['ghl'])
    expect(typeof body['timestamp']).toBe('string')
    expect(() => new Date(body['timestamp'] as string).toISOString()).not.toThrow()
  })

  it('reports ghl: ok when credentials are valid', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    const body = await res.json()
    expect(body['ghl']).toBe('ok')
  })

  it('returns 403 when Origin header is from a disallowed domain', async () => {
    const res = await fetch(`${BASE_URL}/api/health`, {
      headers: { Origin: 'https://evil-site.example.com' },
    })
    expect(res.status).toBe(403)
  })

  it('allows requests with no Origin header (server-to-server)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    expect(res.status).toBe(200)
  })
})
