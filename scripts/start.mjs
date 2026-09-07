import { createServer } from 'node:http';
import { canonicalRedirect } from '../src/config/domains.mjs';

// Redirect before Astro serves prerendered HTML or static media.
process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('../dist/server/entry.mjs');
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 4321);

createServer((request, response) => {
	const redirect = canonicalRedirect(request.headers.host, request.url ?? '/');
	if (redirect) {
		response.writeHead(301, { Location: redirect });
		response.end();
		return;
	}
	handler(request, response);
}).listen(port, host, () => {
	console.log(`The Table is running at http://${host}:${port}`);
});
