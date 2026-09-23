#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parse } from '@astrojs/compiler';

const repo = process.cwd();
const fail = (message) => { throw new Error(message); };
function git(args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function isRegularFile(path) {
  const entry = execFileSync('git', ['ls-tree', '-z', 'HEAD', '--', path], {
    cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).split('\0')[0];
  const mode = entry.split('\t', 1)[0]?.split(' ')[0];
  return mode === '100644' || mode === '100755';
}

function changedFiles(base) {
  const out = execFileSync('git', ['diff', '--name-status', '--find-renames', '-z', `${base}...HEAD`], {
    cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parts = out.split('\0').filter(Boolean);
  const changes = [];
  for (let i = 0; i < parts.length;) {
    const status = parts[i++];
    if (status.startsWith('R') || status.startsWith('C')) {
      const from = parts[i++], to = parts[i++];
      changes.push({ status: 'D', path: from }, { status: 'A', path: to });
    } else changes.push({ status, path: parts[i++] });
  }
  return changes;
}

function canonicalAst(node, inCode = false) {
  if (Array.isArray(node)) return node.map((child) => canonicalAst(child, inCode));
  if (!node || typeof node !== 'object') return node;
  const code = inCode || (node.type === 'element' && ['script', 'style'].includes(node.name?.toLowerCase()));
  const result = {};
  for (const key of Object.keys(node).sort()) {
    if (key === 'position') continue;
    if (key === 'value' && node.type === 'text' && !code) result[key] = '<CONTENT>';
    else result[key] = canonicalAst(node[key], code);
  }
  return result;
}

async function checkAstTextOnly(path, base) {
  const oldSource = execFileSync('git', ['show', `${base}:${path}`], { cwd: repo, encoding: 'utf8' });
  const newSource = readFileSync(path, 'utf8');
  const [oldParsed, newParsed] = await Promise.all([parse(oldSource), parse(newSource)]);
  if (oldParsed.diagnostics.length || newParsed.diagnostics.length) fail(`${path}: Astro parse errors are not allowed`);
  if (JSON.stringify(canonicalAst(oldParsed.ast)) !== JSON.stringify(canonicalAst(newParsed.ast))) {
    fail(`${path}: only existing visible text may change; markup, attributes, frontmatter, expressions, scripts, and styles are protected`);
  }
}

export async function validate(base) {
  if (!base || !/^[0-9a-f]{40}$/i.test(base)) fail('Pass the full base commit SHA as the first argument');
  git(['cat-file', '-e', `${base}^{commit}`]);
  const changes = changedFiles(base);
  if (changes.length === 0) fail('No committed changes were found');
  for (const change of changes) {
    const { status, path } = change;
    if (status.startsWith('D')) fail(`${path}: deleting files is not allowed`);
    const isContent = /^src\/content\/.+\.md$/.test(path);
    const isExistingPage = /^src\/pages\/(?!ask(?:\/|\.astro$)|api\/).+\.astro$/.test(path) && status.startsWith('M');
    if (isContent && (status.startsWith('A') || status.startsWith('M'))) {
      if (!isRegularFile(path)) fail(`${path}: symlinks and non-regular files are not allowed`);
      const markdown = readFileSync(path, 'utf8');
      if (/<\/?[a-z][\w:-]*(?:\s[^<>]*)?\s*\/?>|javascript\s*:/i.test(markdown)) {
        fail(`${path}: raw HTML and scriptable links are outside the content-only scope`);
      }
      continue;
    }
    if (isExistingPage) {
      if (!isRegularFile(path)) fail(`${path}: symlinks and non-regular files are not allowed`);
      await checkAstTextOnly(path, base);
      continue;
    }
    fail(`${path}: this file is outside the allowed content-only area`);
  }
  return `Validated ${changes.length} content-only file change(s).`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try { console.log(await validate(process.argv[2])); }
  catch (error) { console.error(`Content change rejected: ${error.message}`); process.exitCode = 1; }
}
