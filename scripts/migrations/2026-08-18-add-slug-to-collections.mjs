// Bismillah - Add slug field to collections and populate it for all documents
import dotenv from 'dotenv';
dotenv.config();
const BASE_URL = process.env.LIGHTBASE_BASE_URL;
const API_KEY = process.env.LIGHTBASE_API_KEY;
const PROJECT_ID = process.env.LIGHTBASE_PROJECT_ID;
const headers = { apikey: API_KEY, 'x-lightbase-project': PROJECT_ID, 'Content-Type': 'application/json' };

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}

const cols = [
  { name: 'school_classes', field: 'name' },
  { name: 'school_library_books', field: 'title' },
  { name: 'masjid_events', field: 'title' },
  { name: 'masjid_books', field: 'title' },
];

for (const { name: col, field } of cols) {
  console.log(`\n=== ${col} ===`);

  // 1. Get current schema
  let schema;
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${col}`, { headers });
    schema = await resp.json();
    if (!resp.ok) { console.log('  Schema fetch failed:', resp.status, JSON.stringify(schema).substring(0, 200)); continue; }
  } catch (e) { console.log('  Schema fetch error:', e.message); continue; }

  // 2. Add slug field if missing
  const fields = schema.fields || schema.schema?.fields || [];
  const hasSlug = fields.some(f => f.name === 'slug');
  if (hasSlug) {
    console.log('  slug field already exists in schema');
  } else {
    console.log(`  Adding slug field to schema (current fields: ${fields.length})`);
    fields.push({ name: 'slug', type: 'text', indexed: true });
    const updateBody = { name: col, fields };
    const updResp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${col}`, {
      method: 'PUT', headers, body: JSON.stringify(updateBody)
    });
    if (!updResp.ok) {
      const errBody = await updResp.text();
      console.log('  Schema update failed:', updResp.status, errBody.substring(0, 300));
      continue;
    }
    console.log('  Schema updated with slug field');
  }

  // 3. Fetch all docs
  const docsResp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${col}/docs?limit=200`, { headers });
  const docsData = await docsResp.json();
  const docs = docsData.data || [];
  console.log(`  Found ${docs.length} documents`);

  // 4. Update each doc with slug
  let updated = 0;
  const usedSlugs = new Set();
  for (const doc of docs) {
    const sourceVal = doc[field];
    if (!sourceVal) { console.log(`    SKIP (no ${field}): ${doc.id}`); continue; }
    let slug = slugify(sourceVal);
    if (!slug) { console.log(`    SKIP (empty slug): ${doc.id}`); continue; }
    // Ensure uniqueness
    let finalSlug = slug;
    let counter = 2;
    while (usedSlugs.has(finalSlug)) { finalSlug = `${slug}-${counter}`; counter++; }
    usedSlugs.add(finalSlug);

    if (doc.slug === finalSlug) { updated++; continue; } // already has correct slug

    try {
      const patchResp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${col}/${doc.id}`, {
        method: 'PATCH',
        headers: { ...headers, 'If-Match': String(doc._revision) },
        body: JSON.stringify({ slug: finalSlug })
      });
      if (patchResp.ok) {
        updated++;
      } else {
        const errBody = await patchResp.text();
        console.log(`    PATCH FAIL [${doc.id}]: ${patchResp.status} ${errBody.substring(0, 150)}`);
      }
    } catch (e) {
      console.log(`    PATCH ERROR [${doc.id}]: ${e.message}`);
    }
  }
  console.log(`  Updated ${updated}/${docs.length} documents with slugs`);
}

console.log('\nDone.');
