/**
 * Masjid platform seed data - comprehensive production data.
 */

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();
const daysAhead = (d) => new Date(now.getTime() + d * 86400000).toISOString();
const todayStr = now.toISOString().split('T')[0];

// Generate prayer times for next 30 days
function generatePrayerTimes() {
  const times = [];
  const baseTimes = {
    fajrAdhan: '05:15', fajrIqamah: '05:35',
    sunrise: '06:35',
    dhuhrAdhan: '12:45', dhuhrIqamah: '13:05',
    asrAdhan: '16:00', asrIqamah: '16:20',
    maghribAdhan: '18:50', maghribIqamah: '18:55',
    ishaAdhan: '20:05', ishaIqamah: '20:25',
    jumuahAdhan: '13:00', jumuahIqamah: '13:20',
  };

  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    // Add slight daily variation
    const adj = (i % 7) - 3;
    times.push({
      date: dateStr,
      fajrAdhan: `05:${String(15 + adj).padStart(2, '0')}`,
      fajrIqamah: `05:${String(35 + adj).padStart(2, '0')}`,
      sunrise: `06:${String(35 + adj).padStart(2, '0')}`,
      dhuhrAdhan: `12:${String(45 + adj).padStart(2, '0')}`,
      dhuhrIqamah: `13:${String(5 + adj).padStart(2, '0')}`,
      asrAdhan: `16:${String(0 + adj).padStart(2, '0')}`,
      asrIqamah: `16:${String(20 + adj).padStart(2, '0')}`,
      maghribAdhan: `18:${String(50 + adj).padStart(2, '0')}`,
      maghribIqamah: `18:${String(55 + adj).padStart(2, '0')}`,
      ishaAdhan: `20:${String(5 + adj).padStart(2, '0')}`,
      ishaIqamah: `20:${String(25 + adj).padStart(2, '0')}`,
      jumuahAdhan: '13:00',
      jumuahIqamah: '13:20',
    });
  }
  return times;
}

