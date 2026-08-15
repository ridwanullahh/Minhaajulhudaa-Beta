Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# PRD: Shared Modules - Minhaajulhudaa Platform

## 1. Overview

These shared modules are developed as reusable services/components with global theming. Each platform imports and configures them with platform-specific settings, ensuring consistency and maintainability.

## 2. CMS Engine

### Purpose
A flexible page builder and content management system used by all platforms for static pages, announcements, and site-wide content.

### Features
- **Page Builder**: Modular content blocks (hero, text, image, video, CTA, grid, testimonial, FAQ)
- **Rich Text Editor**: WYSIWYG with formatting, links, images, tables
- **Media Manager**: Upload, organize, optimize, and reuse media across the platform
- **SEO Fields**: Meta title, description, OG tags, canonical URL per page
- **Scheduling**: Publish/unpublish at scheduled times
- **Versioning**: Draft, publish, revert to previous versions
- **Multi-platform**: Each platform has its own pages collection

### Collections
- `{platform}_pages` - Page content with modular blocks
- `{platform}_media` - Media library (shared per platform)

## 3. Blog System

### Purpose
A SEO-friendly blog engine with rich editor, categorization, and tagging.

### Features
- **Rich Editor**: Markdown + WYSIWYG with image embedding
- **Categories**: Hierarchical categories with parent-child
- **Tags**: Flat tagging system
- **Authors**: Author profiles with bio and photo
- **Featured Images**: Per-post featured image
- **SEO**: Meta fields, slug customization, structured data
- **Related Posts**: Automatic and manual selection
- **Comments** (optional): Moderated comments
- **Search**: Full-text search across posts

### Collections
- `{platform}_blog_posts` - Blog articles
- `{platform}_blog_categories` - Categories
- `{platform}_blog_tags` - Tags
- `{platform}_authors` - Author profiles

## 4. Shop System

### Purpose
E-commerce engine for physical and digital products, used by School (books/uniforms), Masjid (bookstore), and Charity (merchandise).

### Features
- **Product CRUD**: Name, description, price, variants, images, category
- **Inventory**: Stock tracking, low-stock alerts
- **Variants**: Size, color, etc.
- **Cart**: Add, remove, update quantity, persistent
- **Checkout**: Shipping info, payment method, order summary
- **Payment Integration**: Paystack and other gateways
- **Orders**: Order management, status tracking
- **Digital Products**: Download links after purchase
- **Discounts**: Coupon codes, percentage/fixed discounts

### Collections
- `{platform}_products` - Product catalog
- `{platform}_product_categories` - Categories
- `{platform}_orders` - Order records
- `{platform}_order_items` - Order line items
- `{platform}_coupons` - Discount codes

## 5. Donation Engine

### Purpose
Customizable donation system supporting multiple campaigns, recurring donations, and receipt generation.

### Features
- **Campaigns**: Create campaigns with goals, deadlines, categories
- **Donation Types**: One-time and recurring (monthly, yearly)
- **Categories**: Zakaat, Sadaqah, Waqf, construction, operational
- **Progress Tracking**: Real-time progress bars
- **Payment Integration**: Secure gateway integration
- **Receipts**: Automatic PDF receipt generation and email
- **Donor Management**: Donor profiles with history
- **Manual Logging**: Record offline donations
- **Reports**: By campaign, category, time period
- **Transparency**: Public progress and fund usage reports

### Collections
- `{platform}_donation_campaigns` - Campaign definitions
- `{platform}_donations` - Donation records
- `{platform}_donors` - Donor profiles
- `{platform}_recurring_donations` - Recurring configs

## 6. LMS Engine

### Purpose
Learning Management System for courses, lessons, quizzes, and progress tracking. Used by School (e-courses), Travels (pre-travel education).

### Features
- **Courses**: CRUD with modules, lessons, prerequisites, pricing
- **Lessons**: Video, text, PDF attachments, duration tracking
- **Quizzes**: Multiple question types, auto-grading, time limits
- **Assignments**: Submission collection and grading
- **Enrollments**: Student-course mappings with progress
- **Progress Tracking**: Lesson completion, quiz scores, certificates
- **Certificates**: Auto-generated on course completion
- **Discussion**: Per-lesson Q&A (optional)
- **Free/Paid**: Free for bookers, paid for others

### Collections
- `{platform}_courses` - Course definitions
- `{platform}_lessons` - Lesson content
- `{platform}_quizzes` - Quiz definitions
- `{platform}_assignments` - Assignments
- `{platform}_enrollments` - Student enrollments
- `{platform}_progress` - Progress records
- `{platform}_certificates` - Issued certificates

## 7. Shared UI Components

### Layout
- `BaseLayout` - HTML shell with theme, fonts, meta
- `PlatformLayout` - Platform header, nav, footer wrapper
- `AdminLayout` - Admin sidebar, topbar, content area

### Navigation
- `Header` - Logo, nav, platform switcher, theme toggle
- `BottomNav` - Mobile bottom tab bar
- `Footer` - Links, contact, social, newsletter
- `PlatformSwitcher` - Dropdown to switch between platforms

### Content
- `Card` - Reusable card component
- `Button` - Primary, accent, ghost variants
- `Badge` - Status and category badges
- `Modal` - Bottom sheet on mobile, dialog on desktop
- `Tabs` - Tab navigation
- `Accordion` - Collapsible content
- `Carousel` - Swipeable image/content carousel
- `Pagination` - Page navigation
- `SearchBar` - Search input with results
- `FilterBar` - Filter controls

### Forms
- `Input` - Text, email, password, etc.
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `Radio` - Radio input
- `FileUpload` - File upload with preview
- `Form` - Form wrapper with validation

### Feedback
- `Toast` - Toast notifications
- `Alert` - Inline alerts
- `Skeleton` - Loading skeletons
- `ProgressBar` - Progress indicators
- `Spinner` - Loading spinner

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
