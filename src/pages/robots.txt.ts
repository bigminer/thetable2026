import type { APIRoute } from 'astro';
import { canonicalOrigin } from '../config/domains.mjs';

export const prerender = true;

// Derived from canonicalOrigin so the sitemap host can never drift from the
// one astro.config.mjs builds the sitemap with.
const body = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap-index.xml', canonicalOrigin).href}
`;

export const GET: APIRoute = () =>
	new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
