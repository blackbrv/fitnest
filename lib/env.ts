/**
 * Validates required environment variables at module load time.
 * Import this module early (e.g. from lib/auth.ts, lib/db.ts) so it runs
 * before any requests are served and fails loudly in misconfigured environments.
 */

const MIN_JWT_SECRET_BYTES = 32

function validateEnv(): void {
  const errors: string[] = []

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    errors.push('JWT_SECRET is not set')
  } else if (Buffer.byteLength(jwtSecret, 'utf8') < MIN_JWT_SECRET_BYTES) {
    errors.push(
      `JWT_SECRET is too short (${Buffer.byteLength(jwtSecret, 'utf8')} bytes). ` +
      `Minimum required: ${MIN_JWT_SECRET_BYTES} bytes. ` +
      'Generate one with: openssl rand -hex 32',
    )
  }

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set')
  }

  if (errors.length > 0) {
    const msg = ['[FitNest] Environment configuration errors:', ...errors.map((e) => `  • ${e}`)].join('\n')
    throw new Error(msg)
  }
}

validateEnv()
