export interface Env {
  // ── Active secrets (set via: wrangler secret put <NAME> --env <env>) ────────
  GHL_API_KEY: string
  GHL_LOCATION_ID: string

  // ── Future secrets — required when lead capture is implemented ───────────────
  GHL_CALENDAR_ID_ADULTS?: string
  GHL_CALENDAR_ID_YOUNG_GRAPPLERS?: string
  GHL_CALENDAR_ID_OLDER_KIDS?: string
  ADMIN_TOKEN?: string
  TURNSTILE_SECRET_KEY?: string

  // ── Vars (set in wrangler.toml [vars]) ──────────────────────────────────────
  ALLOWED_ORIGIN: string
  ENVIRONMENT: 'local' | 'staging' | 'production'
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'

  // ── KV (uncomment in wrangler.toml after running: wrangler kv namespace create) ──
  // RATE_LIMIT_KV: KVNamespace
}
