Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# PRD: Minhaajulhudaa School Platform (`/school`)

## 1. Overview

A full-featured Islamic school management platform combining a public-facing website with a complete CMS, LMS, e-commerce, e-library, wiki, e-courses, online exam system, and student portal. Designed for parents, students, staff, and administrators.

## 2. Public Pages

### 2.1 Homepage
- Hero section with school mission statement and enrollment CTA
- Mission, Vision, and Values cards
- Why Choose Us section with key differentiators
- Features showcase (LMS, e-library, exams, sports)
- Classes overview carousel
- Programs grid (academic, Islamic studies, extracurricular)
- Statistics block (students, staff, graduates, awards)
- Testimonials from parents and alumni
- News & events preview
- CTA banner for admission

### 2.2 About Us
- School history and founding story
- Leadership team profiles
- Staff directory with photos and roles
- Accreditations and affiliations
- Facilities gallery

### 2.3 Programs
- Archive page with filter by category (academic, Islamic, extracurricular)
- Single program page with curriculum, duration, requirements, outcomes

### 2.4 Admission
- Admission process timeline
- Requirements checklist
- Online admission form (multi-step: personal info, academic history, program selection, documents upload, review)
- Application status tracker

### 2.5 Classes Directory
- Archive with filter by level (primary, secondary, senior)
- Single class page: teacher, schedule, curriculum, capacity, enrollment status

### 2.6 School Calendar & Events
- Monthly calendar view
- Event listing with categories (exam, holiday, sports, parent-teacher)
- Single event detail page

### 2.7 News & Blog
- Article archive with category and tag filters
- Single article page with author bio, related posts
- Search functionality

### 2.8 Gallery
- Photo gallery with albums
- Video gallery
- Lightbox viewer

### 2.9 E-Payment
- Fee payment portal
- Invoice lookup by student ID
- Payment history
- Multiple payment methods

### 2.10 E-Commerce Store
- Product archive (books, uniforms, supplies) with category filter
- Single product page with variants
- Cart with quantity management
- Checkout with shipping and payment
- Order confirmation and tracking

### 2.11 E-Library
- Book archive with search, category, author filters
- Single book page with PDF viewer, download (for members)
- Reading progress tracking

### 2.12 Wiki / Knowledgebase
- Article archive with category tree
- Single article page with table of contents
- Search and cross-references

### 2.13 E-Courses
- Course archive with category and level filters
- Single course landing page with curriculum, instructor, price
- Enrollment flow

### 2.14 Contact
- Contact form with department routing
- Map and address
- Phone, email, social links

## 3. Admin Panel (CMS)

### 3.1 Dashboard
- Key metrics: students, revenue, pending applications, active courses
- Recent activity feed
- Quick action shortcuts

### 3.2 Content Management
- **Pages**: CRUD for About, Contact, and custom pages with rich text editor
- **Blog Posts**: Rich editor, categories, tags, featured image, SEO fields, scheduled publishing
- **Announcements**: Site-wide banners with scheduling
- **Events**: Calendar management with recurrence
- **Gallery**: Album and media management

### 3.3 Academic Management
- **Student Records**: Full CRUD, enrollment status, academic history, guardian info
- **Staff Profiles**: CRUD with roles, subjects, bio, photo
- **Classes**: CRUD with teacher assignment, schedule, capacity
- **Programs**: CRUD with curriculum editor
- **Academic Schedules**: Term/semester planning

### 3.4 Admission Management
- Application review pipeline (pending, reviewed, accepted, rejected)
- Application detail view with all submitted data
- Bulk actions (accept, reject, waitlist)
- Communication log per application

### 3.5 LMS (Learning Management System)
- **Courses**: CRUD with modules, lessons, prerequisites
- **Lessons**: Video/text content, attachments, duration tracking
- **Quizzes**: Question bank, multiple question types, auto-grading
- **Assignments**: Create, collect submissions, grade with feedback
- **Enrollments**: Manage student-course mappings
- **Progress Tracking**: Per-student lesson completion, quiz scores, certificates

### 3.6 Online Exam System
- Exam creation with question pool
- Time limits and scheduling
- Auto-grading for objective questions
- Manual grading for subjective
- Result publication and analytics

### 3.7 Student Portal
- **Dashboard**: Enrolled courses, upcoming deadlines, recent grades
- **Results**: Term-wise results with GPA
- **Assignments**: Submit and view feedback
- **Messages**: Communicate with teachers
- **Schedule**: Personal timetable
- **Fee Status**: Outstanding and paid fees

### 3.8 Payment System
- Fee structure management (tuition, transport, uniforms, etc.)
- Invoice generation
- Payment tracking and reconciliation
- Receipt generation (PDF)
- Outstanding fee alerts

### 3.9 School Shop
- Product CRUD with inventory
- Order management
- Sales reports
- Inventory alerts

### 3.10 Media Manager
- Upload, organize, and manage all media assets
- Folder structure
- Image optimization on upload
- Reusable across content

## 4. Collections (Lightbase Schema)

| Collection | Purpose |
|-----------|---------|
| `school_pages` | Static page content |
| `school_blog_posts` | Blog articles |
| `school_announcements` | Site announcements |
| `school_events` | Calendar events |
| `school_gallery_albums` | Photo albums |
| `school_media` | Media assets |
| `school_students` | Student records |
| `school_staff` | Staff profiles |
| `school_classes` | Class definitions |
| `school_programs` | Academic programs |
| `school_admission_applications` | Admission forms |
| `school_courses` | LMS courses |
| `school_lessons` | Course lessons |
| `school_quizzes` | Quiz definitions |
| `school_assignments` | Assignments |
| `school_enrollments` | Student-course mappings |
| `school_exam_schedules` | Exam schedules |
| `school_exam_results` | Exam results |
| `school_fees` | Fee structures |
| `school_invoices` | Invoices |
| `school_payments` | Payment records |
| `school_products` | Shop products |
| `school_orders` | Shop orders |
| `school_library_books` | E-library books |
| `school_wiki_articles` | Knowledgebase |
| `school_testimonials` | Testimonials |
| `school_messages` | Student-teacher messages |
| `school_settings` | Platform settings |

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
