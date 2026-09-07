import type { APIRoute } from 'astro';
import { isMailConfigured, sendMail } from '../../lib/mailer';
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

  // Honeypot — bots fill this in, humans don't
  if (body.hp_name) return json({ ok: true }, 200);

  const firstName = field(body, 'firstName', 100);
  const lastName = field(body, 'lastName', 100);
  const email = field(body, 'email', 254);
  const phone = field(body, 'phone', 50);
  const message = field(body, 'message', 4000);

  if (!firstName || !lastName || !email) {
    return json({ error: 'Please fill in all required fields.' }, 400);
  }

  if (!isValidEmail(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const rateLimit = checkRateLimit({ request, clientAddress, key: 'contact-form' });
  if (!rateLimit.ok) {
    return json({ error: rateLimit.error }, rateLimit.status, { 'Retry-After': String(rateLimit.retryAfterSeconds) });
  }

  if (!isMailConfigured()) {
    console.error('[/api/contact] SMTP_USER, SMTP_PASSWORD or CONTACT_TO_EMAIL not configured');
    return json({ error: 'Form is not configured. Please call or text (469) 222-3617.' }, 500);
  }

  const { error } = await sendMail({
    replyTo: email,
    subject: `Contact form: ${firstName} ${lastName}`,
    html: `
      <p><strong>Name:</strong> ${esc(firstName)} ${esc(lastName)}</p>
      <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
      ${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ''}
      ${message ? `<p><strong>Message:</strong></p><p>${esc(message).replace(/\n/g, '<br>')}</p>` : ''}
    `,
  });

  if (error) {
    console.error('[/api/contact]', error);
    return json({ error: 'Something went wrong. Please try again or call (469) 222-3617.' }, 500);
  }

  return json({ ok: true }, 200);
};
