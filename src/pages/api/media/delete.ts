/**
 * POST /api/media/delete
 * Delete a Cloudinary media file
 */
import type { APIRoute } from 'astro';
import { deleteFile } from '../../../lib/cloudinary';
import { getSessionCookieValue, requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = getSessionCookieValue(request);
    requireAuth(session);

    const { publicId } = await request.json();
    if (!publicId) {
      return new Response(JSON.stringify({ error: 'publicId is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const deleted = await deleteFile(publicId);
    return new Response(JSON.stringify({ success: deleted }), {
      status: deleted ? 200 : 400, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
