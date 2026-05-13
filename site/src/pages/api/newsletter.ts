import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { checkRateLimit } from '../../lib/rate-limit';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function json(data: object, status: number, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function field(body: Record<string, unknown>, name: string, maxLength: number) {
  const value = body[name];
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Honeypot
  if (body.hp_name) return json({ ok: true }, 200);

  const firstName = field(body, 'firstName', 100);
  const lastName = field(body, 'lastName', 100);
  const email = field(body, 'email', 254);

  if (!firstName || !lastName || !email) {
    return json({ error: 'Please fill in all required fields.' }, 400);
  }

  if (!isValidEmail(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const rateLimit = checkRateLimit({ request, clientAddress, key: 'newsletter-form' });
  if (!rateLimit.ok) {
    return json({ error: rateLimit.error }, rateLimit.status, { 'Retry-After': String(rateLimit.retryAfterSeconds) });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';

  if (!apiKey || !toEmail) {
    console.error('[/api/newsletter] RESEND_API_KEY or CONTACT_TO_EMAIL not configured');
    return json({ error: 'Form is not configured. Please call or text (469) 222-3617.' }, 500);
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `The Table Website <${fromEmail}>`,
    to: toEmail,
    replyTo: email,
    subject: `Newsletter signup: ${firstName} ${lastName}`,
    html: `
      <p>A new newsletter signup was submitted from thetabletx.com.</p>
      <p><strong>Name:</strong> ${esc(firstName)} ${esc(lastName)}</p>
      <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
    `,
  });

  if (error) {
    console.error('[/api/newsletter]', error);
    return json({ error: 'Something went wrong. Please try again or call (469) 222-3617.' }, 500);
  }

  return json({ ok: true }, 200);
};
