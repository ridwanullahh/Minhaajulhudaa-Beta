/**
 * Shared collection schemas used across all platforms.
 * Includes admin users, platform settings, and audit logs.
 */

export const sharedSchemas = [
  {
    name: 'platform_admins',
    fields: [
      { name: 'email', type: 'email', required: true, unique: true, indexed: true },
      { name: 'passwordHash', type: 'string', required: true, encrypted: true },
      { name: 'name', type: 'string', required: true, maxLength: 120 },
      { name: 'role', type: 'string', required: true, enum: ['super_admin', 'platform_admin', 'editor', 'author'], default: 'author', indexed: true },
      { name: 'platforms', type: 'array', of: 'string', default: [] },
      { name: 'avatarUrl', type: 'url' },
      { name: 'phone', type: 'phone' },
      { name: 'lastLoginAt', type: 'datetime' },
      { name: 'active', type: 'boolean', default: true, indexed: true },
      { name: 'metadata', type: 'json', default: {} },
    ],
    indexes: [
      { name: 'admins_email_idx', fields: ['email'], unique: true },
      { name: 'admins_role_idx', fields: ['role'] },
    ],
  },
  {
    name: 'platform_settings',
    fields: [
      { name: 'platform', type: 'string', required: true, unique: true, indexed: true, enum: ['school', 'masjid', 'charity', 'travels', 'global'] },
      { name: 'siteName', type: 'string', required: true },
      { name: 'tagline', type: 'string' },
      { name: 'description', type: 'text' },
      { name: 'logoUrl', type: 'url' },
      { name: 'primaryColor', type: 'color', default: '#05B34D' },
      { name: 'accentColor', type: 'color', default: '#F2B91C' },
      { name: 'contactEmail', type: 'email' },
      { name: 'contactPhone', type: 'phone' },
      { name: 'address', type: 'text' },
      { name: 'location', type: 'point' },
      { name: 'socialLinks', type: 'json', default: {} },
      { name: 'paymentConfig', type: 'json', default: {} },
      { name: 'metadata', type: 'json', default: {} },
    ],
    indexes: [
      { name: 'settings_platform_idx', fields: ['platform'], unique: true },
    ],
  },
  {
    name: 'audit_logs',
    fields: [
      { name: 'actor', type: 'string', required: true, indexed: true },
      { name: 'action', type: 'string', required: true, indexed: true },
      { name: 'platform', type: 'string', indexed: true },
      { name: 'collection', type: 'string', indexed: true },
      { name: 'documentId', type: 'string', indexed: true },
      { name: 'ipAddress', type: 'ip' },
      { name: 'userAgent', type: 'string' },
      { name: 'details', type: 'json', default: {} },
      { name: 'timestamp', type: 'datetime' },
    ],
    indexes: [
      { name: 'audit_actor_idx', fields: ['actor'] },
      { name: 'audit_action_idx', fields: ['action'] },
      { name: 'audit_timestamp_idx', fields: ['timestamp'] },
    ],
  },
  {
    name: 'contact_submissions',
    fields: [
      { name: 'platform', type: 'string', required: true, indexed: true, enum: ['school', 'masjid', 'charity', 'travels'] },
      { name: 'name', type: 'string', required: true, maxLength: 120 },
      { name: 'email', type: 'email', required: true, indexed: true },
      { name: 'phone', type: 'phone' },
      { name: 'subject', type: 'string', required: true, maxLength: 200 },
      { name: 'message', type: 'text', required: true, maxLength: 5000 },
      { name: 'status', type: 'string', enum: ['new', 'read', 'replied', 'archived'], default: 'new', indexed: true },
      { name: 'department', type: 'string', default: 'general' },
      { name: 'createdAt', type: 'datetime' },
    ],
    indexes: [
      { name: 'contact_platform_status_idx', fields: ['platform', 'status'] },
    ],
  },
];
