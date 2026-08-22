// Bismillah - Seed data only (collections already created)
import 'dotenv/config';
import { sharedSeedData } from './seed/shared.mjs';
import { schoolSeedData } from './seed/school.mjs';
import { masjidSeedData } from './seed/masjid.mjs';
import { charitySeedData } from './seed/charity.mjs';
import { travelsSeedData } from './seed/travels.mjs';

const BASE_URL = process.env.LIGHTBASE_BASE_URL;
const API_KEY = process.env.LIGHTBASE_API_KEY;
const PROJECT_ID = process.env.LIGHTBASE_PROJECT_ID;
const headers = { apikey: API_KEY, 'x-lightbase-project': PROJECT_ID, 'Content-Type': 'application/json' };

const allData = { ...sharedSeedData, ...schoolSeedData, ...masjidSeedData, ...charitySeedData, ...travelsSeedData };
const imageFields = ['imageUrl','featuredImageUrl','featuredImage','coverImageUrl','coverUrl','image','logoUrl','avatarUrl','photoUrl'];
const patternMap = {
  school_programs:'/images/patterns/quran.svg', school_blog_posts:'/images/patterns/books.svg',
  school_products:'/images/patterns/books.svg', school_courses:'/images/patterns/books.svg',
  school_events:'/images/patterns/stars.svg', masjid_events:'/images/patterns/mosque.svg',
  masjid_books:'/images/patterns/books.svg', masjid_audios:'/images/patterns/quran.svg',
  masjid_videos:'/images/patterns/mosque.svg', masjid_blog_posts:'/images/patterns/mosque.svg',
  charity_campaigns:'/images/patterns/nature.svg', charity_blog_posts:'/images/patterns/arabesque.svg',
  charity_success_stories:'/images/patterns/nature.svg', travels_packages:'/images/patterns/kaaba.svg',
  travels_blog_posts:'/images/patterns/kaaba.svg', travels_courses:'/images/patterns/quran.svg',
  travels_resources:'/images/patterns/architecture.svg',
};

function sanitize(doc, col) {
  const c = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v === '' || v === undefined) continue;
    if (imageFields.includes(k) && typeof v === 'string' && v.includes('unsplash.com')) {
      c[k] = patternMap[col] || '/images/patterns/arabesque.svg';
    } else {
      c[k] = v;
    }
  }
  return c;
}

let total = 0, errors = 0;
for (const [col, docs] of Object.entries(allData)) {
  if (!Array.isArray(docs) || docs.length === 0) continue;
  let inserted = 0;
  for (const doc of docs) {
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${col}`, {
        method: 'POST', headers, body: JSON.stringify(sanitize(doc, col)),
      });
      if (resp.ok) { inserted++; total++; }
      else { errors++; }
    } catch { errors++; }
  }
  console.log(`${col}: ${inserted}/${docs.length} inserted`);
}

console.log(`\n=== TOTAL: ${total} inserted, ${errors} errors ===`);
