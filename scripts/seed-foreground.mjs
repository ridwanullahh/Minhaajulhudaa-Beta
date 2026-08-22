// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

// seed-foreground.mjs - Foreground seeding with verification
// Creates each collection, verifies it exists, then inserts documents one by one.
import 'dotenv/config';
import { sharedSeedData } from './seed/shared.mjs';
import { schoolSeedData } from './seed/school.mjs';
import { masjidSeedData } from './seed/masjid.mjs';
import { charitySeedData } from './seed/charity.mjs';
import { travelsSeedData } from './seed/travels.mjs';
import { sharedSchemas } from './schemas/shared.mjs';
import { schoolSchemas } from './schemas/school.mjs';
import { masjidSchemas } from './schemas/masjid.mjs';
import { charitySchemas } from './schemas/charity.mjs';
import { travelsSchemas } from './schemas/travels.mjs';

const BASE_URL = process.env.LIGHTBASE_BASE_URL || 'https://lightbase.pages.dev';
const API_KEY = process.env.LIGHTBASE_API_KEY;
const PROJECT_ID = process.env.LIGHTBASE_PROJECT_ID || 'minhaajulhuda-beta';

const allSchemas = [...sharedSchemas, ...schoolSchemas, ...masjidSchemas, ...charitySchemas, ...travelsSchemas];
const allSeedData = { ...sharedSeedData, ...schoolSeedData, ...masjidSeedData, ...charitySeedData, ...travelsSeedData };

const headers = {
  apikey: API_KEY,
  'x-lightbase-project': PROJECT_ID,
  'Content-Type': 'application/json',
};

const imageFields = ['imageUrl', 'featuredImageUrl', 'featuredImage', 'coverImageUrl', 'coverUrl', 'image', 'logoUrl', 'avatarUrl', 'photoUrl'];
const patternMap = {
  school_programs: '/images/patterns/quran.svg',
  school_blog_posts: '/images/patterns/books.svg',
  school_products: '/images/patterns/books.svg',
  school_courses: '/images/patterns/books.svg',
  school_events: '/images/patterns/stars.svg',
  school_gallery_albums: '/images/patterns/architecture.svg',
  school_testimonials: '/images/patterns/arabesque.svg',
  school_library_books: '/images/patterns/books.svg',
  school_staff: '/images/patterns/arabesque.svg',
  masjid_events: '/images/patterns/mosque.svg',
  masjid_books: '/images/patterns/books.svg',
  masjid_audios: '/images/patterns/quran.svg',
  masjid_videos: '/images/patterns/mosque.svg',
  masjid_blog_posts: '/images/patterns/mosque.svg',
  masjid_gallery: '/images/patterns/architecture.svg',
  masjid_imams: '/images/patterns/quran.svg',
  masjid_donation_campaigns: '/images/patterns/arabesque.svg',
  charity_campaigns: '/images/patterns/nature.svg',
  charity_blog_posts: '/images/patterns/arabesque.svg',
  charity_success_stories: '/images/patterns/nature.svg',
  charity_testimonials: '/images/patterns/arabesque.svg',
  charity_partners: '/images/patterns/lattice.svg',
  travels_packages: '/images/patterns/kaaba.svg',
  travels_blog_posts: '/images/patterns/kaaba.svg',
  travels_courses: '/images/patterns/quran.svg',
  travels_resources: '/images/patterns/architecture.svg',
  travels_reviews: '/images/patterns/stars.svg',
};

