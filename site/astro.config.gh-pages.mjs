// @ts-check
import { cpSync, existsSync, rmSync } from 'node:fs';
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

export default defineConfig({
  integrations: [copyAttachments()],
  site: 'https://bigminer.github.io',
  base: '/thetable2026',
  output: 'static',
});
