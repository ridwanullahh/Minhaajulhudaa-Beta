/**
 * Translation Service
 *
 * Client-side translation service that provides:
 * - Runtime translation via /api/translate endpoint
 * - Client-side caching (localStorage) for fast re-translation
 * - No page refresh needed (translates DOM in-place)
 * - Full page coverage (all text nodes)
 * - RTL support for Arabic, Hebrew, Persian, Urdu
 * - MutationObserver for dynamic content
 *
 * Adapted from the Multilingualguide.md for Astro (non-React) architecture.
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'GB' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'SA' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'PT' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: 'CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: 'JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'KR' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: 'PK' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'TR' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: 'IR' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: 'ID' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: 'MY' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: 'KE' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: 'NG' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: 'NG' },
];

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
const CACHE_KEY_PREFIX = 'i18n_cache_';
const CACHE_VERSION = '1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const BATCH_SIZE = 20;
const BATCH_DELAY = 300; // ms between batches
const TRANSLATE_ENDPOINT = '/api/translate';

class TranslationService {
  private currentLang: string = 'en';
  private cache: Map<string, string> = new Map();
  private translating: boolean = false;
  private observer: MutationObserver | null = null;
  private translatedNodes: WeakSet<Node> = new WeakSet();
  private pendingTranslations: Map<string, Promise<string>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentLang = this.getStoredLanguage();
      this.loadCache();
    }
  }

  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  isRTL(lang?: string): boolean {
    const language = lang || this.currentLang;
    return RTL_LANGUAGES.includes(language);
  }

  getCurrentLanguage(): string {
    return this.currentLang;
  }

  getStoredLanguage(): string {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && SUPPORTED_LANGUAGES.find(l => l.code === saved)) return saved;
    const browserLang = navigator.language.split('-')[0];
    return SUPPORTED_LANGUAGES.find(l => l.code === browserLang) ? browserLang : 'en';
  }

  setLanguage(lang: string): void {
    if (typeof window === 'undefined') return;
    if (!SUPPORTED_LANGUAGES.find(l => l.code === lang)) return;
    
    // If switching back to English, restore original text
    if (lang === 'en') {
      this.restoreOriginalText();
      this.currentLang = 'en';
      localStorage.setItem('preferredLanguage', 'en');
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
      return;
    }
    
    // If already in a translated language, restore first
    if (this.currentLang !== 'en') {
      this.restoreOriginalText();
    }
    
    this.currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = this.isRTL(lang) ? 'rtl' : 'ltr';
    
    // Translate the page without refresh
    this.translatePage();
  }

  private loadCache(): void {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${this.currentLang}_${CACHE_VERSION}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        for (const [text, entry] of Object.entries(parsed)) {
          const entryObj = entry as { translation: string; timestamp: number };
          if (now - entryObj.timestamp < CACHE_DURATION) {
            this.cache.set(text, entryObj.translation);
          }
        }
      }
    } catch {}
  }

  private saveCache(): void {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${this.currentLang}_${CACHE_VERSION}`;
      const cacheObj: Record<string, { translation: string; timestamp: number }> = {};
      const now = Date.now();
      for (const [text, translation] of this.cache.entries()) {
        cacheObj[text] = { translation, timestamp: now };
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheObj));
    } catch {}
  }

  async translateText(text: string, targetLang?: string): Promise<string> {
    const target = targetLang || this.currentLang;
    if (target === 'en' || !text?.trim()) return text;
    
    // Check cache
    const cacheKey = `${target}:${text}`;
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }
    
    // Check pending
    if (this.pendingTranslations.has(cacheKey)) {
      return this.pendingTranslations.get(cacheKey)!;
    }
    
    const promise = this.callTranslateApi(text, target);
    this.pendingTranslations.set(cacheKey, promise);
    
    try {
      const result = await promise;
      this.cache.set(text, result);
      return result;
    } finally {
      this.pendingTranslations.delete(cacheKey);
    }
  }

  private async callTranslateApi(text: string, targetLang: string): Promise<string> {
    try {
      const response = await fetch(TRANSLATE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, sourceLang: 'en' }),
      });
      if (!response.ok) return text;
      const data = await response.json();
      return data.translatedText || text;
    } catch {
      return text;
    }
  }

  async translateBatch(texts: string[], targetLang?: string): Promise<Record<string, string>> {
    const target = targetLang || this.currentLang;
    if (target === 'en') {
      const result: Record<string, string> = {};
      for (const text of texts) result[text] = text;
      return result;
    }
    
    // Filter cached vs uncached
    const uncached: string[] = [];
    const result: Record<string, string> = {};
    for (const text of texts) {
      if (this.cache.has(text)) {
        result[text] = this.cache.get(text)!;
      } else {
        uncached.push(text);
      }
    }
    
    if (uncached.length === 0) return result;
    
    // Batch translate via API
    try {
      const response = await fetch(`${TRANSLATE_ENDPOINT}?batch=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: uncached, targetLang: target, sourceLang: 'en' }),
      });
      if (response.ok) {
        const data = await response.json();
        const translations = data.translations || {};
        for (const text of uncached) {
          const translated = translations[text] || text;
          result[text] = translated;
          this.cache.set(text, translated);
        }
        this.saveCache();
      } else {
        // Fallback: translate individually
        for (const text of uncached) {
          result[text] = await this.translateText(text, target);
        }
      }
    } catch {
      // Fallback: return original
      for (const text of uncached) {
        result[text] = text;
      }
    }
    
    return result;
  }

  /**
   * Translate the entire page without refresh.
   * Collects all text nodes, batches translation, and updates DOM in-place.
   */
  async translatePage(): Promise<void> {
    if (this.translating || this.currentLang === 'en') return;
    this.translating = true;
    
    try {
      // Collect all translatable text nodes
      const texts = this.collectTextNodes();
      if (texts.length === 0) {
        this.translating = false;
        return;
      }
      
      // Process in batches
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const textContents = batch.map(item => item.originalText);
        const translations = await this.translateBatch(textContents);
        
        for (const item of batch) {
          const translated = translations[item.originalText] || item.originalText;
          if (translated !== item.originalText) {
            this.updateTextNode(item, translated);
          }
        }
        
        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < texts.length) {
          await new Promise(r => setTimeout(r, BATCH_DELAY));
        }
      }
      
      this.saveCache();
      
      // Start observing for dynamic content
      this.startObserving();
    } finally {
      this.translating = false;
    }
  }

  interface TextNodeInfo {
    node: Text;
    originalText: string;
    parent: Element | null;
  }

  private collectTextNodes(): TextNodeInfo[] {
    const texts: TextNodeInfo[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node: Text) => {
          // Skip script, style, and already-translated nodes
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.getAttribute('data-no-translate') === 'true') {
            return NodeFilter.FILTER_REJECT;
          }
          if (this.translatedNodes.has(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          const text = node.textContent?.trim();
          if (!text || text.length < 2) {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip URLs, code, numbers-only
          if (/^https?:\/\//.test(text)) return NodeFilter.FILTER_REJECT;
          if (/^\d+$/.test(text)) return NodeFilter.FILTER_REJECT;
          if (parent.tagName === 'CODE' || parent.tagName === 'PRE') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const text = node.textContent || '';
      if (text.trim()) {
        texts.push({
          node,
          originalText: text.trim(),
          parent: node.parentElement,
        });
      }
    }
    
    return texts;
  }

  private updateTextNode(item: TextNodeInfo, translated: string): void {
    // Store original text as data attribute for restoration
    if (item.parent && !item.parent.hasAttribute('data-original-text')) {
      item.parent.setAttribute('data-original-text', item.originalText);
    }
    item.node.textContent = translated;
    this.translatedNodes.add(item.node);
  }

  restoreOriginalText(): void {
    this.stopObserving();
    // Restore all elements that have data-original-text
    const elements = document.querySelectorAll('[data-original-text]');
    elements.forEach(el => {
      const original = el.getAttribute('data-original-text');
      if (original) {
        // Find the text node and restore
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = original;
            this.translatedNodes.delete(node);
            break;
          }
        }
        el.removeAttribute('data-original-text');
      }
    });
  }

  private startObserving(): void {
    if (this.observer) return;
    this.observer = new MutationObserver((mutations) => {
      if (this.currentLang === 'en' || this.translating) return;
      
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE && !this.translatedNodes.has(node)) {
            const text = node.textContent?.trim();
            if (text && text.length > 2) {
              this.translateText(text).then(translated => {
                if (translated !== text) {
                  const parent = (node as Text).parentElement;
                  if (parent && !parent.hasAttribute('data-original-text')) {
                    parent.setAttribute('data-original-text', text);
                  }
                  node.textContent = translated;
                  this.translatedNodes.add(node);
                }
              });
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Translate text nodes within added elements
            const element = node as Element;
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            const texts: string[] = [];
            while (walker.nextNode()) {
              const text = walker.currentNode.textContent?.trim();
              if (text && text.length > 2 && !this.translatedNodes.has(walker.currentNode)) {
                texts.push(text);
              }
            }
            if (texts.length > 0) {
              this.translateBatch(texts).then(translations => {
                const walker2 = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                while (walker2.nextNode()) {
                  const text = walker2.currentNode.textContent?.trim();
                  if (text && translations[text]) {
                    const parent = (walker2.currentNode as Text).parentElement;
                    if (parent && !parent.hasAttribute('data-original-text')) {
                      parent.setAttribute('data-original-text', text);
                    }
                    walker2.currentNode.textContent = translations[text];
                    this.translatedNodes.add(walker2.currentNode);
                  }
                }
              });
            }
          }
        }
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  formatNumber(number: number, lang?: string): string {
    const language = lang || this.currentLang;
    return new Intl.NumberFormat(language).format(number);
  }

  formatDate(date: Date | string, lang?: string, options?: Intl.DateTimeFormatOptions): string {
    const language = lang || this.currentLang;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat(language, defaultOptions).format(dateObj);
  }

  formatCurrency(amount: number, currency: string = 'NGN', lang?: string): string {
    const language = lang || this.currentLang;
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

// Singleton
export const translationService = new TranslationService();
export default translationService;
