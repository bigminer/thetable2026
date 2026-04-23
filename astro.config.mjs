// @ts-check
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://thetabletx.com',
  trailingSlash: 'always',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  legacy: {
    collectionsBackwardsCompat: true,
  },
});
