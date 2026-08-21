/**
 * GET/POST /api/admin/settings/contact
 * Manages contact information for the platform.
 * GET: Returns current contact settings
 * POST: Updates contact settings (admin only)
 */
import type { APIRoute } from 'astro';
import { getContactSettings, saveContactSettings } from '../../../../lib/contact-settings';
import { getSessionCookieValue } from '../../../../lib/auth';
import { jsonResponse, errorResponse, parseAndValidate } from '../../../../lib/validate';
import { logAction, getClientIP, getUserAgent } from '../../../../lib/audit';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const platform = url.searchParams.get('platform') || 'general';
    const settings = await getContactSettings(platform);
    return jsonResponse({ settings });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to load settings', 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check auth
    const session = getSessionCookieValue(request);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const result = await parseAndValidate(request, {
      phone: { type: 'string', required: false, maxLength: 50 },
      email: { type: 'email', required: false, maxLength: 200 },
      address: { type: 'string', required: false, maxLength: 500 },
      city: { type: 'string', required: false, maxLength: 100 },
      country: { type: 'string', required: false, maxLength: 100 },
      whatsapp: { type: 'string', required: false, maxLength: 50 },
      facebook: { type: 'url', required: false, maxLength: 500 },
      twitter: { type: 'url', required: false, maxLength: 500 },
      instagram: { type: 'url', required: false, maxLength: 500 },
      youtube: { type: 'url', required: false, maxLength: 500 },
      mapEmbedUrl: { type: 'url', required: false, maxLength: 2000 },
      officeHours: { type: 'string', required: false, maxLength: 500 },
    });

    if (!result.ok) return result.response!;
    const body = result.data!;

    // Get platform from query or default to general
    const url = new URL(request.url);
    const platform = url.searchParams.get('platform') || 'general';

    // Merge with existing settings
    const existing = await getContactSettings(platform);
    const merged = { ...existing, ...body };

    await saveContactSettings(merged, platform);

    // Log the action
    await logAction(session, {
      action: 'update_contact_settings',
      platform,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
    });

    return jsonResponse({ success: true, settings: merged });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to save settings', 500);
  }
};
