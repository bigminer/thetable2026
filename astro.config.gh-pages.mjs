// @ts-check
// Static build for the GitHub Pages preview at
// https://bigminer.github.io/thetable2026/ — visual QA only, so content changes
// can be seen before they merge. Not production; production is Render, built
// from astro.config.mjs with server output.
//
// The API routes are removed by the deploy workflow before this runs, since a
// static build cannot serve them. Forms render but do not submit, and /ask
// returns no answer. That is expected here.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const BASE = '/thetable2026';

/**
 * Astro applies `base` to the links it generates, but not to absolute paths
 * written by hand in markup — `href="/our-story/"` would land on the github.io
 * root and 404. Rather than rewrite every link in the source for the sake of a
 * preview, rebase them in the emitted HTML.
 */
function rebaseAbsolutePaths() {
	return {
		name: 'rebase-absolute-paths',
		hooks: {
			'astro:build:done': ({ dir }) => {
				const root = dir.pathname.replace(/^\/([A-Za-z]:)/, '$1');

				const files = [];
				(function walk(d) {
					for (const entry of readdirSync(d)) {
						const full = join(d, entry);
						if (statSync(full).isDirectory()) walk(full);
						else if (extname(full) === '.html') files.push(full);
					}
				})(root);

				// A leading "/" not already followed by the base, and not "//"
				// (protocol-relative). Covers href, src and srcset.
				const attr = new RegExp(`((?:href|src)=")/(?!/|${BASE.slice(1)}\\b)`, 'g');
				const srcset = new RegExp(`(srcset="[^"]*?)(^|,\\s*)/(?!/|${BASE.slice(1)}\\b)`, 'g');

				for (const file of files) {
					const html = readFileSync(file, 'utf8');
					const rebased = html
						.replace(attr, `$1${BASE}/`)
						.replace(srcset, `$1$2${BASE}/`);
					if (rebased !== html) writeFileSync(file, rebased);
				}

				// Keep the preview out of search results — it would otherwise
				// compete with the real site for the same content.
				writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
			},
		},
	};
}

export default defineConfig({
	site: 'https://bigminer.github.io',
	base: BASE,
	output: 'static',
	redirects: {
		'/plan-your-visit': `${BASE}/service-times-locations`,
	},
	integrations: [sitemap(), rebaseAbsolutePaths()],
});
