/**
 * POST /api/translate
 * Translation endpoint using Google Translate's free web API.
 * Works on Cloudflare Workers (no Node.js dependencies needed).
 *
 * Supports:
 * - Single text: { text, targetLang, sourceLang } -> { translatedText }
 * - Batch: ?batch=true { texts: [], targetLang, sourceLang } -> { translations: {} }
 */

import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse } from '../../lib/validate';

// In-memory cache (per Worker instance)
const translationCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function translateText(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
  if (sourceLang === targetLang || !text?.trim()) return text;
  
  // Check cache
  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.text;
  }
  
  try {
    // Use Google Translate's free web API (no API key needed)
    // This works on Cloudflare Workers via fetch
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Minhaajulhudaa/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Translation API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Google Translate returns [[["translated","original"],...],...]
    // We need to join all translated segments
    if (data && data[0] && Array.isArray(data[0])) {
      let translated = '';
      for (const segment of data[0]) {
        if (segment && segment[0]) {
          translated += segment[0];
        }
      }
      
      // Cache the result
      translationCache.set(cacheKey, {
        text: translated,
        timestamp: Date.now(),
      });
      
      return translated;
    }
    
    return text;
  } catch (error) {
    console.error('[translate] Error:', error);
    return text; // Return original on error
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const isBatch = url.searchParams.get('batch') === 'true';
    const body = await request.json();
    
    if (isBatch) {
      // Batch translation
      const { texts, targetLang, sourceLang = 'en' } = body;
      
      if (!Array.isArray(texts) || !targetLang) {
        return errorResponse('texts (array) and targetLang are required', 400);
      }
      
      if (sourceLang === targetLang) {
        const result: Record<string, string> = {};
        for (const text of texts) result[text] = text;
        return jsonResponse({ translations: result });
      }
      
      // Process in small batches to avoid rate limiting
      const translations: Record<string, string> = {};
      const batchSize = 5;
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const promises = batch.map(async (text: string) => ({
          text,
          translated: await translateText(text, targetLang, sourceLang),
        }));
        const results = await Promise.all(promises);
        for (const r of results) {
          translations[r.text] = r.translated;
        }
        
        // Small delay between batches
        if (i + batchSize < texts.length) {
          await new Promise(r => setTimeout(r, 100));
        }
      }
      
      return jsonResponse({ translations });
    } else {
      // Single translation
      const { text, targetLang, sourceLang = 'en' } = body;
      
      if (!text || !targetLang) {
        return errorResponse('text and targetLang are required', 400);
      }
      
      const translatedText = await translateText(text, targetLang, sourceLang);
      
      return jsonResponse({
        translatedText,
        sourceLang,
        targetLang,
      });
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Translation failed', 500);
  }
};
