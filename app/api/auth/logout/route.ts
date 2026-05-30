import { getSession, incrementSessionVersion } from '@/lib/auth'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    await incrementSessionVersion(session.userId)

    return Response.json({ data: { message: 'Logged out successfully' } }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/auth/logout]', error)
    return err('Internal server error', 500)
  }
}
