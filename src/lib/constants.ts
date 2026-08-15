/**
 * App-wide constants for Minhaajulhudaa Platform
 */

export const PLATFORMS = {
  school: {
    name: 'School',
    slug: 'school',
    path: '/school',
    tagline: 'Islamic Education Excellence',
    description: 'Nurturing minds with knowledge and faith',
    accent: 'gold',
  },
  masjid: {
    name: 'Masjid',
    slug: 'masjid',
    path: '/masjid',
    tagline: 'Community & Worship',
    description: 'A center for prayer, learning, and community',
    accent: 'green',
  },
  charity: {
    name: 'Charity',
    slug: 'charity',
    path: '/charity',
    tagline: 'Serving Humanity',
    description: 'Bringing relief and hope to those in need',
    accent: 'green',
  },
  travels: {
    name: 'Travels',
    slug: 'travels',
    path: '/travels',
    tagline: 'Hajj & Umrah Services',
    description: 'Your trusted partner for sacred journeys',
    accent: 'gold',
  },
} as const;

export type PlatformSlug = keyof typeof PLATFORMS;

export const BRAND = {
  name: 'Minhaajulhudaa',
  fullName: 'Minhaajulhudaa',
  tagline: 'Guiding to the Right Path',
  colors: {
    primary: '#05B34D',
    accent: '#F2B91C',
    dark: '#181F25',
    bg: '#E9FBF1',
    white: '#FFFFFF',
  },
} as const;

export const NAV_ITEMS = {
  school: [
    { label: 'Home', href: '/school' },
    { label: 'About', href: '/school/about' },
    { label: 'Programs', href: '/school/programs' },
    { label: 'Admission', href: '/school/admission' },
    { label: 'Classes', href: '/school/classes' },
    { label: 'Calendar', href: '/school/calendar' },
    { label: 'News', href: '/school/news' },
    { label: 'Shop', href: '/school/shop' },
    { label: 'Library', href: '/school/library' },
    { label: 'Courses', href: '/school/courses' },
    { label: 'Contact', href: '/school/contact' },
  ],
  masjid: [
    { label: 'Home', href: '/masjid' },
    { label: 'About', href: '/masjid/about' },
    { label: 'Programs', href: '/masjid/programs' },
    { label: 'Quran', href: '/masjid/quran' },
    { label: 'Audios', href: '/masjid/audios' },
    { label: 'Library', href: '/masjid/library' },
    { label: 'Events', href: '/masjid/events' },
    { label: 'Blog', href: '/masjid/blog' },
    { label: 'Donate', href: '/masjid/donate' },
    { label: 'Contact', href: '/masjid/contact' },
  ],
  charity: [
    { label: 'Home', href: '/charity' },
    { label: 'About', href: '/charity/about' },
    { label: 'Campaigns', href: '/charity/campaigns' },
    { label: 'How to Help', href: '/charity/how-to-help' },
    { label: 'Blog', href: '/charity/blog' },
    { label: 'Stories', href: '/charity/stories' },
    { label: 'FAQ', href: '/charity/faq' },
    { label: 'Contact', href: '/charity/contact' },
  ],
  travels: [
    { label: 'Home', href: '/travels' },
    { label: 'About', href: '/travels/about' },
    { label: 'Hajj & Umrah', href: '/travels/hajj-umrah' },
    { label: 'Tours', href: '/travels/tours' },
    { label: 'Book', href: '/travels/book' },
    { label: 'Reviews', href: '/travels/reviews' },
    { label: 'Guide', href: '/travels/guide' },
    { label: 'Courses', href: '/travels/courses' },
    { label: 'Blog', href: '/travels/blog' },
    { label: 'Contact', href: '/travels/contact' },
  ],
} as const;

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  PLATFORM_ADMIN: 'platform_admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
} as const;

export const DONATION_CATEGORIES = [
  'zakaat',
  'sadaqah',
  'waqf',
  'construction',
  'operational',
  'emergency',
  'orphans',
  'water',
  'food',
  'education',
] as const;

export const PAYMENT_METHODS = [
  'card',
  'bank_transfer',
  'cash',
  'mobile_money',
  'ussd',
] as const;

export const STATUS_COLORS: Record<string, string> = {
  active: 'badge-primary',
  pending: 'badge-accent',
  completed: 'badge-primary',
  cancelled: '',
  rejected: '',
  approved: 'badge-primary',
};
