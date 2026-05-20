import { defineMiddleware } from 'astro:middleware';

const CANONICAL_HOST = 'thetabletx.org';
const LEGACY_HOSTS = new Set(['thetabletx.com', 'www.thetabletx.com', 'www.thetabletx.org']);

export const onRequest = defineMiddleware(async (context, next) => {
  const hostHeader = context.request.headers.get('host')?.toLowerCase();

  if (hostHeader && LEGACY_HOSTS.has(hostHeader)) {
    const targetUrl = new URL(context.url.toString());
    targetUrl.protocol = 'https:';
    targetUrl.hostname = CANONICAL_HOST;
    targetUrl.port = '';
    return Response.redirect(targetUrl, 301);
  }

  return next();
});
