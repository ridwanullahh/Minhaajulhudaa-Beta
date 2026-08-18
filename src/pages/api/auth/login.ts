/**
 * POST /api/auth/login
 * Admin authentication endpoint
 */
import type { APIRoute } from 'astro';
import { authenticateAdmin, createSession, createSessionCookie } from '../../../lib/auth';
import { generateCSRFToken } from '../../../lib/utils';
import { parseAndValidate, errorResponse } from '../../../lib/validate';
import { logAction, getClientIP, getUserAgent } from '../../../lib/audit';

export const POST: APIRoute = async ({ request }) => {
  try {
    const result = await parseAndValidate(request, {
      email: { type: 'email', required: true, maxLength: 200 },
      password: { type: 'string', required: true, maxLength: 200 },
      platform: { type: 'string', required: false, enum: ['school', 'masjid', 'charity', 'travels'] },
    });

    if (!result.ok) return result.response!;
    const { email, password, platform } = result.data!;

    const admin = await authenticateAdmin(email, password, platform);
    if (!admin) {
      return errorResponse('Invalid email or password', 401);
    }

    const session = createSession(admin);
    const cookie = createSessionCookie(session);
    const csrfToken = generateCSRFToken();

    // Log successful login
    await logAction(session, {
      action: 'login',
      platform,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
    });

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
    return errorResponse(error.message || 'Login failed', 500);
  }
};
