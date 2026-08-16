/**
 * GET /api/auth/me
 * Returns current authenticated user info
 */
import type { APIRoute } from 'astro';
import { getSessionCookieValue } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  const session = getSessionCookieValue(request);
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ authenticated: true, user: { email: session.email, role: session.role, platforms: session.platforms } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
