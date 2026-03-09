import type { Env } from '../types/env.js'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface RequestContext {
  requestId: string
  method: string
  path: string
}

interface LogEntry extends RequestContext {
  timestamp: string
  level: LogLevel
  status: number
  durationMs: number
  environment: string
  error?: string
}

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function minLevel(env: Env): number {
  return LEVEL_RANK[env.LOG_LEVEL] ?? LEVEL_RANK.info
}

function emit(entry: LogEntry, env: Env): void {
  if (LEVEL_RANK[entry.level] < minLevel(env)) return

  if (env.ENVIRONMENT === 'local') {
    const err = entry.error ? ` | ${entry.error}` : ''
    console.log(
      `[${entry.level.toUpperCase()}] ${entry.method} ${entry.path} → ${entry.status} (${entry.durationMs}ms)${err}`,
    )
  } else {
    console.log(JSON.stringify(entry))
  }
}

export function log(
  level: LogLevel,
  ctx: RequestContext,
  status: number,
  durationMs: number,
  env: Env,
  error?: string,
): void {
  emit(
    {
      timestamp: new Date().toISOString(),
      level,
      ...ctx,
      status,
      durationMs,
      environment: env.ENVIRONMENT,
      error,
    },
    env,
  )
}
