/**
 * POST /api/media/upload
 * Server-side Cloudinary upload proxy
 */
import type { APIRoute } from 'astro';
import { uploadFile, isConfigured } from '../../../lib/cloudinary';
import { getSessionCookieValue, requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Auth required
    const session = getSessionCookieValue(request);
    requireAuth(session);

    if (!isConfigured()) {
      return new Response(JSON.stringify({ error: 'Cloudinary is not configured' }), {
        status: 503, headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || undefined;
    const platform = (formData.get('platform') as string) || 'general';
    const tagsRaw = formData.get('tags') as string;
    const tags = tagsRaw ? tagsRaw.split(',') : [];

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large (max 10MB)' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await uploadFile(file, {
      folder,
      platform,
      tags,
      uploadedBy: session.email,
    });

    return new Response(JSON.stringify({
      success: true,
      publicId: result.publicId,
      secureUrl: result.secureUrl,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resourceType,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Upload failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
