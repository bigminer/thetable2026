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

const JS_STRING = String.raw`'(?:\\.|[^'\\])*'`;

// Astro retains frontmatter as raw source. Normalize only string values in the
// existing arrays that render homepage copy; every delimiter and neighboring
// expression stays protected by the exact comparison below.
function maskArrayField(source, variable, pattern, replacement) {
  const declaration = new RegExp(`(^[\\t ]*const ${variable} = \\[)([\\s\\S]*?)(^[\\t ]*\\];)`, 'gm');
  let count = 0;
  const normalized = source.replace(declaration, (_whole, start, rows, end) => {
    count += 1;
    return start + rows.replace(pattern, replacement) + end;
  });
  return count === 1 ? normalized : source;
}

function canonicalHomepageFrontmatter(source) {
  let normalized = source;
  const valuesPattern = new RegExp(
    `(\\{\\s*name:\\s*)(${JS_STRING})(\\s*,\\s*body:\\s*)(${JS_STRING})(\\s*\\})`, 'g',
  );
  const waysPattern = new RegExp(
    `(\\{\\s*label:\\s*)(${JS_STRING})(\\s*,\\s*href:\\s*${JS_STRING})(\\s*\\})`, 'g',
  );
  normalized = maskArrayField(normalized, 'values', valuesPattern, '$1<CONTENT>$3<CONTENT>$5');
  normalized = maskArrayField(normalized, 'ways', waysPattern, '$1<CONTENT>$3$4');
  return normalized;
}

function canonicalAst(node, inCode = false, sourcePath = '') {
  if (Array.isArray(node)) return node.map((child) => canonicalAst(child, inCode, sourcePath));
  if (!node || typeof node !== 'object') return node;
  const code = inCode || (node.type === 'element' && ['script', 'style'].includes(node.name?.toLowerCase()));
  const result = {};
  for (const key of Object.keys(node).sort()) {
    if (key === 'position') continue;
    if (key === 'value' && node.type === 'text' && !code) result[key] = '<CONTENT>';
    else if (key === 'value' && node.type === 'frontmatter' && sourcePath === 'src/pages/index.astro') {
      result[key] = canonicalHomepageFrontmatter(node.value);
    }
    else result[key] = canonicalAst(node[key], code, sourcePath);
  }
  return result;
}

async function checkAstTextOnly(path, base) {
  const oldSource = execFileSync('git', ['show', `${base}:${path}`], { cwd: repo, encoding: 'utf8' });
  const newSource = readFileSync(path, 'utf8');
  const [oldParsed, newParsed] = await Promise.all([parse(oldSource), parse(newSource)]);
  if (oldParsed.diagnostics.length || newParsed.diagnostics.length) fail(`${path}: Astro parse errors are not allowed`);
  if (JSON.stringify(canonicalAst(oldParsed.ast, false, path)) !== JSON.stringify(canonicalAst(newParsed.ast, false, path))) {
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
