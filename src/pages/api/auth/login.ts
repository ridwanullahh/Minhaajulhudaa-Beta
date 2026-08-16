/**
 * POST /api/auth/login
 * Admin authentication endpoint
 */
import type { APIRoute } from 'astro';
import { authenticateAdmin, createSession, createSessionCookie } from '../../../lib/auth';
import { generateCSRFToken } from '../../../lib/utils';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = createSession(admin);
    const cookie = createSessionCookie(session);
    const csrfToken = generateCSRFToken();

    return new Response(
      JSON.stringify({ success: true, user: { email: admin.email, firstName: admin.firstName, lastName: admin.lastName, role: admin.role, platforms: admin.platforms }, csrfToken }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie,
        },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