export const masjidSeedData = {
  masjid_pages: [
    {
      slug: 'about',
      title: 'About Minhaajulhudaa Masjid',
      content: [
        { type: 'hero', title: 'About Us', subtitle: 'A center for prayer, learning, and community' },
        { type: 'text', body: 'Minhaajulhudaa Masjid was established in 2020 to serve the growing Muslim community in Lagos. Our masjid provides a spiritual home for daily prayers, Jumu\'ah, Taraweeh during Ramadan, and a center for Islamic learning and community activities.' },
        { type: 'text', body: 'With a capacity of 2,000 worshippers, our facility includes a main prayer hall, sisters\' section, wudu areas, classrooms for Islamic education, a library, and administrative offices. We are committed to following the Qur\'an and Sunnah in all our affairs.' },
      ],
      seoTitle: 'About Minhaajulhudaa Masjid',
      seoDescription: 'Learn about Minhaajulhudaa Masjid - serving the community since 2020.',
      status: 'published',
      publishedAt: daysAgo(30),
      order: 1,
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      content: [
        { type: 'hero', title: 'Get in Touch', subtitle: 'We are here for you' },
      ],
      seoTitle: 'Contact Minhaajulhudaa Masjid',
      seoDescription: 'Contact information for Minhaajulhudaa Masjid.',
      status: 'published',
      publishedAt: daysAgo(30),
      order: 2,
    },
  ],

  masjid_announcements: [
    {
      title: 'Ramadan Timetable Available',
      message: 'The Ramadan timetable for Taraweeh and Sahur is now available. Please pick up a copy at the masjid office or download from our website.',
      type: 'info',
      active: true,
      startsAt: daysAgo(2),
      endsAt: daysAhead(30),
      createdAt: daysAgo(2),
    },
    {
      title: 'New Halaqah Series: Tafsir of Juz Amma',
      message: 'Join us every Tuesday after Maghrib for a new halaqah series on the Tafsir of Juz Amma, led by Imam Yusuf Olatunji.',
      type: 'success',
      active: true,
      startsAt: daysAgo(5),
      endsAt: daysAhead(60),
      createdAt: daysAgo(5),
    },
    {
      title: 'Masjid Expansion Project',
      message: 'Alhamdulillah, we are expanding the sisters\' section to accommodate more worshippers. Please support this project with your donations.',
      type: 'urgent',
      active: true,
      startsAt: daysAgo(10),
      endsAt: daysAhead(90),
      createdAt: daysAgo(10),
    },
  ],

  masjid_prayer_times: generatePrayerTimes(),

  masjid_events: [
    {
      title: 'Tafsir of Juz Amma - Weekly Halaqah',
      description: 'Weekly halaqah exploring the meanings and lessons from the short surahs of the Qur\'an.',
      category: 'halaqah',
      startDate: daysAhead(2),
      endDate: daysAhead(2),
      location: 'Main Prayer Hall',
      speaker: 'Imam Yusuf Olatunji',
      imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800',
      isRecurring: true,
      recurrencePattern: 'weekly-tuesday',
    },
    {
      title: 'Jumu\'ah Khutbah',
      description: 'Weekly Jumu\'ah prayer and khutbah. The khutbah topic this week: "The Importance of Brotherhood in Islam".',
      category: 'khutbah',
      startDate: daysAhead(3),
      endDate: daysAhead(3),
      location: 'Main Prayer Hall',
      speaker: 'Imam Yusuf Olatunji',
      isRecurring: true,
      recurrencePattern: 'weekly-friday',
    },
    {
      title: 'Youth Islamic Studies Class',
      description: 'Interactive Islamic studies class for youth aged 12-18. Topics include Aqeedah, Fiqh, and Seerah.',
      category: 'youth',
      startDate: daysAhead(4),
      endDate: daysAhead(4),
      location: 'Classroom 1',
      speaker: 'Ustadh Abdullah Okafor',
      isRecurring: true,
      recurrencePattern: 'weekly-saturday',
    },
    {
      title: ' sisters\' Tajweed Workshop',
      description: 'Special Tajweed workshop for sisters. Learn to recite the Qur\'an with proper pronunciation.',
      category: 'special',
      startDate: daysAhead(7),
      endDate: daysAhead(7),
      location: 'Sisters\' Section',
      speaker: 'Mrs. Khadijah Suleiman',
      imageUrl: 'https://images.unsplash.com/photo-1591456983933-0d29460ee5b6?w=800',
    },
    {
      title: 'Community Iftar (Monthly)',
      description: 'Monthly community Iftar bringing together brothers and sisters for breaking fast and spiritual reflections.',
      category: 'special',
      startDate: daysAhead(10),
      endDate: daysAhead(10),
      location: 'Masjid Courtyard',
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800',
    },
    {
      title: 'Eid al-Fitr Prayer',
      description: 'Eid prayer and celebration. Takbeerat begin 15 minutes before prayer time.',
      category: 'eid',
      startDate: daysAhead(30),
      endDate: daysAhead(30),
      location: 'Main Prayer Hall',
      speaker: 'Imam Yusuf Olatunji',
      imageUrl: 'https://images.unsplash.com/photo-1591456983933-0d29460ee5b6?w=800',
    },
  ],

  masjid_audios: [
    { title: 'Khutbah: The Importance of Brotherhood', speaker: 'Imam Yusuf Olatunji', topic: 'brotherhood', category: 'khutbah', description: 'A powerful reminder about the importance of brotherhood and unity in the Muslim community.', audioUrl: 'https://archive.org/download/sample-audio/brotherhood-khutbah.mp3', archiveOrgId: 'brotherhood-khutbah-2026', duration: 2400, date: todayStr, imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400', downloads: 124, plays: 892, status: 'active' },
    { title: 'Lecture: Patience in Islam', speaker: 'Imam Yusuf Olatunji', topic: 'patience', category: 'lecture', description: 'Understanding the concept of Sabr (patience) through Qur\'an and Sunnah.', audioUrl: 'https://archive.org/download/sample-audio/patience-lecture.mp3', archiveOrgId: 'patience-lecture-2026', duration: 3600, date: todayStr, imageUrl: 'https://images.unsplash.com/photo-1591456983933-0d29460ee5b6?w=400', downloads: 98, plays: 654, status: 'active' },
    { title: 'Tafsir: Surah Al-Fatihah', speaker: 'Ustadh Abdullah Okafor', topic: 'tafsir', category: 'halaqah', description: 'Deep dive into the meanings of Surah Al-Fatihah, the opening of the Qur\'an.', audioUrl: 'https://archive.org/download/sample-audio/tafsir-fatihah.mp3', archiveOrgId: 'tafsir-fatihah-2026', duration: 4200, date: todayStr, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', downloads: 156, plays: 1102, status: 'active' },
    { title: 'Recitation: Juz Amma - Beautiful Recitation', speaker: 'Imam Yusuf Olatunji', topic: 'recitation', category: 'recitation', description: 'Beautiful recitation of Juz Amma with proper Tajweed.', audioUrl: 'https://archive.org/download/sample-audio/juz-amma.mp3', archiveOrgId: 'juz-amma-recitation', duration: 5400, date: todayStr, imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400', downloads: 234, plays: 1856, status: 'active' },
    { title: 'Khutbah: Gratitude to Allah', speaker: 'Imam Yusuf Olatunji', topic: 'gratitude', category: 'khutbah', description: 'A reminder to be grateful for Allah\'s countless blessings.', audioUrl: 'https://archive.org/download/sample-audio/gratitude-khutbah.mp3', archiveOrgId: 'gratitude-khutbah-2026', duration: 2200, date: todayStr, imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400', downloads: 87, plays: 543, status: 'active' },
    { title: 'Dua: Collection of Daily Adhkar', speaker: 'Ustadh Abdullah Okafor', topic: 'dua', category: 'dua', description: 'Collection of morning and evening adhkar with correct pronunciation.', audioUrl: 'https://archive.org/download/sample-audio/daily-adhkar.mp3', archiveOrgId: 'daily-adhkar-2026', duration: 1800, date: todayStr, imageUrl: 'https://images.unsplash.com/photo-1591456983933-0d29460ee5b6?w=400', downloads: 312, plays: 2104, status: 'active' },
    { title: 'Lecture: The Life of Abu Bakr (RA)', speaker: 'Imam Yusuf Olatunji', topic: 'seerah', category: 'lecture', description: 'Exploring the life and character of the first Caliph, Abu Bakr As-Siddiq (RA).', audioUrl: 'https://archive.org/download/sample-audio/abu-bakr-life.mp3', archiveOrgId: 'abu-bakr-life-2026', duration: 4800, date: todayStr, imageUrl: 'https://images.unsplash.com/photo-1591456983933-0d29460ee5b6?w=400', downloads: 145, plays: 876, status: 'active' },
  ],

  masjid_videos: [
    { title: 'Jumu\'ah Khutbah: Brotherhood in Islam', description: 'Full video of the Jumu\'ah khutbah on the importance of brotherhood.', videoUrl: '', youtubeId: 'dQw4w9WgXcQ', thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400', category: 'khutbah', duration: 2400, date: todayStr, views: 1234, status: 'active' },
    { title: 'Masjid Tour', description: 'Virtual tour of the Minhaajulhudaa Masjid facilities.', videoUrl: '', youtubeId: 'dQw4w9WgXcQ', thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400', category: 'general', duration: 600, date: todayStr, views: 567, status: 'active' },
    { title: 'Qur\'an Recitation - Beautiful', description: 'Beautiful recitation by Imam Yusuf during Taraweeh.', videoUrl: '', youtubeId: 'dQw4w9WgXcQ', thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400', category: 'recitation', duration: 1800, date: todayStr, views: 2103, status: 'active' },
  ],

  masjid_books: [
    { title: 'Riyad as-Saliheen', author: 'Imam Nawawi', category: 'hadith', description: 'The Gardens of the Righteous - a collection of hadiths on ethics and manners.', coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', pdfUrl: '', isDigital: true, price: 0, stock: 0, pages: 700, language: 'English/Arabic', available: true },
    { title: 'Bulugh al-Maram', author: 'Ibn Hajar Asqalani', category: 'fiqh', description: 'Attainment of the Objective - hadiths related to Islamic rulings.', coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', pdfUrl: '', isDigital: true, price: 0, stock: 0, pages: 550, language: 'English/Arabic', available: true },
    { title: 'Kitab at-Tawheed', author: 'Muhammad ibn Abdul-Wahhab', category: 'aqeedah', description: 'The Book of Monotheism - explaining the foundation of Islamic belief.', coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', pdfUrl: '', isDigital: true, price: 0, stock: 0, pages: 300, language: 'English', available: true },
    { title: 'The Sealed Nectar', author: 'Safiur-Rahman Mubarakpuri', category: 'seerah', description: 'Biography of the Prophet Muhammad (PBUH).', coverImageUrl: 'https://images.unsplash.com/photo-1591456983933-0d29460ee5b6?w=400', pdfUrl: '', isDigital: false, price: 3500, stock: 25, pages: 500, language: 'English', available: true },
    { title: 'Fortress of the Muslim', author: 'Said bin Ali al-Qahtani', category: 'dua', description: 'Collection of authentic duas and adhkar for daily life.', coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', pdfUrl: '', isDigital: false, price: 1500, stock: 50, pages: 180, language: 'English/Arabic', available: true },
  ],

  masjid_blog_posts: [
    {
      slug: 'importance-of-congregational-prayer',
      title: 'The Importance of Congregational Prayer',
      excerpt: 'Understanding the significance of praying in congregation and its rewards.',
      content: 'The congregational prayer (Salat al-Jama\'ah) holds great significance in Islam. The Prophet Muhammad (PBUH) said: "The prayer in congregation is twenty-seven times superior to the prayer offered by a person alone."\n\nPraying in congregation brings numerous benefits:\n\n1. Spiritual rewards multiplied 27 times\n2. Unity and brotherhood among Muslims\n3. Regular connection with the community\n4. Accountability and mutual support\n5. Following the Sunnah of the Prophet (PBUH)\n\nAt Minhaajulhudaa Masjid, we encourage all community members to attend congregational prayers, especially Fajr and Isha. The masjid is open for all five daily prayers.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800',
      category: 'worship',
      tags: ['prayer', 'congregation', 'salah'],
      authorName: 'Imam Yusuf Olatunji',
      status: 'published',
      publishedAt: daysAgo(5),
      views: 342,
    },
    {
      slug: 'preparing-for-ramadan',
      title: 'Preparing for Ramadan: A Complete Guide',
      excerpt: 'Practical tips to prepare spiritually, physically, and mentally for the blessed month.',
      content: 'Ramadan is a month of immense blessings and spiritual growth. Proper preparation helps us make the most of this sacred month.\n\n## Spiritual Preparation\n- Increase your voluntary prayers\n- Start fasting on Mondays and Thursdays\n- Increase Qur\'an recitation\n- Make tawbah and mend relationships\n\n## Physical Preparation\n- Adjust your sleep schedule\n- Reduce caffeine gradually\n- Plan your meals for Suhoor and Iftar\n- Stay hydrated\n\n## Mental Preparation\n- Set clear Ramadan goals\n- Plan your daily schedule\n- Limit social media usage\n- Prepare a reading list\n\n## Community Preparation\n- Volunteer at the masjid\n- Plan charity activities\n- Prepare for Taraweeh prayers\n- Reach out to family and friends\n\nMay Allah allow us to reach Ramadan and accept our worship.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800',
      category: 'seasonal',
      tags: ['ramadan', 'preparation', 'worship'],
      authorName: 'Imam Yusuf Olatunji',
      status: 'published',
      publishedAt: daysAgo(12),
      views: 567,
    },
    {
      slug: 'understanding-zakat',
      title: 'Understanding Zakat: The Third Pillar',
      excerpt: 'A comprehensive guide to calculating and paying Zakat correctly.',
      content: 'Zakat is the obligatory annual charity that every adult, sane Muslim who possesses wealth above the Nisab must pay. It is 2.5% of accumulated wealth held for one lunar year.\n\n## Who Must Pay Zakat?\n- Adult Muslims\n- Sane individuals\n- Those whose wealth exceeds the Nisab\n- Wealth held for one full lunar year\n\n## What is Nisab?\nThe Nisab is the minimum amount of wealth a Muslim must own before Zakat becomes obligatory. It is equivalent to 85 grams of gold or 595 grams of silver.\n\n## What is Zakatable?\n- Cash and savings\n- Gold and silver\n- Business inventory\n- Agricultural produce\n- Livestock\n- Investments and stocks\n\n## How to Calculate?\nZakat = 2.5% of total zakatable wealth after deducting immediate debts and expenses.\n\nIf you need help calculating your Zakat, please visit the masjid office. Our team can assist you.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      category: 'education',
      tags: ['zakat', 'charity', 'fiqh'],
      authorName: 'Ustadh Abdullah Okafor',
      status: 'published',
      publishedAt: daysAgo(20),
      views: 423,
    },
  ],

  masjid_gallery: [
    { title: 'Ramadan Taraweeh', description: 'Community Taraweeh prayers during Ramadan.', imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800', category: 'events', eventDate: todayStr, createdAt: daysAgo(15) },
    { title: 'Eid Celebration', description: 'Eid prayer and community celebration.', imageUrl: 'https://images.unsplash.com/photo-1591456983933-0d29460ee5b6?w=800', category: 'events', eventDate: todayStr, createdAt: daysAgo(30) },
    { title: 'Masjid Interior', description: 'Beautiful interior of the main prayer hall.', imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800', category: 'facilities', eventDate: todayStr, createdAt: daysAgo(60) },
    { title: 'Youth Halaqah', description: 'Weekly youth Islamic studies class.', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', category: 'programs', eventDate: todayStr, createdAt: daysAgo(7) },
  ],

  masjid_donation_campaigns: [
    {
      slug: 'masjid-expansion-2026',
      title: 'Masjid Expansion Project 2026',
      description: 'Help us expand the sisters\' section and add more facilities to accommodate our growing community. The expansion includes a larger sisters\' prayer area, additional classrooms, and improved wudu facilities.',
      category: 'construction',
      goalAmount: 25000000,
      raisedAmount: 15750000,
      currency: 'NGN',
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800',
      deadline: '2026-12-31',
      isUrgent: true,
      status: 'active',
      createdAt: daysAgo(60),
    },
    {
      slug: 'monthly-operations',
      title: 'Monthly Masjid Operations',
      description: 'Support the day-to-day operations of the masjid including electricity, water, maintenance, and staff salaries.',
      category: 'operational',
      goalAmount: 2000000,
      raisedAmount: 1340000,
      currency: 'NGN',
      imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800',
      deadline: '2026-12-31',
      isUrgent: false,
      status: 'active',
      createdAt: daysAgo(30),
    },
    {
      slug: 'quran-learning-program',
      title: 'Qur\'an Learning Program',
      description: 'Support our free Qur\'an learning program for children and adults. Funds go towards teaching materials, student supplies, and teacher stipends.',
      category: 'sadaqah',
      goalAmount: 5000000,
      raisedAmount: 2870000,
      currency: 'NGN',
      imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800',
      deadline: '2026-12-31',
      isUrgent: false,
      status: 'active',
      createdAt: daysAgo(45),
    },
    {
      slug: 'ramadan-iftar-program',
      title: 'Ramadan Iftar Program',
      description: 'Provide daily Iftar meals for fasting Muslims during Ramadan. ₦2,500 provides an Iftar for one person.',
      category: 'sadaqah',
      goalAmount: 3000000,
      raisedAmount: 2100000,
      currency: 'NGN',
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800',
      deadline: '2026-09-30',
      isUrgent: true,
      status: 'active',
      createdAt: daysAgo(20),
    },
  ],

  masjid_donations: [
    { campaignId: '', donorName: 'Anonymous', donorEmail: 'anonymous@example.com', donorPhone: '+2348061111111', amount: 50000, currency: 'NGN', category: 'sadaqah', type: 'one-time', method: 'bank_transfer', reference: 'MAS-DON-001', status: 'successful', isAnonymous: true, donatedAt: daysAgo(1) },
    { campaignId: '', donorName: 'Muhammad Ali', donorEmail: 'muhammad.ali@example.com', donorPhone: '+2348062222222', amount: 100000, currency: 'NGN', category: 'construction', type: 'one-time', method: 'card', reference: 'MAS-DON-002', status: 'successful', isAnonymous: false, message: 'May Allah accept', donatedAt: daysAgo(2) },
    { campaignId: '', donorName: 'Fatima Ibrahim', donorEmail: 'fatima.i@example.com', donorPhone: '+2348063333333', amount: 25000, currency: 'NGN', category: 'zakaat', type: 'one-time', method: 'bank_transfer', reference: 'MAS-DON-003', status: 'successful', isAnonymous: false, donatedAt: daysAgo(3) },
    { campaignId: '', donorName: 'Anonymous', donorEmail: 'anon2@example.com', amount: 5000, currency: 'NGN', category: 'sadaqah', type: 'one-time', method: 'mobile_money', reference: 'MAS-DON-004', status: 'successful', isAnonymous: true, donatedAt: daysAgo(4) },
    { campaignId: '', donorName: 'Abdullah Okafor', donorEmail: 'abdullah.o@example.com', donorPhone: '+2348064444444', amount: 75000, currency: 'NGN', category: 'construction', type: 'recurring', method: 'card', reference: 'MAS-DON-005', status: 'successful', isAnonymous: false, message: 'For the expansion project', donatedAt: daysAgo(5) },
  ],

  masjid_donors: [
    { email: 'muhammad.ali@example.com', name: 'Muhammad Ali', phone: '+2348062222222', totalDonated: 250000, donationCount: 5, firstDonationAt: daysAgo(180), lastDonationAt: daysAgo(2), isRecurring: false, tags: ['regular'] },
    { email: 'fatima.i@example.com', name: 'Fatima Ibrahim', phone: '+2348063333333', totalDonated: 125000, donationCount: 3, firstDonationAt: daysAgo(120), lastDonationAt: daysAgo(3), isRecurring: true, tags: ['recurring', 'zakaat'] },
    { email: 'abdullah.o@example.com', name: 'Abdullah Okafor', phone: '+2348064444444', totalDonated: 375000, donationCount: 8, firstDonationAt: daysAgo(200), lastDonationAt: daysAgo(5), isRecurring: true, tags: ['major-donor', 'recurring'] },
    { email: 'anonymous@example.com', name: 'Anonymous', phone: '', totalDonated: 150000, donationCount: 6, firstDonationAt: daysAgo(90), lastDonationAt: daysAgo(1), isRecurring: false, tags: ['anonymous'] },
  ],

  masjid_live_streams: [
    { title: 'Live Jumu\'ah Khutbah', description: 'Live stream of the weekly Jumu\'ah prayer and khutbah.', streamUrl: 'https://www.youtube.com/live', embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCxxxxxxx', isLive: false, scheduledAt: daysAhead(3), thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800' },
    { title: 'Live Taraweeh', description: 'Live stream of Taraweeh prayers during Ramadan.', streamUrl: 'https://www.youtube.com/live', embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCxxxxxxx', isLive: false, scheduledAt: daysAhead(20), thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800' },
  ],

  masjid_quran_config: [
    {
      defaultReciter: 'mishary-rashid-alafasy',
      reciterName: 'Mishary Rashid Alafasy',
      streamUrl: 'https://api.quran.com/api/v4/recitations/1',
      apiSource: 'https://api.quran.com',
      playlists: [
        { name: 'Juz Amma', reciter: 'mishary-rashid-alafasy', surahs: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114] },
        { name: 'Al-Kahf (Friday)', reciter: 'mishary-rashid-alafasy', surahs: [18] },
      ],
      active: true,
    },
  ],

  masjid_imams: [
    { name: 'Imam Yusuf Olatunji', title: 'Chief Imam', role: 'imam', bio: 'Imam Yusuf holds a degree in Islamic Studies and has served as the chief Imam of Minhaajulhudaa Masjid since its establishment in 2020. He specializes in Qur\'an recitation, Tajweed, and Fiqh.', photoUrl: '', email: 'imam.yusuf@minhaajulhudaa.com', phone: '+2348000000002', specializations: ['Qur\'an', 'Tajweed', 'Fiqh', 'Khutbah'], active: true },
    { name: 'Ustadh Abdullah Okafor', title: 'Assistant Imam', role: 'assistant-imam', bio: 'Ustadh Abdullah is the assistant Imam and leads the youth programs. He holds a degree in Arabic and Islamic Studies.', photoUrl: '', email: 'ustadh.abdullah@minhaajulhudaa.com', phone: '+2348017777777', specializations: ['Arabic', 'Youth Education', 'Seerah'], active: true },
    { name: 'Ustadh Ibrahim Musa', title: 'Muadhin', role: 'muadhin', bio: 'Ustadh Ibrahim serves as the Muadhin, calling the Adhan for all five daily prayers with his beautiful voice.', photoUrl: '', email: '', phone: '+2348015555555', specializations: ['Adhan', 'Qur\'an Recitation'], active: true },
    { name: 'Mrs. Khadijah Suleiman', title: 'Sisters\' Coordinator', role: 'teacher', bio: 'Mrs. Khadijah coordinates the sisters\' programs and leads the Tajweed workshops for women.', photoUrl: '', email: 'khadijah.s@minhaajulhudaa.com', phone: '+2348014444444', specializations: ['Tajweed', 'Women\'s Education', 'Arabic'], active: true },
  ],
};
