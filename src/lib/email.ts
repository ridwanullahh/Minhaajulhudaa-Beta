/**
 * Email service with Gmail SMTP support
 * Supports both App Password and OAuth2 Refresh Token authentication
 * Server-side only
 */

import { createTransport, type Transporter } from 'nodemailer';
import { lightbase } from './lightbase';

const _env = () => ({
  SMTP_HOST: import.meta.env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(import.meta.env.SMTP_PORT || process.env.SMTP_PORT || '587', 10),
  SMTP_USERNAME: import.meta.env.SMTP_USERNAME || process.env.SMTP_USERNAME || '',
  SMTP_PASSWORD: import.meta.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD || '',
  SMTP_FROM_NAME: import.meta.env.SMTP_FROM_NAME || process.env.SMTP_FROM_NAME || 'Minhaajulhudaa',
  GOOGLE_CLIENT_ID: import.meta.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: import.meta.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REFRESH_TOKEN: import.meta.env.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN || '',
  FROM_EMAIL: import.meta.env.FROM_EMAIL || process.env.FROM_EMAIL || '',
  SITE_URL: import.meta.env.SITE_URL || process.env.SITE_URL || 'http://localhost:4321',
});

export function isConfigured(): boolean {
  const e = _env();
  return Boolean(
    (e.SMTP_USERNAME && e.SMTP_PASSWORD) ||
    (e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET && e.GOOGLE_REFRESH_TOKEN)
  );
}

// === OAuth2 Access Token ===
let _cachedAccessToken: string | null = null;
let _tokenExpiry = 0;

async function getOAuth2AccessToken(): Promise<string> {
  if (_cachedAccessToken && Date.now() < _tokenExpiry) {
    return _cachedAccessToken;
  }
  const e = _env();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: e.GOOGLE_CLIENT_ID,
      client_secret: e.GOOGLE_CLIENT_SECRET,
      refresh_token: e.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!response.ok) throw new Error(`OAuth2 token fetch failed: ${response.status}`);
  const data = await response.json();
  _cachedAccessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _cachedAccessToken;
}

async function createTransporter(): Promise<Transporter> {
  const e = _env();
  const useOAuth2 = Boolean(e.GOOGLE_CLIENT_ID && e.GOOGLE_REFRESH_TOKEN);
  const fromEmail = e.FROM_EMAIL || e.SMTP_USERNAME;

  if (useOAuth2) {
    const accessToken = await getOAuth2AccessToken();
    return createTransport({
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_PORT === 465,
      auth: { type: 'OAuth2', user: e.SMTP_USERNAME, accessToken },
    });
  }

  return createTransport({
    host: e.SMTP_HOST,
    port: e.SMTP_PORT,
    secure: e.SMTP_PORT === 465,
    auth: { user: e.SMTP_USERNAME, pass: e.SMTP_PASSWORD },
  });
}

async function sendEmail(to: string | string[], subject: string, html: string): Promise<boolean> {
  const e = _env();
  const transporter = await createTransporter();
  const fromEmail = e.FROM_EMAIL || e.SMTP_USERNAME;
  const from = `"${e.SMTP_FROM_NAME}" <${fromEmail}>`;

  await transporter.sendMail({ from, to: Array.isArray(to) ? to.join(', ') : to, subject, html });
  return true;
}

// === HTML Email Templates ===

type PlatformKey = 'school' | 'masjid' | 'charity' | 'travels' | 'general';

const PLATFORM_BRAND: Record<PlatformKey, { name: string; color: string }> = {
  school: { name: 'Minhaajulhudaa Islamic School', color: '#05B34D' },
  masjid: { name: 'Minhaajulhudaa Masjid', color: '#05B34D' },
  charity: { name: 'Minhaajulhudaa Charity', color: '#F2B91C' },
  travels: { name: 'Minhaajulhudaa Travels', color: '#05B34D' },
  general: { name: 'Minhaajulhudaa', color: '#05B34D' },
};

