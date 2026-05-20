// @ts-check
import { cpSync, existsSync, rmSync } from 'node:fs';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

function copyAttachments() {
  return {
    name: 'copy-attachments',
    hooks: {
      'astro:config:done': () => {
        const source = 'src/content/attachments';
        const destination = 'public/attachments';

        rmSync(destination, { recursive: true, force: true });

        if (!existsSync(source)) {
          return;
        }

        cpSync(source, destination, { recursive: true });
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://thetabletx.org',
  integrations: [copyAttachments(), sitemap()],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    assetsInclude: ['**/*.base', '**/.obsidian/**', '**/_bases/**'],
    server: {
      watch: {
        // Ignore Obsidian/Vault CMS workspace files during local dev.
        ignored: ['**/.obsidian/**', '**/_bases/**'],
      },
    },
  },
});
