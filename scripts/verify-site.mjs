// Smoke test: build the server output first (`npm run build`), then boot it and
// crawl every public route plus a sample of static media.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const port = Number(process.env.SMOKE_PORT ?? 4331);
const base = `http://${host}:${port}`;

const routes = [
	'/',
	'/new-here/',
	'/our-story/',
	'/our-vision/',
	'/leadership/',
	'/plan-your-visit/',
	'/what-sundays-are-like/',
	'/service-times-locations/',
	'/meetups/',
	'/kids-youth/',
	'/community-meal/',
	'/get-involved/',
	'/merch/',
	'/sign-up-for-our-newsletter/',
	'/contact-us/',
	'/privacy-policy/',
	'/ask/',
	'/series/',
	'/sitemap-index.xml',
	'/robots.txt',
	'/attachments/branding/the-table-written-logo.png',
];

const server = spawn(process.execPath, [fileURLToPath(new URL('./start.mjs', import.meta.url))], {
	env: { ...process.env, HOST: host, PORT: String(port) },
	stdio: ['ignore', 'pipe', 'inherit'],
});

async function waitForServer() {
	for (let attempt = 0; attempt < 60; attempt += 1) {
		try {
			await fetch(base, { signal: AbortSignal.timeout(1000) });
			return;
		} catch {
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}
	throw new Error(`Server did not start on ${base}`);
}

const failures = [];

try {
	await waitForServer();

	for (const route of routes) {
		const response = await fetch(base + route);
		if (!response.ok) {
			failures.push(`${response.status} ${route}`);
			continue;
		}
		const body = await response.text();
		if (route.endsWith('/') && !body.includes('</html>')) {
			failures.push(`incomplete HTML ${route}`);
		}
	}

	// At least one series detail page must render.
	const seriesIndex = await (await fetch(`${base}/series/`)).text();
	const seriesLink = seriesIndex.match(/href="(\/series\/[^"/]+\/)"/)?.[1];
	if (!seriesLink) {
		failures.push('no series detail links on /series/');
	} else {
		const detail = await fetch(base + seriesLink);
		if (!detail.ok) failures.push(`${detail.status} ${seriesLink}`);
	}

	const missing = await fetch(`${base}/definitely-not-a-page/`);
	if (missing.status !== 404) failures.push(`expected 404, got ${missing.status} /definitely-not-a-page/`);
} finally {
	server.kill();
	await once(server, 'exit').catch(() => {});
}

if (failures.length > 0) {
	console.error(`Smoke test failed:\n  ${failures.join('\n  ')}`);
	process.exit(1);
}

console.log(`Smoke test passed: ${routes.length + 2} checks.`);
