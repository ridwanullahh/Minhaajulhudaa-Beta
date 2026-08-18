/**
 * POST /api/auth/logout
 * Clears the session cookie
 */
import type { APIRoute } from 'astro';
import { createLogoutCookie } from '../../../lib/auth';

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': createLogoutCookie(),
    },
  });
};
