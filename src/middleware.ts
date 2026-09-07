import { defineMiddleware } from 'astro:middleware';
import { canonicalRedirect } from './config/domains.mjs';

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.isPrerendered) return next();
	const redirect = canonicalRedirect(context.request.headers.get('host'), context.url.toString());
	return redirect ? Response.redirect(redirect, 301) : next();
});
