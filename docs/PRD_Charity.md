Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# PRD: Minhaajulhudaa Charity Foundation Platform (`/charity`)

## 1. Overview

A donation-driven charity platform supporting multi-campaign fundraising (Zakaat, water, food, orphans, education), volunteer management, impact tracking, beneficiary database, and an optional charity shop. Designed for donors, volunteers, beneficiaries, and admins.

## 2. Public Pages

### 2.1 Homepage
- Hero with mission statement and donate CTA
- Active campaigns carousel with progress bars
- Impact statistics (families helped, meals served, water wells built)
- How to Help section (donate, volunteer, spread word)
- Recent success stories
- Testimonials from beneficiaries and partners
- Partner logos
- Newsletter signup

### 2.2 About Us
- Mission, vision, and values
- Organization history
- Leadership team
- Legal status and registrations
- Annual reports (downloadable)
- Financial transparency section

### 2.3 Projects & Campaigns
- Campaign archive with category filter (Zakaat, Water, Food, Orphans, Education, Emergency)
- Active vs completed filter
- Single campaign page: description, goal, progress, beneficiary info, updates, donate button
- Urgent campaigns highlight

### 2.4 How to Help
- Donate (one-time, recurring, specific campaign)
- Volunteer signup
- Fundraise for us
- Corporate partnerships
- In-kind donations

### 2.5 Blog
- Articles on charity work, Islamic perspective on giving
- Categories and tags
- Author profiles

### 2.6 FAQ
- Categorized questions
- Search functionality
- Common donation and volunteer questions

### 2.7 Testimonials
- Beneficiary stories with photos and videos
- Donor testimonials
- Partner endorsements

### 2.8 Success Stories / Showcases
- Completed project showcase with before/after
- Impact metrics per project
- Photo and video galleries

### 2.9 Contact
- Contact form with department routing
- Office addresses
- Phone, email, social

## 3. Admin Panel (CMS)

### 3.1 Dashboard
- Donation totals (today, month, year, all-time)
- Active campaigns overview
- Volunteer count and pending applications
- Beneficiary count
- Recent activity feed

### 3.2 Projects & Campaigns Management
- Campaign CRUD with goal, deadline, category
- Progress tracking (manual + auto from donations)
- Campaign updates feed
- Image and video gallery per campaign
- Urgent flag

### 3.3 Donation Management
- Donation records with donor info, amount, campaign, date
- Manual donation logging (offline donations)
- Recurring donation management
- Receipt generation (PDF, email)
- Refund processing
- Export to CSV

### 3.4 Donor Management
- Donor profiles with giving history
- Communication preferences
- Tax receipt generation
- Donor segmentation and tags

### 3.5 Volunteer Management
- Volunteer applications review
- Role-based assignments
- Skill and availability tracking
- Event/task assignment
- Communication tools

### 3.6 Beneficiary Database (Admin Only)
- Beneficiary profiles (encrypted sensitive data)
- Assistance history
- Needs assessment
- Verification status

### 3.7 Impact Tracker
- Metrics dashboard (meals served, families helped, wells built, etc.)
- Per-campaign impact
- Monthly/yearly reports
- Photo and story documentation

### 3.8 Success Stories Management
- Story CRUD with photos, videos, metrics
- Before/after documentation
- Publication scheduling

### 3.9 Testimonials Management
- Testimonial CRUD
- Approval workflow
- Photo and video attachments

### 3.10 Blog Management
- Article CRUD
- Categories and tags
- Author management

### 3.11 Financial Reports
- Income vs expense by category
- Campaign-wise financial breakdown
- Donor retention analytics
- Exportable reports (PDF, CSV)

### 3.12 Charity Shop (Optional)
- Product CRUD (merchandise for fundraising)
- Order management
- Inventory tracking
- Sales reports

### 3.13 Email Notifications & Receipts
- Donation receipt templates
- Campaign update newsletters
- Volunteer coordination emails
- Donor impact reports

## 4. Collections (Lightbase Schema)

| Collection | Purpose |
|-----------|---------|
| `charity_pages` | Static page content |
| `charity_campaigns` | Donation campaigns |
| `charity_campaign_updates` | Campaign updates |
| `charity_donations` | Donation records |
| `charity_donors` | Donor profiles |
| `charity_recurring_donations` | Recurring donation configs |
| `charity_volunteers` | Volunteer applications/profiles |
| `charity_volunteer_roles` | Role definitions |
| `charity_beneficiaries` | Beneficiary records (encrypted) |
| `charity_impact_metrics` | Impact tracking data |
| `charity_success_stories` | Success story showcases |
| `charity_testimonials` | Testimonials |
| `charity_blog_posts` | Blog articles |
| `charity_faq` | FAQ entries |
| `charity_partners` | Partner organizations |
| `charity_products` | Charity shop products |
| `charity_orders` | Charity shop orders |
| `charity_reports` | Financial reports |
| `charity_settings` | Platform settings |

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
