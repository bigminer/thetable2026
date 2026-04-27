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

function rehypeRebaseImages(base) {
  return function () {
    return function (tree) {
      function walk(node) {
        if (node.type === 'element' && node.tagName === 'img') {
          const src = node.properties?.src;
          if (typeof src === 'string') {
            if (src.startsWith('/') && !src.startsWith(base)) {
              node.properties.src = base + src;
            } else if (src.startsWith('../attachments/')) {
              node.properties.src = base + '/attachments/' + src.slice('../attachments/'.length);
            }
          }
        }
        if (node.children) node.children.forEach(walk);
      }
      walk(tree);
    };
  };
}

export default defineConfig({
  integrations: [copyAttachments()],
  site: 'https://bigminer.github.io',
  base: '/thetable2026',
  output: 'static',
  markdown: {
    rehypePlugins: [rehypeRebaseImages('/thetable2026')],
  },
});
