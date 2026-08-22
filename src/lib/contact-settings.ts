/**
 * Contact Settings Utility
 *
 * Reads contact information from the platform_settings collection in the DB.
 * Falls back to defaults if not found.
 * Used by Footer, Contact pages, and other areas that display contact info.
 */

import { lightbase } from './lightbase';

export interface ContactSettings {
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  whatsapp: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  mapEmbedUrl: string;
  officeHours: string;
  logoUrl: string;
}

const DEFAULT_SETTINGS: ContactSettings = {
  phone: '+234 800 000 0000',
  email: 'info@minhaajulhudaa.org',
  address: '123 Islamic Education Road',
  city: 'Lagos',
  country: 'Nigeria',
  whatsapp: '+234 800 000 0000',
  facebook: '',
  twitter: '',
  instagram: '',
  youtube: '',
  mapEmbedUrl: '',
  officeHours: 'Monday - Friday: 8:00 AM - 4:00 PM',
  logoUrl: '',
};

// Cache for 5 minutes
let cachedSettings: ContactSettings | null = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getContactSettings(platform?: string): Promise<ContactSettings> {
  const now = Date.now();
  if (cachedSettings && now < cacheExpiry) {
    return cachedSettings;
  }

  try {
    const key = platform ? `contact_${platform}` : 'contact_general';
    const doc = await lightbase.findOne('platform_settings', { field: 'key', op: 'eq', value: key });
    if (doc && doc.value) {
      const settings = { ...DEFAULT_SETTINGS, ...doc.value };
      cachedSettings = settings;
      cacheExpiry = now + CACHE_DURATION;
      return settings;
    }
  } catch (err) {
    console.error('[contact-settings] Failed to load:', err);
  }

  return DEFAULT_SETTINGS;
}

export function getDefaultContactSettings(): ContactSettings {
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save contact settings to the DB.
 */
export async function saveContactSettings(settings: ContactSettings, platform?: string): Promise<void> {
  const key = platform ? `contact_${platform}` : 'contact_general';
  try {
    await lightbase.upsert('platform_settings', { field: 'key', op: 'eq', value: key }, {
      key,
      value: settings,
      platform: platform || 'general',
      updatedAt: new Date().toISOString(),
    });
    // Invalidate cache
    cachedSettings = null;
    cacheExpiry = 0;
  } catch (err) {
    console.error('[contact-settings] Failed to save:', err);
    throw err;
  }
}