function sanitizeDoc(doc, collection) {
  const cleaned = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value === '' || value === undefined) continue;
    if (imageFields.includes(key) && typeof value === 'string' && value.includes('unsplash.com')) {
      cleaned[key] = patternMap[collection] || '/images/patterns/arabesque.svg';
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

async function fetchWithTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function listCollections() {
  const resp = await fetchWithTimeout(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections`, { headers });
  const data = await resp.json();
  return new Set((data.collections || []).map(c => c.name));
}

async function createCollection(schema) {
  // Convert old field types to R2-compatible types
  const convertedSchema = {
    name: schema.name,
    fields: schema.fields.map(f => {
      const converted = { name: f.name, type: f.type };
      // Map old types to R2-compatible types
      const typeMap = {
        'string': 'text',
        'email': 'text',
        'phone': 'text',
        'url': 'text',
        'array': 'json',
        'object': 'json',
        'richtext': 'text',
        'longtext': 'text',
        'markdown': 'text',
      };
      if (typeMap[f.type]) {
        converted.type = typeMap[f.type];
      }
      // Only keep supported properties
      if (f.required) converted.required = true;
      if (f.unique) converted.unique = true;
      if (f.indexed) converted.indexed = true;
      return converted;
    }),
  };
  const resp = await fetchWithTimeout(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections`, {
    method: 'POST', headers, body: JSON.stringify(convertedSchema),
  });
  return resp.ok;
}

async function insertDoc(collection, doc) {
  const resp = await fetchWithTimeout(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${collection}`, {
    method: 'POST', headers, body: JSON.stringify(doc),
  });
  return resp.ok;
}

async function main() {
  console.log(`=== Seeding ${PROJECT_ID} ===`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Key: ${API_KEY?.substring(0, 20)}...`);
  console.log('');

  // 1. List existing collections
  console.log('Checking existing collections...');
  const existing = await listCollections();
  console.log(`Found ${existing.size} existing collections`);

  // 2. Create missing collections
  console.log(`\n--- Creating ${allSchemas.length} collections ---`);
  let created = 0;
  let alreadyExist = 0;
  let failed = 0;
  
  for (const schema of allSchemas) {
    if (existing.has(schema.name)) {
      alreadyExist++;
      continue;
    }
    process.stdout.write(`  Creating ${schema.name}...`);
    try {
      const ok = await createCollection(schema);
      if (ok) {
        // Wait 500ms for R2 eventual consistency
        await new Promise(r => setTimeout(r, 500));
        console.log(' OK');
        created++;
      } else {
        console.log(' FAIL');
        failed++;
      }
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
      failed++;
    }
  }
  console.log(`Collections: ${created} created, ${alreadyExist} existed, ${failed} failed`);

  // 3. Wait for all collections to be consistent, then re-list
  console.log('\nWaiting 5s for R2 consistency...');
  await new Promise(r => setTimeout(r, 5000));
  const afterCreate = await listCollections();
  console.log(`Total collections after creation: ${afterCreate.size}`);

  // If some collections are missing, try creating them again
  const missing = allSchemas.filter(s => !afterCreate.has(s.name));
  if (missing.length > 0) {
    console.log(`\n--- Retrying ${missing.length} missing collections ---`);
    for (const schema of missing) {
      process.stdout.write(`  Creating ${schema.name}...`);
      try {
        const ok = await createCollection(schema);
        await new Promise(r => setTimeout(r, 1000));
        console.log(ok ? ' OK' : ' FAIL');
      } catch (err) {
        console.log(` ERROR: ${err.message}`);
      }
    }
    await new Promise(r => setTimeout(r, 3000));
    const afterRetry = await listCollections();
    console.log(`Collections after retry: ${afterRetry.size}`);
    afterCreate.clear();
    afterCreate.forEach = afterRetry.forEach;
    for (const name of afterRetry) afterCreate.add(name);
  }

  // 4. Seed data
  console.log(`\n--- Seeding data ---`);
  let totalInserted = 0;
  let totalErrors = 0;
  
  for (const [collection, docs] of Object.entries(allSeedData)) {
    if (!Array.isArray(docs) || docs.length === 0) continue;
    if (!afterCreate.has(collection)) {
      console.log(`  SKIP ${collection} (collection doesn't exist)`);
      totalErrors++;
      continue;
    }
    
    process.stdout.write(`  ${collection} (${docs.length} docs)...`);
    let inserted = 0;
    let errors = 0;
    
    for (const doc of docs) {
      const sanitized = sanitizeDoc(doc, collection);
      try {
        const ok = await insertDoc(collection, sanitized);
        if (ok) inserted++;
        else errors++;
      } catch {
        errors++;
      }
    }
    
    console.log(` ${inserted} inserted, ${errors} errors`);
    totalInserted += inserted;
    totalErrors += errors;
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Collections: ${afterCreate.size}`);
  console.log(`Documents inserted: ${totalInserted}`);
  console.log(`Errors: ${totalErrors}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llash wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
