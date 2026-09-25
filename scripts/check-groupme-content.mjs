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
const SAFE_CONTENT_TAGS = new Set([
  'p', 'span', 'small', 'strong', 'em', 'b', 'i', 'br',
  'ul', 'ol', 'li', 'blockquote', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

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

function collectExistingClasses(node, classes = new Set()) {
  if (Array.isArray(node)) {
    for (const child of node) collectExistingClasses(child, classes);
  } else if (node && typeof node === 'object') {
    if (node.type === 'element') {
      for (const attribute of node.attributes ?? []) {
        if (attribute.type === 'attribute' && attribute.kind === 'quoted' &&
            attribute.name === 'class' && typeof attribute.value === 'string') {
          for (const token of attribute.value.split(/\s+/).filter(Boolean)) {
            classes.add(`${node.name.toLowerCase()} ${token}`);
          }
        }
      }
    }
    for (const value of Object.values(node)) collectExistingClasses(value, classes);
  }
  return classes;
}

function isSafeContentAddition(node, existingClasses) {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return false;
  if (node.type === 'text') return true;
  if (node.type !== 'element' || !SAFE_CONTENT_TAGS.has(node.name?.toLowerCase())) return false;

  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== 'attribute' || attribute.kind !== 'quoted' ||
        attribute.name !== 'class' || typeof attribute.value !== 'string') return false;
    const tokens = attribute.value.split(/\s+/).filter(Boolean);
    if (tokens.length === 0 || tokens.some((token) => !existingClasses.has(`${node.name.toLowerCase()} ${token}`))) return false;
  }

  let hasVisibleText = false;
  for (const child of node.children ?? []) {
    if (!isSafeContentAddition(child, existingClasses)) return false;
    if (child.type === 'text' && child.value.trim()) hasVisibleText = true;
    if (child.type === 'element' && containsVisibleText(child)) hasVisibleText = true;
  }
  return hasVisibleText;
}

function containsVisibleText(node) {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some(containsVisibleText);
  if (node.type === 'text') return Boolean(node.value.trim());
  return (node.children ?? []).some(containsVisibleText);
}

function childrenWithSafeAdditions(oldChildren, newChildren, existingClasses, sourcePath) {
  let next = 0;
  for (const oldChild of oldChildren) {
    let matched = false;
    while (next < newChildren.length) {
      if (sameWithSafeAdditions(oldChild, newChildren[next], existingClasses, sourcePath)) {
        next += 1;
        matched = true;
        break;
      }
      if (!isSafeContentAddition(newChildren[next], existingClasses)) return false;
      next += 1;
    }
    if (!matched) return false;
  }
  return newChildren.slice(next).every((node) => isSafeContentAddition(node, existingClasses));
}

function sameWithSafeAdditions(oldNode, newNode, existingClasses, sourcePath = '', inCode = false) {
  if (Array.isArray(oldNode) || Array.isArray(newNode)) {
    return Array.isArray(oldNode) && Array.isArray(newNode) && oldNode.length === newNode.length &&
      oldNode.every((child, index) => sameWithSafeAdditions(child, newNode[index], existingClasses, sourcePath, inCode));
  }
  if (oldNode === newNode) return true;
  if (!oldNode || !newNode || typeof oldNode !== 'object' || typeof newNode !== 'object' ||
      Array.isArray(oldNode) || Array.isArray(newNode)) return false;

  const oldKeys = Object.keys(oldNode).filter((key) => key !== 'position').sort();
  const newKeys = Object.keys(newNode).filter((key) => key !== 'position').sort();
  if (JSON.stringify(oldKeys) !== JSON.stringify(newKeys)) return false;
  const code = inCode || (oldNode.type === 'element' && ['script', 'style'].includes(oldNode.name?.toLowerCase()));
  for (const key of oldKeys) {
    if (key === 'children') {
      if (code) {
        if (oldNode[key].length !== newNode[key].length ||
            !oldNode[key].every((child, index) => sameWithSafeAdditions(child, newNode[key][index], existingClasses, sourcePath, true))) return false;
      } else if (!childrenWithSafeAdditions(oldNode[key], newNode[key], existingClasses, sourcePath)) return false;
    } else if (key === 'value' && oldNode.type === 'text' && newNode.type === 'text') {
      if (code && oldNode.value !== newNode.value) return false;
    } else if (key === 'value' && oldNode.type === 'frontmatter' && newNode.type === 'frontmatter' &&
               sourcePath === 'src/pages/index.astro') {
      if (canonicalHomepageFrontmatter(oldNode.value) !== canonicalHomepageFrontmatter(newNode.value)) return false;
    } else if (!sameWithSafeAdditions(oldNode[key], newNode[key], existingClasses, sourcePath)) return false;
  }
  return true;
}

async function checkAstTextOnly(path, base) {
  const oldSource = execFileSync('git', ['show', `${base}:${path}`], { cwd: repo, encoding: 'utf8' });
  const newSource = readFileSync(path, 'utf8');
  const [oldParsed, newParsed] = await Promise.all([parse(oldSource), parse(newSource)]);
  if (oldParsed.diagnostics.length || newParsed.diagnostics.length) fail(`${path}: Astro parse errors are not allowed`);
  const existingClasses = collectExistingClasses(oldParsed.ast);
  if (!sameWithSafeAdditions(oldParsed.ast, newParsed.ast, existingClasses, path)) {
    fail(`${path}: only visible text and new plain content elements may change; functional markup, attributes, frontmatter, expressions, scripts, and styles are protected`);
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
