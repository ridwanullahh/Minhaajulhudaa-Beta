// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

// export-seed-data.mjs - Exports all seed data to JSON files for local DB
import fs from 'node:fs';
import path from 'node:path';
import { sharedSeedData } from './seed/shared.mjs';
import { schoolSeedData } from './seed/school.mjs';
import { masjidSeedData } from './seed/masjid.mjs';
import { charitySeedData } from './seed/charity.mjs';
import { travelsSeedData } from './seed/travels.mjs';

const allData = {
  ...sharedSeedData,
  ...schoolSeedData,
  ...masjidSeedData,
  ...charitySeedData,
  ...travelsSeedData,
};

const OUTPUT_DIR = path.join(process.cwd(), 'data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let totalCollections = 0;
let totalDocs = 0;

for (const [collection, docs] of Object.entries(allData)) {
  if (!Array.isArray(docs) || docs.length === 0) continue;
  
  // Replace unsplash URLs with local patterns (Shariah compliance)
  const patternMap = {
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
  
  const patternUrl = patternMap[collection] || '/images/patterns/arabesque.svg';
  const imageFields = ['imageUrl', 'featuredImageUrl', 'featuredImage', 'coverImageUrl', 'coverUrl', 'image', 'logoUrl', 'avatarUrl', 'photoUrl'];
  
  const sanitizedDocs = docs.map(doc => {
    const cleaned = { ...doc };
    for (const field of imageFields) {
      if (cleaned[field] && typeof cleaned[field] === 'string' && cleaned[field].includes('unsplash.com')) {
        cleaned[field] = patternUrl;
      }
    }
    // Remove empty strings (cause validation errors)
    for (const [key, value] of Object.entries(cleaned)) {
      if (value === '' || value === undefined) {
        delete cleaned[key];
      }
    }
    return cleaned;
  });
  
  // Generate IDs if not present
  const docsWithIds = sanitizedDocs.map((doc, i) => {
    if (!doc.id) {
      doc.id = `${collection}_${i}_${Date.now().toString(36)}`;
    }
    // Ensure slug exists for collections that need it
    if (!doc.slug && (doc.title || doc.name)) {
      doc.slug = slugify(doc.title || doc.name);
    }
    return doc;
  });
  
  const filePath = path.join(OUTPUT_DIR, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(docsWithIds, null, 2), 'utf8');
  console.log(`  Exported ${collection}: ${docsWithIds.length} docs -> ${filePath}`);
  totalCollections++;
  totalDocs += docsWithIds.length;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

console.log(`\n=== Export Complete ===`);
console.log(`Collections: ${totalCollections}`);
console.log(`Total documents: ${totalDocs}`);
console.log(`Output: ${OUTPUT_DIR}`);

// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
