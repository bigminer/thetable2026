// @ts-check
import { canonicalOrigin } from './src/config/domains.mjs';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: canonicalOrigin,
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	integrations: [sitemap()],
});
