/**
 * POST /api/render-markdown
 * Renders markdown to sanitized HTML (for editor preview).
 * Server-side only - no auth required as it's just rendering.
 */
import type { APIRoute } from 'astro';
import { renderMarkdown } from '../../lib/markdown';
import { jsonResponse, errorResponse } from '../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const markdown = body.markdown || '';
    if (typeof markdown !== 'string') {
      return errorResponse('markdown must be a string', 400);
    }
    // Limit input size to prevent abuse
    if (markdown.length > 100000) {
      return errorResponse('Markdown content too large (max 100KB)', 400);
    }
    const html = renderMarkdown(markdown);
    return jsonResponse({ html });
  } catch (err: any) {
    return errorResponse(err.message || 'Render failed', 500);
  }
};
