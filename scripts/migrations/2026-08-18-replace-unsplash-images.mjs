// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

// replace-images.mjs - Replace all unsplash URLs with Shariah-compliant local SVG patterns
import dotenv from 'dotenv';
dotenv.config();
const BASE_URL = process.env.LIGHTBASE_BASE_URL;
const API_KEY = process.env.LIGHTBASE_API_KEY;
const PROJECT_ID = process.env.LIGHTBASE_PROJECT_ID;
const headers = { apikey: API_KEY, 'x-lightbase-project': PROJECT_ID, 'Content-Type': 'application/json' };

// Map collections to pattern types based on content theme
const collectionPatternMap = {
  // School - education/quran themes
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

  // Masjid - worship themes
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

  // Charity - community/nature themes
  charity_campaigns: '/images/patterns/nature.svg',
  charity_blog_posts: '/images/patterns/arabesque.svg',
  charity_success_stories: '/images/patterns/nature.svg',
  charity_testimonials: '/images/patterns/arabesque.svg',
  charity_partners: '/images/patterns/lattice.svg',
  charity_products: '/images/patterns/arabesque.svg',

  // Travels - Hajj/Umrah themes
  travels_packages: '/images/patterns/kaaba.svg',
  travels_blog_posts: '/images/patterns/kaaba.svg',
  travels_courses: '/images/patterns/quran.svg',
  travels_resources: '/images/patterns/architecture.svg',
  travels_reviews: '/images/patterns/stars.svg',
};

const imageFields = ['imageUrl', 'featuredImageUrl', 'featuredImage', 'coverImageUrl', 'coverUrl', 'image', 'logoUrl', 'avatarUrl', 'photoUrl'];

let totalUpdated = 0;
let totalSkipped = 0;
let totalErrors = 0;

for (const [collection, patternUrl] of Object.entries(collectionPatternMap)) {
  console.log(`\n=== ${collection} -> ${patternUrl} ===`);
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${collection}/docs?limit=300`, { headers });
    if (!resp.ok) { console.log(`  SKIP: HTTP ${resp.status}`); continue; }
    const data = await resp.json();
    const docs = data.data || [];
    let colUpdated = 0;

    for (const doc of docs) {
      const updates = {};
      let needsUpdate = false;
      for (const field of imageFields) {
        const val = doc[field];
        if (val && typeof val === 'string' && val.includes('unsplash.com')) {
          updates[field] = patternUrl;
          needsUpdate = true;
        }
      }
      if (!needsUpdate) { totalSkipped++; continue; }

      try {
        const patchResp = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections/${collection}/${doc.id}`, {
          method: 'PATCH',
          headers: { ...headers, 'If-Match': String(doc._revision) },
          body: JSON.stringify(updates),
        });
        if (patchResp.ok) {
          colUpdated++;
          totalUpdated++;
        } else {
          totalErrors++;
          console.log(`  PATCH FAIL [${doc.id}]: ${patchResp.status}`);
        }
      } catch (e) {
        totalErrors++;
        console.log(`  PATCH ERROR [${doc.id}]: ${e.message}`);
      }
    }
    console.log(`  Updated ${colUpdated}/${docs.length} documents`);
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
    totalErrors++;
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total updated: ${totalUpdated}`);
console.log(`Total skipped (no unsplash): ${totalSkipped}`);
console.log(`Total errors: ${totalErrors}`);

// Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