function emailShell(platform: PlatformKey, subject: string, preheader: string, contentHtml: string): string {
  const brand = PLATFORM_BRAND[platform];
  const e = _env();
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
<style>
body{margin:0;padding:0;font-family:'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f4f5;-webkit-font-smoothing:antialiased}
.wrapper{max-width:600px;margin:0 auto;padding:24px 16px}
.card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.header{background:${brand.color};padding:32px;text-align:center}
.header h1{margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-.02em}
.header p{margin:8px 0 0;font-size:14px;color:rgba(255,255,255,.85)}
.body{padding:32px}
.body h2{margin:0 0 12px;font-size:20px;font-weight:600;color:#181F25}
.body p{margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46}
.highlight{background:#f0fdf4;border-left:4px solid ${brand.color};padding:16px;border-radius:0 8px 8px 0;margin:16px 0}
.highlight p{margin:0;color:#166534}
.btn{display:inline-block;background:${brand.color};color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:16px 0}
.data-table{width:100%;border-collapse:collapse;margin:16px 0}
.data-table td{padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#3f3f46}
.data-table td:first-child{font-weight:600;color:#181F25;width:40%}
.footer{padding:24px 32px;background:#fafafa;text-align:center;border-top:1px solid #e4e4e7}
.footer p{margin:0;font-size:12px;color:#a1a1aa}
.footer a{color:${brand.color};text-decoration:none}
@media only screen and (max-width:480px){.wrapper{padding:12px 8px}.header,.body,.footer{padding-left:20px;padding-right:20px}.header h1{font-size:18px}.data-table td{font-size:13px;padding:8px}}
</style></head>
<body><div class="wrapper"><div class="card">
<div class="header"><h1>${brand.name}</h1><p>${preheader}</p></div>
<div class="body">${contentHtml}</div>
<div class="footer"><p>${brand.name}</p><p style="margin-top:4px">This email was sent to you. If you did not expect this, please ignore it.</p></div>
</div></div></body></html>`;
}

// === Template Renderers ===

const TEMPLATES: Record<string, (vars: Record<string, string>) => { platform: PlatformKey; subject: string; preheader: string; body: string }> = {
  welcome: (v) => ({
    platform: (v.platform as PlatformKey) || 'general',
    subject: `Welcome to ${v.platform_name || 'Minhaajulhudaa'}`,
    preheader: 'Your account has been created successfully',
    body: `<h2>Assalamu Alaikum, ${v.name}!</h2><p>Welcome to ${v.platform_name || 'Minhaajulhudaa'}. We are excited to have you join our community.</p><p>You can now access all features and resources available on the platform.</p><a href="${v.site_url || '#'}" class="btn">Get Started</a>`,
  }),
  otp_verification: (v) => ({
    platform: (v.platform as PlatformKey) || 'general',
    subject: 'Email Verification Code',
    preheader: 'Verify your email address',
    body: `<h2>Verify Your Email</h2><p>Hi ${v.name},</p><p>Your verification code is:</p><div class="highlight"><p style="font-size:28px;font-weight:700;letter-spacing:.1em;text-align:center;color:#181F25">${v.otp}</p></div><p>This code expires in ${v.otp_expiry || '10'} minutes. If you did not request this, please ignore this email.</p>`,
  }),
  password_reset: (v) => ({
    platform: (v.platform as PlatformKey) || 'general',
    subject: 'Password Reset Request',
    preheader: 'Reset your password',
    body: `<h2>Password Reset</h2><p>Hi ${v.name},</p><p>Your password reset code is:</p><div class="highlight"><p style="font-size:28px;font-weight:700;letter-spacing:.1em;text-align:center;color:#181F25">${v.otp}</p></div><p>This code expires in ${v.otp_expiry || '10'} minutes.</p>`,
  }),
  payment_receipt: (v) => ({
    platform: (v.platform as PlatformKey) || 'general',
    subject: `Payment Receipt - ${v.reference}`,
    preheader: 'Your payment was successful',
    body: `<h2>Payment Confirmed</h2><p>Hi ${v.name},</p><p>Your payment has been processed successfully.</p><table class="data-table"><tr><td>Amount</td><td>${v.currency || 'NGN'} ${v.amount}</td></tr><tr><td>Reference</td><td>${v.reference}</td></tr><tr><td>Platform</td><td>${v.platform_name || v.platform}</td></tr><tr><td>Date</td><td>${v.date}</td></tr></table><p>Thank you for your payment. May Allah bless you.</p>`,
  }),
  donation_receipt: (v) => ({
    platform: 'charity',
    subject: `Donation Receipt - ${v.reference}`,
    preheader: 'Your donation was received',
    body: `<h2>Jazakallahu Khairan!</h2><p>Dear ${v.name},</p><p>Your generous donation has been received for ${v.campaign || 'our causes'}.</p><table class="data-table"><tr><td>Amount</td><td>${v.currency || 'NGN'} ${v.amount}</td></tr><tr><td>Campaign</td><td>${v.campaign || 'General'}</td></tr><tr><td>Reference</td><td>${v.reference}</td></tr><tr><td>Date</td><td>${v.date}</td></tr></table><p>May Allah reward you abundantly for your contribution.</p>`,
  }),
  booking_confirmation: (v) => ({
    platform: 'travels',
    subject: `Booking Confirmed - ${v.package_title || 'Your Trip'}`,
    preheader: 'Your travel booking is confirmed',
    body: `<h2>Booking Confirmed!</h2><p>Hi ${v.name},</p><p>Your travel booking has been confirmed.</p><table class="data-table"><tr><td>Package</td><td>${v.package_title || 'N/A'}</td></tr><tr><td>Travel Date</td><td>${v.travel_date || 'TBD'}</td></tr><tr><td>Travelers</td><td>${v.travelers || '1'}</td></tr><tr><td>Total</td><td>${v.currency || 'NGN'} ${v.amount}</td></tr><tr><td>Reference</td><td>${v.reference}</td></tr></table><p>Prepare for a blessed journey, InshaAllah.</p>`,
  }),
  admission_received: (v) => ({
    platform: 'school',
    subject: 'Admission Application Received',
    preheader: 'We have received your application',
    body: `<h2>Application Received</h2><p>Dear ${v.name},</p><p>We have received your admission application for ${v.program || 'our program'}. Our team will review it within 3-5 business days.</p><p>Reference: <strong>${v.reference}</strong></p>`,
  }),
  volunteer_registered: (v) => ({
    platform: 'charity',
    subject: 'Volunteer Registration Confirmed',
    preheader: 'Welcome to our volunteer team',
    body: `<h2>Welcome, Volunteer!</h2><p>Dear ${v.name},</p><p>Thank you for registering as a volunteer. We will notify you of upcoming opportunities.</p>`,
  }),
  contact_received: (v) => ({
    platform: (v.platform as PlatformKey) || 'general',
    subject: `We received your message`,
    preheader: 'Your message has been received',
    body: `<h2>Message Received</h2><p>Hi ${v.name},</p><p>Thank you for contacting ${v.platform_name || 'Minhaajulhudaa'}. We will respond within 24-48 hours.</p>`,
  }),
  course_enrollment: (v) => ({
    platform: (v.platform as PlatformKey) || 'school',
    subject: `Course Enrollment - ${v.course_name}`,
    preheader: 'You have been enrolled successfully',
    body: `<h2>Welcome to ${v.course_name}!</h2><p>Hi ${v.name},</p><p>You have been successfully enrolled. You can now access all course materials and assignments.</p><a href="${v.course_url || '#'}" class="btn">Access Your Course</a>`,
  }),
  assignment_reminder: (v) => ({
    platform: 'school',
    subject: `Assignment Due: ${v.assignment_title}`,
    preheader: 'Reminder: deadline approaching',
    body: `<h2>Assignment Reminder</h2><p>Hi ${v.name},</p><p>Your assignment "<strong>${v.assignment_title}</strong>" is due on <strong>${v.due_date}</strong>.</p><a href="${v.course_url || '#'}" class="btn">Go to Course</a>`,
  }),
};

// === Public API ===

export async function sendPlatformEmail(platform: PlatformKey, templateName: string, params: {
  email: string | string[];
  variables: Record<string, string>;
}): Promise<boolean> {
  if (!isConfigured()) {
    console.warn('[email] Not configured - skipping email send');
    return false;
  }

  const templateFn = TEMPLATES[templateName];
  if (!templateFn) {
    console.error(`[email] Template "${templateName}" not found`);
    return false;
  }

  const { subject, preheader, body } = templateFn({
    ...params.variables,
    platform,
    platform_name: PLATFORM_BRAND[platform].name,
    site_url: _env().SITE_URL,
  });

  const html = emailShell(platform, subject, preheader, body);

  try {
    await sendEmail(params.email, subject, html);
    // Log to DB
    try {
      await lightbase.insert('email_logs', {
        to: Array.isArray(params.email) ? params.email.join(', ') : params.email,
        subject, template: templateName, platform, status: 'sent',
        sentAt: new Date().toISOString(), createdAt: new Date().toISOString(),
      });
    } catch { /* db log failure non-critical */ }
    return true;
  } catch (error: any) {
    console.error('[email] Send failed:', error.message);
    try {
      await lightbase.insert('email_logs', {
        to: Array.isArray(params.email) ? params.email.join(', ') : params.email,
        subject, template: templateName, platform, status: 'failed',
        error: error.message, createdAt: new Date().toISOString(),
      });
    } catch { /* db log failure non-critical */ }
    return false;
  }
}
