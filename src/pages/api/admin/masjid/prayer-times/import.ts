import type { APIRoute } from 'astro';
import lightbase from '../../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../../lib/auth';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]; });
    rows.push(row);
  }
  return rows;
}

export const POST: APIRoute = async ({ request }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'masjid')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!file.name.endsWith('.csv')) {
      return new Response(JSON.stringify({ error: 'Only CSV files are accepted' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'CSV is empty or has invalid format' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const expectedColumns = ['date', 'fajr', 'fajr_iqamah', 'dhuhr', 'dhuhr_iqamah', 'asr', 'asr_iqamah', 'maghrib', 'maghrib_iqamah', 'isha', 'isha_iqamah'];
    const headers = Object.keys(rows[0]);
    const missing = expectedColumns.filter(c => !headers.includes(c));
    if (missing.length > 0) {
      return new Response(JSON.stringify({ error: `Missing columns: ${missing.join(', ')}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const now = new Date().toISOString();
    const inserts = rows.map(row => ({
      collection: 'masjid_prayer_times',
      document: {
        date: row.date,
        fajr: row.fajr,
        fajr_iqamah: row.fajr_iqamah,
        dhuhr: row.dhuhr,
        dhuhr_iqamah: row.dhuhr_iqamah,
        asr: row.asr,
        asr_iqamah: row.asr_iqamah,
        maghrib: row.maghrib,
        maghrib_iqamah: row.maghrib_iqamah,
        isha: row.isha,
        isha_iqamah: row.isha_iqamah,
        createdAt: now,
        updatedAt: now,
      },
    }));

    const result = await lightbase.bulk(inserts);
    return new Response(JSON.stringify({ success: true, imported: result.inserted, total: rows.length, errors: result.errors }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
