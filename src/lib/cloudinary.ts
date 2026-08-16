/**
 * Cloudinary media service - server-side only
 * Handles file upload proxy, deletion, and URL generation
 */

import { lightbase } from './lightbase';

const _env = () => ({
  CLOUD_NAME: import.meta.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || '',
  API_KEY: import.meta.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '',
  API_SECRET: import.meta.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET || '',
  UPLOAD_PRESET: import.meta.env.CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET || '',
});

export function isConfigured(): boolean {
  const e = _env();
  return Boolean(e.CLOUD_NAME && e.UPLOAD_PRESET);
}

function detectResourceType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'raw';
}

function generateSignature(params: Record<string, string>): string {
  const { createHmac } = require('node:crypto');
  const e = _env();
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  const toSign = sorted + e.API_SECRET;
  return createHmac('sha1', toSign).digest('hex');
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
}

/**
 * Upload a file to Cloudinary (server-side proxy)
 */
export async function uploadFile(file: File, options: {
  folder?: string;
  resourceType?: string;
  publicId?: string;
  tags?: string[];
  platform?: string;
  uploadedBy?: string;
} = {}): Promise<UploadResult> {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  const e = _env();
  const resourceType = options.resourceType || detectResourceType(file.type);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', e.UPLOAD_PRESET);

  if (options.folder) formData.append('folder', options.folder);
  if (options.publicId) formData.append('public_id', options.publicId);
  if (options.tags?.length) formData.append('tags', options.tags.join(','));

  const uploadUrl = `https://api.cloudinary.com/v1_1/${e.CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, { method: 'POST', body: formData });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const result = await response.json();

  // Record in DB
  if (options.platform) {
    try {
      await lightbase.insert('media', {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        resourceType: result.resource_type,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        folder: options.folder || '',
        tags: options.tags || [],
        platform: options.platform,
        uploadedBy: options.uploadedBy || '',
        createdAt: new Date().toISOString(),
      });
    } catch { /* db record failure non-critical */ }
  }

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    url: result.url,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    resourceType: result.resource_type,
  };
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFile(publicId: string): Promise<boolean> {
  const e = _env();
  const timestamp = Math.round(Date.now() / 1000).toString();
  const sig = generateSignature({ public_id: publicId, timestamp });

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('signature', sig);
  formData.append('api_key', e.API_KEY);
  formData.append('timestamp', timestamp);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${e.CLOUD_NAME}/image/destroy`, {
    method: 'POST', body: formData,
  });

  if (!response.ok) return false;
  const data = await response.json();
  return data.result === 'ok';
}

/**
 * Generate an optimized Cloudinary URL
 */
export function getOptimizedUrl(publicId: string, options: {
  width?: number; height?: number; crop?: string; quality?: string | number; format?: string;
} = {}): string {
  const e = _env();
  const transforms: string[] = [];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.quality) transforms.push(`q_${options.quality}`);
  if (options.format) transforms.push(`f_${options.format}`);
  const tStr = transforms.length > 0 ? transforms.join(',') + '/' : '';
  return `https://res.cloudinary.com/${e.CLOUD_NAME}/image/upload/${tStr}${publicId}`;
}

/**
 * List media from DB by platform
 */
export async function getMediaByPlatform(platform: string, limit = 50) {
  return lightbase.findMany('media', { field: 'platform', op: 'eq', value: platform }, { limit });
}