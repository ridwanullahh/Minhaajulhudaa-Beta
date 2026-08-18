/**
 * Markdown to HTML Renderer
 *
 * A lightweight, dependency-free markdown parser that converts markdown
 * to sanitized HTML. Supports headings, bold, italic, lists, links, images,
 * code blocks, blockquotes, tables, and horizontal rules.
 *
 * Output is safe to use with set:html as it escapes dangerous content
 * and only produces whitelisted HTML tags.
 */

import { sanitizeHtml } from './sanitize';

/**
 * Convert markdown to sanitized HTML.
 *
 * Supported syntax:
 * - # H1, ## H2, ### H3, #### H4, ##### H5, ###### H6
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - ~~strikethrough~~
 * - `inline code`
 * - ```code blocks```
 * - > blockquote
 * - - unordered list items
 * - 1. ordered list items
 * - [link text](url)
 * - ![alt text](image url)
 * - --- horizontal rule
 * - | table | syntax |
 * - Paragraphs (separated by blank lines)
 */
export function renderMarkdown(md: string): string {
  if (!md || typeof md !== 'string') return '';

  const lines = md.split('\n');
  const html: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let inBlockquote = false;
  let blockquoteLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let paragraphLines: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(' ');
      html.push(`<p>${parseInline(text)}</p>`);
      paragraphLines = [];
    }
  }

  function flushList() {
    if (inList && paragraphLines.length === 0) {
      // Lists are handled inline, not via paragraph
    }
  }

  function flushBlockquote() {
    if (blockquoteLines.length > 0) {
      const content = blockquoteLines.join(' ');
      html.push(`<blockquote><p>${parseInline(content)}</p></blockquote>`);
      blockquoteLines = [];
      inBlockquote = false;
    }
  }

  function flushTable() {
    if (tableRows.length === 0) return;
    const header = tableRows[0];
    const separator = tableRows[1];
    const body = tableRows.slice(2);

    // Validate separator row (should be --- or :---:)
    if (separator && separator.every(c => /^:?-+:?$/.test(c.trim()))) {
      let tableHtml = '<table><thead><tr>';
      for (const cell of header) {
        tableHtml += `<th>${parseInline(cell)}</th>`;
      }
      tableHtml += '</tr></thead><tbody>';
      for (const row of body) {
        tableHtml += '<tr>';
        for (const cell of row) {
          tableHtml += `<td>${parseInline(cell)}</td>`;
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';
      html.push(tableHtml);
    } else {
      // Not a valid table, render as text
      for (const row of tableRows) {
        html.push(`<p>${row.join(' | ')}</p>`);
      }
    }
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block fence
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        const code = codeBlockContent.join('\n');
        html.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
        codeBlockContent = [];
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        // Open code block
        flushParagraph();
        flushBlockquote();
        flushTable();
        if (inList) { html.push(`</${inList}>`); inList = null; }
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Empty line - flush pending blocks
    if (trimmed === '') {
      flushParagraph();
      flushBlockquote();
      flushTable();
      if (inList) { html.push(`</${inList}>`); inList = null; }
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      if (inList) { html.push(`</${inList}>`); inList = null; }
      html.push('<hr />');
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      if (inList) { html.push(`</${inList}>`); inList = null; }
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const id = slugifyHeading(text);
      html.push(`<h${level} id="${id}">${parseInline(text)}</h${level}>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushTable();
      if (inList) { html.push(`</${inList}>`); inList = null; }
      inBlockquote = true;
      blockquoteLines.push(trimmed.slice(2));
      continue;
    }

    // Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph();
      flushBlockquote();
      if (inList) { html.push(`</${inList}>`); inList = null; }
      inTable = true;
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Unordered list item
    if (/^[-*+]\s+/.test(trimmed)) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      if (inList === 'ol') { html.push('</ol>'); inList = null; }
      if (!inList) { inList = 'ul'; html.push('<ul>'); }
      const content = trimmed.replace(/^[-*+]\s+/, '');
      html.push(`<li>${parseInline(content)}</li>`);
      continue;
    }

    // Ordered list item
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      if (inList === 'ul') { html.push('</ul>'); inList = null; }
      if (!inList) { inList = 'ol'; html.push('<ol>'); }
      const content = trimmed.replace(/^\d+\.\s+/, '');
      html.push(`<li>${parseInline(content)}</li>`);
      continue;
    }

    // Not a special line - accumulate as paragraph
    if (inList) { html.push(`</${inList}>`); inList = null; }
    if (inBlockquote) { flushBlockquote(); }
    if (inTable) { flushTable(); }
    paragraphLines.push(trimmed);
  }

  // Flush remaining
  if (inCodeBlock) {
    html.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
  }
  flushParagraph();
  flushBlockquote();
  flushTable();
  if (inList) { html.push(`</${inList}>`); }

  // Sanitize the final output for safety
  return sanitizeHtml(html.join('\n'));
}

/**
 * Parse inline markdown: bold, italic, code, links, images.
 */
function parseInline(text: string): string {
  let result = text;

  // Images: ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const safeUrl = isSafeUrl(url) ? url : '#';
    return `<img src="${safeUrl}" alt="${escapeAttr(alt)}" loading="lazy" />`;
  });

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const safeUrl = isSafeUrl(url) ? url : '#';
    const isExternal = safeUrl.startsWith('http');
    return `<a href="${safeUrl}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(text)}</a>`;
  });

  // Bold: **text** or __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  result = result.replace(/~~([^~]+)~~/g, '<s>$1</s>');

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  return result;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isSafeUri(uri: string): boolean {
  const trimmed = uri.trim().toLowerCase();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  try {
    const url = new URL(trimmed);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

// Alias for consistency
const isSafeUrl = isSafeUri;

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Calculate estimated reading time in minutes.
 * @param text The text to analyze
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Extract headings from markdown for table of contents.
 */
export function extractHeadings(md: string): { level: number; text: string; id: string }[] {
  if (!md) return [];
  const headings: { level: number; text: string; id: string }[] = [];
  const lines = md.split('\n');
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugifyHeading(text);
      headings.push({ level, text, id });
    }
  }
  return headings;
}

/**
 * Generate a plain-text excerpt from markdown content.
 */
export function generateExcerpt(md: string, maxLength = 160): string {
  if (!md) return '';
  // Strip markdown syntax
  const plain = md
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`~>_]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength).trim() + '...';
}
