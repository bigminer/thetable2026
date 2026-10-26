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
	'/welcome-to-the-table-class/',
	'/merch/',
	'/giving/',
	'/sign-up-for-our-newsletter/',
	'/contact-us/',
	'/privacy-policy/',
	'/ask/',
	'/series/',
	'/sitemap-index.xml',
	'/robots.txt',
	'/attachments/branding/the-table-written-logo.png',
	'/attachments/pages/merch/table-tees-doorway.jpg',
	'/attachments/video/homepage/Table-B-roll-poster.jpg',
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
const pageHtml = new Map();
let checks = 0;

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
		if (route.endsWith('/')) pageHtml.set(route, body);
	}
	checks += routes.length;

	// Crawl every published series, including its individual message anchors.
	const seriesIndex = await (await fetch(`${base}/series/`)).text();
	const seriesLinks = new Set([...seriesIndex.matchAll(/href="(\/series\/[^"/]+\/)"/g)].map((match) => match[1]));
	if (seriesLinks.size === 0) {
		failures.push('no series detail links on /series/');
	}
	for (const seriesLink of seriesLinks) {
		const detail = await fetch(base + seriesLink);
		if (!detail.ok) failures.push(`${detail.status} ${seriesLink}`);
		else pageHtml.set(seriesLink, await detail.text());
	}
	checks += 1 + seriesLinks.size;

	// Search tools must see one stable church identity, separate page descriptions,
	// and a service schedule rather than misleading building opening hours.
	let churchDescription;
	for (const [route, html] of pageHtml) {
		if ([...html.matchAll(/<main\b/g)].length !== 1) failures.push(`expected one main region on ${route}`);
		try {
			const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
			const graph = JSON.parse(json)['@graph'];
			const church = graph.find((entry) => entry['@type']?.includes('Church'));
			const page = graph.find((entry) => entry['@type'] === 'WebPage');
			churchDescription ??= church.description;
			if (!church.description || church.description !== churchDescription) failures.push(`church identity changes on ${route}`);
			if ('openingHours' in church || church.event?.eventSchedule?.['@type'] !== 'Schedule') failures.push(`invalid service schedule on ${route}`);
			if (!page?.description || page.publisher?.['@id'] !== church['@id']) failures.push(`missing page identity on ${route}`);
		} catch {
			failures.push(`invalid structured data on ${route}`);
		}
		checks += 2;
	}

	// Ask is unfinished: discoverability changes must not accidentally launch it.
	if (!/<meta name="robots" content="noindex, nofollow"/.test(pageHtml.get('/ask/') ?? '')) {
		failures.push('/ask/ must remain noindex until launch');
	}
	checks += 1;

	const missing = await fetch(`${base}/definitely-not-a-page/`);
	if (missing.status !== 404) failures.push(`expected 404, got ${missing.status} /definitely-not-a-page/`);

	// Form endpoints are wired. Neither probe sends mail: malformed JSON is
	// rejected at parse, and the honeypot returns early. This proves the routes
	// exist and their handlers run — it cannot prove SMTP is configured, since
	// reaching that check requires a valid submission, which would send real
	// email to the church.
	for (const endpoint of ['/api/contact', '/api/newsletter']) {
		const malformed = await fetch(base + endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: 'not json',
		});
		if (malformed.status !== 400) {
			failures.push(`expected 400 for malformed body, got ${malformed.status} ${endpoint}`);
		}

		const honeypot = await fetch(base + endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ hp_name: 'bot' }),
		});
		if (honeypot.status !== 200) {
			failures.push(`expected 200 for honeypot, got ${honeypot.status} ${endpoint}`);
		}
	}
	checks += 4;

	// Every internal link on every crawled page resolves. Catches typos and
	// links left behind when a page is renamed or removed.
	const links = new Map();
	for (const [route, html] of pageHtml) {
		for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
			const target = match[1];
			if (target.startsWith('//') || target.startsWith('/api/')) continue;
			// keep the first page that linked here, so a failure names its source
			if (!links.has(target)) links.set(target, route);
		}
	}
	for (const [target, from] of links) {
		const response = await fetch(base + target);
		if (!response.ok) failures.push(`${response.status} ${target} (linked from ${from})`);
	}
	checks += links.size;

	// Check section and message destinations as well as the page itself.
	for (const [route, html] of pageHtml) {
		for (const match of html.matchAll(/href="([^"\s]*#[^"\s]+)"/g)) {
			const target = new URL(match[1], base + route);
			if (target.origin !== base) continue;
			let targetHtml = pageHtml.get(target.pathname);
			if (!targetHtml) {
				const response = await fetch(target);
				targetHtml = response.ok ? await response.text() : '';
			}
			const ids = new Set([...targetHtml.matchAll(/\bid="([^"]+)"/g)].map((item) => item[1]));
			if (!ids.has(decodeURIComponent(target.hash.slice(1)))) failures.push(`missing anchor ${match[1]} (linked from ${route})`);
			checks += 1;
		}
	}
} finally {
	server.kill();
	await once(server, 'exit').catch(() => {});
}

if (failures.length > 0) {
	console.error(`Smoke test failed:\n  ${failures.join('\n  ')}`);
	process.exit(1);
}

console.log(`Smoke test passed: ${checks} checks.`);
