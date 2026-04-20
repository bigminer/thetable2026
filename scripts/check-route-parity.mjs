#!/usr/bin/env node

import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { parse } from 'yaml';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const MATRIX_PATH = path.join(ROOT, 'migration-data', 'redirect-matrix.yaml');

function fail(message) {
  throw new Error(message);
}

function readMatrix() {
  if (!fs.existsSync(MATRIX_PATH)) {
    fail(`missing route matrix: ${path.relative(ROOT, MATRIX_PATH)}`);
  }

  const matrix = parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
  if (!matrix || !Array.isArray(matrix.routes)) {
    fail(`${path.relative(ROOT, MATRIX_PATH)}: routes must be an array`);
  }

  return matrix;
}

function collectBuiltRoutes(root) {
  const routes = new Set();

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      const rel = path.relative(root, fullPath).split(path.sep).join('/');
      if (rel.endsWith('/index.html')) {
        routes.add(`/${rel.slice(0, -'index.html'.length)}`);
        continue;
      }

      if (rel.endsWith('.html')) {
        routes.add(`/${rel}`);
        continue;
      }

      if (rel === 'robots.txt' || rel === 'sitemap.xml') {
        routes.add(`/${rel}`);
      }
    }
  }

  walk(root);
  return routes;
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('failed to allocate a preview port'));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

async function waitForPreview(baseUrl, timeoutMs = 30000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // Keep waiting until the preview server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`preview server did not become ready at ${baseUrl}`);
}

async function request(url) {
  return fetch(url, { redirect: 'manual' });
}

async function main() {
  if (!fs.existsSync(DIST)) {
    fail(`missing build output: ${path.relative(ROOT, DIST)}`);
  }

  const matrix = readMatrix();
  const builtRoutes = collectBuiltRoutes(DIST);
  const previewPort = await getFreePort();
  const baseUrl = `http://127.0.0.1:${previewPort}`;

  const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(previewPort)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  let stderr = '';
  preview.stdout.on('data', (chunk) => process.stdout.write(chunk));
  preview.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
    process.stderr.write(chunk);
  });

  try {
    await waitForPreview(baseUrl);

    const routesToCheck = matrix.routes.filter((route) => {
      if (route.expected?.type === 'not_public_content' && route.source.includes('?')) {
        return false;
      }
      if (route.expected?.type === 'not_public_content') {
        return true;
      }
      return route.expected?.type === 'redirect' || builtRoutes.has(route.source);
    });

    let checked = 0;
    for (const route of routesToCheck) {
      const url = new URL(route.source, baseUrl);
      const response = await request(url);

      if (route.expected.type === 'local_path') {
        if (response.status !== 200) {
          fail(`${route.source}: expected 200 from preview, got ${response.status}`);
        }
      } else if (route.expected.type === 'not_public_content') {
        if (response.status !== 404) {
          fail(`${route.source}: expected 404 for technical route, got ${response.status}`);
        }
      } else if (route.expected.type === 'redirect') {
        const location = response.headers.get('location');
        if (response.status !== route.expected.status) {
          fail(`${route.source}: expected ${route.expected.status}, got ${response.status}`);
        }
        if (!location) {
          fail(`${route.source}: missing redirect target`);
        }
        const expectedTarget = route.expected.target;
        if (!(location === expectedTarget || location.endsWith(expectedTarget))) {
          fail(`${route.source}: redirect target mismatch; expected ${expectedTarget}, got ${location}`);
        }
      } else {
        fail(`${route.source}: unknown expectation type ${(route.expected && route.expected.type) || 'missing'}`);
      }

      checked += 1;
    }

    if (checked === 0) {
      fail('no classified routes were eligible for parity checking');
    }

    console.log(`route parity ok — checked ${checked} route(s) against preview`);
  } finally {
    preview.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (!preview.killed) {
      preview.kill('SIGKILL');
    }
    if (stderr && preview.exitCode && preview.exitCode !== 0) {
      process.stderr.write(stderr);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
