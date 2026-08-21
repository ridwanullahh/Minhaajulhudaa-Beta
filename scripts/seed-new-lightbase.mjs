// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

// seed-new-lightbase.mjs - Robust seeding with retry logic for Cloudflare-hosted Lightbase
// The new Lightbase uses GitHub backend which may have delays due to API rate limits.
// This script retries failed operations with exponential backoff.
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
const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 120000; // 120s timeout (GitHub backend is slow)

const allSchemas = [...sharedSchemas, ...schoolSchemas, ...masjidSchemas, ...charitySchemas, ...travelsSchemas];
const allSeedData = { ...sharedSeedData, ...schoolSeedData, ...masjidSeedData, ...charitySeedData, ...travelsSeedData };

const headers = {
  apikey: API_KEY,
  'x-lightbase-project': PROJECT_ID,
  'Content-Type': 'application/json',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), INITIAL_TIMEOUT);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      lastError = err;
      const delay = Math.min(5000 * attempt, 30000); // 5s, 10s, 15s, 20s, 25s
      console.log(`  Attempt ${attempt}/${retries} failed: ${err.message}. Retrying in ${delay/1000}s...`);
      await sleep(delay);
    }
  }
  throw lastError;
}

async function listExistingCollections() {
  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections`,
      { headers }
    );
    const data = await response.json();
    return new Set((data.collections || []).map(c => c.name));
  } catch (err) {
    console.log(`  Failed to list collections: ${err.message}`);
    return new Set();
  }
}

async function createCollection(schema) {
  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(schema),
      }
    );
    if (response.ok) {
      return { success: true };
    }
    const body = await response.text();
    return { success: false, error: `${response.status}: ${body.substring(0, 200)}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function seedCollection(collection, documents) {
  // Sanitize documents: remove empty strings, replace unsplash URLs
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
  
  const patternUrl = patternMap[collection] || '/images/patterns/arabesque.svg';
  const imageFields = ['imageUrl', 'featuredImageUrl', 'featuredImage', 'coverImageUrl', 'coverUrl', 'image', 'logoUrl', 'avatarUrl', 'photoUrl'];
  
  const sanitizedDocs = documents.map(doc => {
    const cleaned = {};
    for (const [key, value] of Object.entries(doc)) {
      if (value === '' || value === undefined) continue;
      if (imageFields.includes(key) && typeof value === 'string' && value.includes('unsplash.com')) {
        cleaned[key] = patternUrl;
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  });
  
  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/api/v1/projects/${PROJECT_ID}/seed`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ collection, documents: sanitizedDocs, dedupOn: [] }),
      }
    );
    if (response.ok) {
      const result = await response.json();
      return { success: true, inserted: result.inserted || 0, skipped: result.skipped || 0 };
    }
    const body = await response.text();
    return { success: false, error: `${response.status}: ${body.substring(0, 200)}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('=== Minhaajulhudaa Lightbase Seeding (Cloudflare Host) ===');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Max retries: ${MAX_RETRIES}`);
  console.log('');

  // 1. Health check
  console.log('Checking health...');
  try {
    const healthResp = await fetchWithRetry(`${BASE_URL}/health`);
    const health = await healthResp.json();
    console.log(`Health: ${health.status} (v${health.version})`);
  } catch (err) {
    console.error(`Health check failed: ${err.message}`);
    process.exit(1);
  }

  // 2. List existing collections
  console.log('\nChecking existing collections...');
  const existing = await listExistingCollections();
  console.log(`Found ${existing.size} existing collections`);

  // 3. Create collections
  console.log(`\n--- Creating ${allSchemas.length} collections ---`);
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const schema of allSchemas) {
    if (existing.has(schema.name)) {
      console.log(`  SKIP (exists): ${schema.name}`);
      skipped++;
      continue;
    }
    process.stdout.write(`  Creating ${schema.name}...`);
    const result = await createCollection(schema);
    if (result.success) {
      console.log(' OK');
      created++;
    } else {
      console.log(` FAIL: ${result.error}`);
      failed++;
    }
  }
  console.log(`\nCollections: ${created} created, ${skipped} skipped, ${failed} failed`);

  // 4. Seed data
  console.log(`\n--- Seeding ${Object.keys(allSeedData).length} collections with data ---`);
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (const [collection, docs] of Object.entries(allSeedData)) {
    if (!Array.isArray(docs) || docs.length === 0) continue;
    process.stdout.write(`  Seeding ${collection} (${docs.length} docs)...`);
    const result = await seedCollection(collection, docs);
    if (result.success) {
      console.log(` OK (${result.inserted} inserted, ${result.skipped} skipped)`);
      totalInserted += result.inserted;
      totalSkipped += result.skipped;
    } else {
      console.log(` FAIL: ${result.error}`);
      totalErrors++;
    }
  }
  
  console.log(`\n=== Seeding Summary ===`);
  console.log(`Collections created: ${created}`);
  console.log(`Documents inserted: ${totalInserted}`);
  console.log(`Documents skipped: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
  
  if (totalErrors > 0) {
    console.log('\nSome collections failed. Run again to retry (idempotent).');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
