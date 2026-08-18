import type { APIRoute } from 'astro';
import { lightbase } from '../../lib/lightbase';
import { sendPlatformEmail, isConfigured as emailConfigured } from '../../lib/email';
import { parseAndValidate, jsonResponse, errorResponse } from '../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  try {
    const result = await parseAndValidate(request, {
      platform: { type: 'string', required: true, enum: ['school', 'masjid', 'charity', 'travels'] },
      name: { type: 'string', required: true, maxLength: 100 },
      email: { type: 'email', required: true, maxLength: 200 },
      phone: { type: 'phone', required: false, maxLength: 20 },
      subject: { type: 'string', required: true, maxLength: 200 },
      message: { type: 'string', required: true, maxLength: 5000 },
    });

    if (!result.ok) return result.response!;
    const body = result.data!;

    body.status = 'new';
    body.createdAt = new Date().toISOString();

    const insertResult = await lightbase.insert('contact_submissions', body);

    // Send confirmation email to the user
    if (emailConfigured()) {
      try {
        await sendPlatformEmail(body.platform as any, 'contact_received', {
          email: body.email,
          variables: {
            name: body.name,
            subject: body.subject,
            platform_name: body.platform.charAt(0).toUpperCase() + body.platform.slice(1),
          },
        });
      } catch { /* email failure non-critical */ }
    }

    return jsonResponse({ success: true, document: insertResult.document }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal server error', 500);
  }
};
