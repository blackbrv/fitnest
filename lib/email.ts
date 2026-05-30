import { Resend } from 'resend'

if (process.env.NODE_ENV === 'production' && !process.env.RESEND_API_KEY) {
  console.warn('[FitNest] RESEND_API_KEY is not set — email verification and password reset will not work')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.EMAIL_FROM ?? 'FitNest <noreply@fitnest.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

interface SendResult {
  success: boolean
  error?: string
}

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  if (!resend) {
    // Dev preview — log to console when no API key is configured
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧  EMAIL PREVIEW (set RESEND_API_KEY to send real emails)')
    console.log(`TO:      ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log('BODY:    (HTML — see template in lib/email.ts)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    return { success: true }
  }

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    console.error('[email]', err)
    return { success: false, error: 'Failed to send email' }
  }
}

// ── Templates ─────────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FitNest</title>
</head>
<body style="margin:0;padding:0;background:#0f1115;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1115;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#a3ff3f;border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="font-size:20px;line-height:36px;">⚡</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-size:22px;font-weight:700;color:#f5f7fa;">Fit<span style="color:#a3ff3f;">Nest</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#151922;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px 40px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#8b95a5;">© ${new Date().getFullYear()} FitNest. All rights reserved.</p>
              <p style="margin:4px 0 0;font-size:12px;color:#8b95a5;">If you did not request this email, you can safely ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Email senders ──────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, token: string): Promise<SendResult> {
  const url = `${APP_URL}/verify-email?token=${token}`
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f5f7fa;">Verify your email</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#8b95a5;line-height:1.6;">
      Welcome to FitNest! Click the button below to verify your email address and activate your account.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td>
          <a href="${url}" style="display:inline-block;background:#a3ff3f;color:#0f1115;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:50px;">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#8b95a5;">
      Or copy this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:12px;color:#a3ff3f;word-break:break-all;">${url}</p>
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
      <p style="margin:0;font-size:13px;color:#8b95a5;">⏳ This link expires in <strong style="color:#f5f7fa;">24 hours</strong>.</p>
    </div>
  `)
  return send(to, 'Verify your FitNest email address', html)
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<SendResult> {
  const url = `${APP_URL}/reset-password?token=${token}`
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f5f7fa;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#8b95a5;line-height:1.6;">
      We received a request to reset your FitNest password. Click the button below to choose a new password.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td>
          <a href="${url}" style="display:inline-block;background:#a3ff3f;color:#0f1115;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:50px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#8b95a5;">
      Or copy this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:12px;color:#a3ff3f;word-break:break-all;">${url}</p>
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
      <p style="margin:0 0 6px;font-size:13px;color:#8b95a5;">⏳ This link expires in <strong style="color:#f5f7fa;">1 hour</strong>.</p>
      <p style="margin:0;font-size:13px;color:#8b95a5;">🔒 If you did not request a password reset, please ignore this email. Your password will not change.</p>
    </div>
  `)
  return send(to, 'Reset your FitNest password', html)
}
