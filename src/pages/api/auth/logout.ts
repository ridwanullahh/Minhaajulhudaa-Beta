/**
 * POST /api/auth/logout
 * Clears the session cookie and logs the action
 */
import type { APIRoute } from 'astro';
import { createLogoutCookie, getSessionCookieValue } from '../../../lib/auth';
import { logAction, getClientIP, getUserAgent } from '../../../lib/audit';

export const POST: APIRoute = async ({ request }) => {
  const session = getSessionCookieValue(request);
  if (session) {
    await logAction(session, {
      action: 'logout',
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
    });
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': createLogoutCookie(),
    },
  });
};
