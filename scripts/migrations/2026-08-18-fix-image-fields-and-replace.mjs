// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

// fix-image-fields-and-replace.mjs
// 1. For each collection with image fields, change url-typed image fields to text
// 2. Then replace all unsplash URLs with local Shariah-compliant SVG patterns

import dotenv from 'dotenv';
dotenv.config();
const BASE_URL = process.env.LIGHTBASE_BASE_URL;
const API_KEY = process.env.LIGHTBASE_API_KEY;
const PROJECT_ID = process.env.LIGHTBASE_PROJECT_ID;
const headers = { apikey: API_KEY, 'x-lightbase-project': PROJECT_ID, 'Content-Type': 'application/json' };

const imageFieldNames = ['imageUrl', 'featuredImageUrl', 'featuredImage', 'cover_image_url', 'coverImageUrl', 'coverUrl', 'image', 'logoUrl', 'avatarUrl', 'photoUrl', 'thumbnailUrl'];

const collectionPatternMap = {
  school_programs: '/images/patterns/quran.svg',
  school_blog_posts: '/images/patterns/books.svg',
  school_products: '/images/patterns/books.svg',
  school_courses: '/images/patterns/books.svg',
  school_gallery_albums: '/images/patterns/architecture.svg',
  school_testimonials: '/images/patterns/arabesque.svg',
  school_events: '/images/patterns/stars.svg',
  school_announcements: '/images/patterns/stars.svg',
  school_staff: '/images/patterns/arabesque.svg',
  school_library_books: '/images/patterns/books.svg',
  masjid_events: '/images/patterns/mosque.svg',
  masjid_books: '/images/patterns/books.svg',
  masjid_audios: '/images/patterns/quran.svg',
  masjid_videos: '/images/patterns/mosque.svg',
  masjid_blog_posts: '/images/patterns/mosque.svg',
  masjid_gallery: '/images/patterns/architecture.svg',
  masjid_announcements: '/images/patterns/mosque.svg',
  masjid_imams: '/images/patterns/quran.svg',
  masjid_live_streams: '/images/patterns/mosque.svg',
  masjid_donation_campaigns: '/images/patterns/arabesque.svg',
  charity_campaigns: '/images/patterns/nature.svg',
  charity_blog_posts: '/images/patterns/arabesque.svg',
  charity_success_stories: '/images/patterns/nature.svg',
  charity_testimonials: '/images/patterns/arabesque.svg',
  charity_partners: '/images/patterns/lattice.svg',
  charity_products: '/images/patterns/arabesque.svg',
  travels_packages: '/images/patterns/kaaba.svg',
  travels_blog_posts: '/images/patterns/kaaba.svg',
  travels_courses: '/images/patterns/quran.svg',
  travels_resources: '/images/patterns/architecture.svg',
  travels_reviews: '/images/patterns/stars.svg',
};

let totalSchemaUpdated = 0;
let totalDocsUpdated = 0;
let totalErrors = 0;

for (const [collection, patternUrl] of Object.entries(collectionPatternMap)) {
  console.log(`\n=== ${collection} ===`);

  // 1. Get current schema
  let schema;
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${collection}`, { headers });
    if (!resp.ok) { console.log(`  Schema fetch failed: ${resp.status}`); totalErrors++; continue; }
    schema = await resp.json();
  } catch (e) { console.log(`  Schema error: ${e.message}`); totalErrors++; continue; }

  const fields = schema.fields || schema.collection?.fields || [];
  if (fields.length === 0) { console.log(`  No fields in schema (schemaless)`); }

  // 2. Change url-typed image fields to text
  let schemaChanged = false;
  for (const field of fields) {
    if (imageFieldNames.includes(field.name) && (field.type === 'url' || field.type === 'URL')) {
      field.type = 'text';
      schemaChanged = true;
    }
  }

  if (schemaChanged) {
    const updateBody = { name: collection, fields };
    const updResp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${collection}`, {
      method: 'PUT', headers, body: JSON.stringify(updateBody)
    });
    if (updResp.ok) {
      console.log(`  Schema updated (url -> text for image fields)`);
      totalSchemaUpdated++;
    } else {
      const errBody = await updResp.text();
      console.log(`  Schema update FAILED: ${updResp.status} ${errBody.substring(0, 200)}`);
      totalErrors++;
      continue;
    }
  }

  // 3. Fetch all docs and replace unsplash URLs
  const docsResp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${collection}/docs?limit=300`, { headers });
  if (!docsResp.ok) { console.log(`  Docs fetch failed: ${docsResp.status}`); continue; }
  const docsData = await docsResp.json();
  const docs = docsData.data || [];

  let colUpdated = 0;
  for (const doc of docs) {
    const updates = {};
    let needsUpdate = false;
    for (const field of imageFieldNames) {
      const val = doc[field];
      if (val && typeof val === 'string' && val.includes('unsplash.com')) {
        updates[field] = patternUrl;
        needsUpdate = true;
      }
    }
    if (!needsUpdate) continue;

    try {
      const patchResp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${collection}/${doc.id}`, {
        method: 'PATCH',
        headers: { ...headers, 'If-Match': String(doc._revision) },
        body: JSON.stringify(updates),
      });
      if (patchResp.ok) { colUpdated++; totalDocsUpdated++; }
      else { totalErrors++; console.log(`  PATCH FAIL [${doc.id}]: ${patchResp.status}`); }
    } catch (e) { totalErrors++; console.log(`  PATCH ERROR: ${e.message}`); }
  }
  console.log(`  Updated ${colUpdated}/${docs.length} docs`);
}

console.log(`\n=== SUMMARY ===`);
console.log(`Schemas updated: ${totalSchemaUpdated}`);
console.log(`Documents updated: ${totalDocsUpdated}`);
console.log(`Errors: ${totalErrors}`);

// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
