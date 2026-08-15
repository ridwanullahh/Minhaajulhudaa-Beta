Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# PRD: Minhaajulhudaa Masjid Platform (`/masjid`)

## 1. Overview

A comprehensive masjid platform featuring live prayer times, a 24/7 Qur'an player, an audio lab connected to archive.org, a digital library, donation system, events calendar, and a full CMS. Designed for the community, visitors, and masjid administration.

## 2. Public Pages

### 2.1 Homepage
- Live prayer times widget (today's 5 prayers + sunrise)
- Next prayer countdown timer
- Masjid announcements feed
- Quick access: Qur'an player, audio lab, donations
- Upcoming events preview
- Recent khutbah/lecture highlights
- Live stream embed (if available)
- Jumu'ah time reminder

### 2.2 About the Masjid
- History and vision
- Imam and staff profiles
- Facilities and services
- Capacity and location map

### 2.3 Activities & Programs
- Weekly halaqah schedule
- Special programs (Ramadan, Eid, youth)
- Educational classes (Tahfeez, Arabic, Fiqh)
- Community outreach programs

### 2.4 Media Library
- **Audio Library**: Lectures, khutbahs, recitations with filter by speaker/topic/date
- **Video Library**: Recorded programs and live streams
- **Book Library**: Digital PDFs with viewer, search, categories
- App-like browsing experience with player

### 2.5 Audio Player Library
- Full-featured audio player (play, pause, seek, speed, playlist)
- Filter by speaker, topic, date, duration
- Download and share functionality
- Continue listening feature
- Background play support

### 2.6 24/7 Qur'an Player
- Always-accessible Qur'an streaming player
- Select by reciter, surah, or continuous stream
- Minimal, beautiful, controllable interface
- Floating mini-player on all pages

### 2.7 Events Calendar
- Monthly view of masjid events
- Event categories (khutbah, halaqah, special, youth)
- Event detail with time, location, description

### 2.8 Blog
- Articles on Islamic topics
- Categories and tags
- Author profiles

### 2.9 Donation
- One-time and recurring donation options
- Categories: Zakaat, Sadaqah, Waqf, Masjid construction, operational
- Progress tracking for campaigns
- Secure payment integration
- Receipt generation

### 2.10 Contact
- Contact form
- Masjid address and map
- Prayer room contact numbers
- Social media links

## 3. Admin Panel (CMS)

### 3.1 Dashboard
- Donation summary (this month, total)
- Prayer time status
- Recent announcements
- Media upload stats
- Event attendance estimates

### 3.2 Prayer Time Management
- Manual entry/edit of Adhan and Iqamah times
- Monthly schedule view
- CSV upload for bulk schedule import
- Automatic calculation fallback (if API unavailable)
- Hijri date display toggle

### 3.3 Events & Programs
- CRUD for events
- Recurring event support
- Speaker/imam assignment
- Resource attachments

### 3.4 Audio Library Management
- Upload or link audio (archive.org integration)
- Metadata: title, speaker, topic, date, duration
- Category and tag management
- Bulk import from archive.org URLs

### 3.5 Bookstore Management
- Digital books: upload PDF, metadata, categories
- Physical books: inventory, price, orders
- Download tracking

### 3.6 Donation Management
- Campaign CRUD with goals and progress
- Donation records and donor management
- Receipt generation (PDF)
- Recurring donation management
- Financial reports by category

### 3.7 Blog Management
- Article CRUD with rich editor
- Categories and tags
- Author management
- Featured images

### 3.8 Gallery Management
- Photo and video uploads
- Album organization
- Event-linked galleries

### 3.9 Live Stream Management
- Embed live stream URLs
- Schedule live streams
- Archive past streams

### 3.10 Qur'an Player Configuration
- Select default reciter
- Manage streaming sources
- Configure playlist rotations

## 4. Collections (Lightbase Schema)

| Collection | Purpose |
|-----------|---------|
| `masjid_pages` | Static page content |
| `masjid_announcements` | Announcements |
| `masjid_prayer_times` | Daily prayer schedules |
| `masjid_events` | Events and programs |
| `masjid_audios` | Audio lectures/khutbahs |
| `masjid_videos` | Video content |
| `masjid_books` | Digital and physical books |
| `masjid_blog_posts` | Blog articles |
| `masjid_gallery` | Gallery media |
| `masjid_donation_campaigns` | Donation campaigns |
| `masjid_donations` | Donation records |
| `masjid_donors` | Donor profiles |
| `masjid_live_streams` | Live stream configs |
| `masjid_quran_config` | Qur'an player settings |
| `masjid_imams` | Imam/staff profiles |
| `masjid_settings` | Platform settings |

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
