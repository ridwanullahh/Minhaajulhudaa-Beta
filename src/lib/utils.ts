/**
 * General utility functions
 */

export function formatDate(dateStr: string, format: 'short' | 'long' | 'date' | 'time' = 'short'): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  switch (format) {
    case 'long':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    case 'date':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    case 'time':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s()-]/g, ''));
}

export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(submitted: string, expected: string): boolean {
  return submitted && expected && submitted === expected;
}

export function getPaginationParams(url: URL): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function createPaginationMeta(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getPlatformFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/(school|masjid|charity|travels)(?:\/|$)/);
  return match ? match[1] : null;
}
