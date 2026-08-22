/**
 * GET/POST/DELETE /api/admin/settings/contact
 * Manages contact information and contact form submissions.
 * GET: Returns current contact settings OR contact submissions list
 * POST: Updates contact settings (admin only) OR marks submission as read
 * DELETE: Deletes a contact submission (admin only)
 */
import type { APIRoute } from 'astro';
import { getContactSettings, saveContactSettings } from '../../../../lib/contact-settings';
import { getSessionCookieValue } from '../../../../lib/auth';
import { lightbase } from '../../../../lib/lightbase';
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
    const session = getSessionCookieValue(request);
    if (!session) return errorResponse('Authentication required', 401);

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // Handle mark_read action
    if (action === 'mark_read') {
      const id = url.searchParams.get('id');
      if (!id) return errorResponse('Missing id', 400);
      await lightbase.update('contact_submissions', id, { status: 'read' });
      return jsonResponse({ success: true });
    }

    // Default: update contact settings
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
      logoUrl: { type: 'string', required: false, maxLength: 2000 },
    });

    if (!result.ok) return result.response!;
    const body = result.data!;
    const platform = url.searchParams.get('platform') || 'general';
    const existing = await getContactSettings(platform);
    const merged = { ...existing, ...body };
    await saveContactSettings(merged, platform);

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

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const session = getSessionCookieValue(request);
    if (!session) return errorResponse('Authentication required', 401);

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'delete') {
      const id = url.searchParams.get('id');
      if (!id) return errorResponse('Missing id', 400);
      await lightbase.delete('contact_submissions', id);
      await logAction(session, {
        action: 'delete_contact_submission',
        documentId: id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
      });
      return jsonResponse({ success: true });
    }

    return errorResponse('Invalid action', 400);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete', 500);
  }
};
