/**
 * Server-side HTML Sanitizer
 *
 * Strips dangerous HTML tags and attributes to prevent XSS attacks when
 * rendering user-generated content with set:html.
 *
 * This is a lightweight sanitizer that does NOT require external dependencies.
 * It uses a whitelist approach: only explicitly allowed tags and attributes
 * are preserved; everything else is stripped.
 *
 * For production use with complex rich-text content, consider installing
 * sanitize-html or dompurify. This implementation covers the common cases.
 */

// Allowed HTML tags (whitelist)
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
  'blockquote', 'q', 'cite', 'abbr', 'address', 'time',
  'code', 'pre', 'kbd', 'samp', 'var',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'a', 'img',
  'figure', 'figcaption',
  'details', 'summary',
]);

// Allowed attributes per tag
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'title', 'lang', 'dir']),
  'a': new Set(['href', 'title', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan']),
  'time': new Set(['datetime']),
};

// Tags that must be completely removed (including content)
const DANGEROUS_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'applet',
  'form', 'input', 'button', 'textarea', 'select', 'option',
  'meta', 'link', 'base', 'noscript',
]);

// URI schemes that are safe for href/src
const SAFE_URI_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:', '/']);

function isSafeUri(uri: string): boolean {
  const trimmed = uri.trim().toLowerCase();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  try {
    const url = new URL(trimmed);
    return SAFE_URI_SCHEMES.has(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeAttributes(tag: string, attrsStr: string): string {
  const allowedForTag = ALLOWED_ATTRS[tag] || new Set();
  const allowedGlobal = ALLOWED_ATTRS['*'];
  const sanitizedAttrs: string[] = [];

  // Match attributes: name="value" or name='value' or name=value or name
  const attrRegex = /(\w[\w-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = attrRegex.exec(attrsStr)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] || match[3] || match[4] || '';

    // Check if attribute is allowed for this tag or globally
    if (!allowedForTag.has(name) && !allowedGlobal.has(name)) continue;

    // Special validation for href/src
    if ((name === 'href' || name === 'src') && value) {
      if (!isSafeUri(value)) continue;
    }

    // Add rel="noopener noreferrer" to target="_blank" links
    if (tag === 'a' && name === 'target' && value === '_blank') {
      sanitizedAttrs.push('target="_blank"');
      sanitizedAttrs.push('rel="noopener noreferrer"');
      continue;
    }

    // Escape the value
    const escapedValue = value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    sanitizedAttrs.push(`${name}="${escapedValue}"`);
  }

  return sanitizedAttrs.length > 0 ? ' ' + sanitizedAttrs.join(' ') : '';
}

/**
 * Sanitize HTML content to prevent XSS.
 * Strips dangerous tags/attributes while preserving safe formatting.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let result = '';
  let i = 0;

  while (i < html.length) {
    // Find next tag
    const ltIndex = html.indexOf('<', i);
    if (ltIndex === -1) {
      result += html.substring(i);
      break;
    }

    // Add text before the tag
    result += html.substring(i, ltIndex);

    // Find the end of the tag
    const gtIndex = html.indexOf('>', ltIndex);
    if (gtIndex === -1) {
      // No closing >, treat rest as text
      result += html.substring(ltIndex);
      break;
    }

    const tagContent = html.substring(ltIndex, gtIndex + 1);
    i = gtIndex + 1;

    // Parse the tag
    const tagMatch = tagContent.match(/^<\s*(\/?)\s*(\w[\w-]*)\s*([^>]*?)\s*(\/?)\s*>$/);
    if (!tagMatch) {
      // Not a valid tag, skip it (don't add to output)
      continue;
    }

    const isClosing = tagMatch[1] === '/';
    const tagName = tagMatch[2].toLowerCase();
    const attrsStr = tagMatch[3] || '';
    const isSelfClosing = tagMatch[4] === '/';

    // Skip dangerous tags entirely (including content for script/style)
    if (DANGEROUS_TAGS.has(tagName)) {
      // If it's an opening dangerous tag, skip until the closing tag
      if (!isClosing) {
        const closingTag = `</${tagName}`;
        const closingIndex = html.toLowerCase().indexOf(closingTag, i);
        if (closingIndex !== -1) {
          const finalGt = html.indexOf('>', closingIndex);
          if (finalGt !== -1) {
            i = finalGt + 1;
          }
        }
      }
      continue;
    }

    // Skip comments
    if (tagName === '!--' || tagContent.startsWith('<!--')) {
      continue;
    }

    // Skip unknown tags (but keep their text content)
    if (!ALLOWED_TAGS.has(tagName)) {
      continue;
    }

    // Reconstruct the sanitized tag
    if (isClosing) {
      result += `</${tagName}>`;
    } else {
      const sanitizedAttrs = sanitizeAttributes(tagName, attrsStr);
      result += `<${tagName}${sanitizedAttrs}${isSelfClosing ? ' /' : ''}>`;
    }
  }

  return result;
}

/**
 * Strip all HTML tags (for plain text display).
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}
