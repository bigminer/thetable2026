#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = 'migration-data/asset-copy-manifest.json';
const SOURCE_ROOT = 'migration-data/source-reference/assets';
const DEST_ROOT = 'public/media';

const ACTIVE_SCAN_ROOTS = [
  'src/content',
  'src/pages',
  'src/components',
  'src/layouts',
  'src/data',
];

const SOURCE_SCAN_ROOTS = [
  'migration-data/source-reference/site-manifest-latest/api',
  'migration-data/source-reference/site-manifest-latest/raw',
  'migration-data/page-evidence',
];

const TEXT_EXTENSIONS = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.ts',
  '.txt',
]);

const MEDIA_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.m4a',
  '.mp3',
  '.mp4',
  '.pdf',
  '.png',
  '.svg',
  '.webp',
  '.webm',
]);

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.apply && args.dryRun) {
  exitWithError('Use either --dry-run or --apply, not both.');
}

if (!args.apply) {
  args.dryRun = true;
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});

async function main() {
  const manifest = readManifest();
  const managedSourceUrls = new Set(manifest.assets.map((asset) => normalizeMediaUrl(asset.sourceUrl)));
  const managedPublicPaths = new Set(manifest.assets.map((asset) => asset.publicPath));

  const activeReferences = collectReferences(ACTIVE_SCAN_ROOTS);
  const sourceReferences = collectReferences(SOURCE_SCAN_ROOTS);
  const allUrls = new Set([...activeReferences.keys(), ...sourceReferences.keys()]);

  const unmanagedActive = [];
  const unmanagedSourceOnly = [];
  const managedMissing = [];

  for (const asset of manifest.assets) {
    if (!fs.existsSync(resolveRoot(asset.sourceReferencePath)) || !fs.existsSync(resolveRoot(asset.destinationPath))) {
      managedMissing.push(asset);
    }
  }

  for (const sourceUrl of [...allUrls].sort()) {
    if (managedSourceUrls.has(sourceUrl)) continue;
    if (managedPublicPaths.has(urlToPublicPath(sourceUrl))) continue;

    const activeFiles = activeReferences.get(sourceUrl) ?? new Set();
    const sourceFiles = sourceReferences.get(sourceUrl) ?? new Set();
    const item = {
      sourceUrl,
      activeFiles: [...activeFiles].sort(),
      sourceFiles: [...sourceFiles].sort(),
      paths: buildAssetPaths(sourceUrl),
    };

    if (activeFiles.size > 0) {
      unmanagedActive.push(item);
    } else {
      unmanagedSourceOnly.push(item);
    }
  }

  printReport({
    mode: args.apply ? 'apply' : 'dry-run',
    managedCount: manifest.assets.length,
    discoveredCount: allUrls.size,
    unmanagedActive,
    unmanagedSourceOnly,
    managedMissing,
  });

  if (args.check && (unmanagedActive.length > 0 || managedMissing.length > 0)) {
    exitWithError('Referenced media check failed. Run npm run media:extract to copy active unmanaged assets.');
  }

  if (!args.apply) return;

  const applyItems = unmanagedActive;
  const appliedAssets = [];
  const failedAssets = [];

  for (const asset of managedMissing) {
    const result = await ensureAssetCopies({
      sourceUrl: asset.sourceUrl,
      sourceReferencePath: asset.sourceReferencePath,
      destinationPath: asset.destinationPath,
    });
    if (!result.ok) {
      failedAssets.push({ sourceUrl: asset.sourceUrl, error: result.error });
    }
  }

  for (const item of applyItems) {
    const result = await ensureAssetCopies({
      sourceUrl: item.sourceUrl,
      sourceReferencePath: item.paths.sourceReferencePath,
      destinationPath: item.paths.destinationPath,
    });

    if (!result.ok) {
      failedAssets.push({ sourceUrl: item.sourceUrl, error: result.error });
      continue;
    }

    const assetEntry = {
      id: uniqueAssetId(manifest.assets, item.paths.id),
      sourceUrl: item.sourceUrl,
      sourceReferencePath: item.paths.sourceReferencePath,
      destinationPath: item.paths.destinationPath,
      publicPath: item.paths.publicPath,
    };
    manifest.assets.push(assetEntry);
    appliedAssets.push({ ...item, manifestEntry: assetEntry });
  }

  if (appliedAssets.length > 0) {
    writeManifest(manifest);
    replaceActiveReferences(appliedAssets);
  }

  console.log('');
  console.log(`apply complete: ${appliedAssets.length} new asset(s), ${managedMissing.length} existing asset(s) checked, ${failedAssets.length} failure(s)`);
  for (const failure of failedAssets) {
    console.log(`FAIL: ${failure.sourceUrl} — ${failure.error}`);
  }

  if (failedAssets.length > 0) process.exit(1);
}

function parseArgs(rawArgs) {
  const parsed = {
    apply: false,
    check: false,
    dryRun: false,
    help: false,
  };

  for (const arg of rawArgs) {
    if (arg === '--apply') parsed.apply = true;
    else if (arg === '--check') parsed.check = true;
    else if (arg === '--dry-run') parsed.dryRun = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else exitWithError(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage:
  node scripts/extract-referenced-media.mjs --dry-run
  node scripts/extract-referenced-media.mjs --dry-run --check
  node scripts/extract-referenced-media.mjs --apply

Dry-run discovers WordPress upload URLs in active repo content and local source snapshots.
Check exits nonzero when active content references unmanaged media or managed assets are missing local copies.
Apply downloads only unmanaged URLs referenced by active repo content, writes both local copies,
updates migration-data/asset-copy-manifest.json, and replaces active content references with /media/... paths.`);
}

function readManifest() {
  const absolutePath = resolveRoot(MANIFEST_PATH);
  if (!fs.existsSync(absolutePath)) {
    return {
      version: 1,
      policy: 'Every migrated asset must have a local sourceReferencePath and a public destinationPath. Content must reference destinationPath, not WordPress upload URLs.',
      assets: [],
    };
  }

  const manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  if (!Array.isArray(manifest.assets)) {
    throw new Error(`${MANIFEST_PATH} must contain an assets array`);
  }
  return manifest;
}

function writeManifest(manifest) {
  manifest.assets.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(resolveRoot(MANIFEST_PATH), `${JSON.stringify(manifest, null, 2)}\n`);
}

function collectReferences(roots) {
  const references = new Map();

  for (const root of roots) {
    const absoluteRoot = resolveRoot(root);
    if (!fs.existsSync(absoluteRoot)) continue;

    for (const file of walkTextFiles(absoluteRoot)) {
      const relativeFile = path.relative(ROOT, file);
      const content = fs.readFileSync(file, 'utf8');
      for (const sourceUrl of extractMediaUrls(content)) {
        if (!references.has(sourceUrl)) references.set(sourceUrl, new Set());
        references.get(sourceUrl).add(relativeFile);
      }
    }
  }

  return references;
}

function* walkTextFiles(startPath) {
  const stats = fs.statSync(startPath);
  if (stats.isFile()) {
    if (TEXT_EXTENSIONS.has(path.extname(startPath).toLowerCase())) yield startPath;
    return;
  }

  for (const entry of fs.readdirSync(startPath, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const childPath = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      yield* walkTextFiles(childPath);
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      yield childPath;
    }
  }
}

function extractMediaUrls(content) {
  const normalizedContent = content
    .replaceAll('\\/', '/')
    .replaceAll('&amp;', '&')
    .replaceAll('&#038;', '&');

  const urls = new Set();
  const patterns = [
    /https?:\/\/(?:www\.)?(?:thetabletx\.com|thetabletx\.wpengine\.com)\/[^\s"'<>),]+/gi,
    /(?:^|[\s"'(=])((?:\/kerygma)?\/wp-content\/uploads\/[^\s"'<>),]+)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(normalizedContent)) !== null) {
      const rawUrl = match[1] ?? match[0];
      const mediaUrl = normalizeMediaUrl(rawUrl);
      if (mediaUrl && isMediaUrl(mediaUrl)) urls.add(mediaUrl);
    }
  }

  return urls;
}

function normalizeMediaUrl(rawUrl) {
  if (!rawUrl) return null;

  let value = rawUrl.trim()
    .replace(/[\\)"'<>]+$/g, '')
    .replace(/,$/, '');

  if (value.startsWith('//')) {
    value = `https:${value}`;
  } else if (value.startsWith('/')) {
    value = `https://thetabletx.com${value}`;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.hostname === 'www.thetabletx.com') url.hostname = 'thetabletx.com';
  url.hash = '';
  url.search = '';
  return url.toString();
}

function isMediaUrl(sourceUrl) {
  const url = new URL(sourceUrl);
  if (!['thetabletx.com', 'thetabletx.wpengine.com'].includes(url.hostname)) return false;
  if (!url.pathname.includes('/wp-content/uploads/')) return false;
  return MEDIA_EXTENSIONS.has(path.extname(url.pathname).toLowerCase());
}

function buildAssetPaths(sourceUrl) {
  const url = new URL(sourceUrl);
  const uploadPath = decodeURIComponent(url.pathname)
    .replace(/^\/kerygma/, '')
    .replace(/^\/wp-content\/uploads\//, '');
  const safeParts = uploadPath.split('/').map((part) => sanitizePathPart(part)).filter(Boolean);
  const filename = safeParts.pop() ?? 'asset';
  const directoryParts = safeParts.length > 0 ? safeParts : ['misc'];
  const relativePath = path.posix.join('extracted', ...directoryParts, filename);

  return {
    id: slugify(`extracted-${directoryParts.join('-')}-${filename.replace(path.extname(filename), '')}`),
    sourceReferencePath: path.posix.join(SOURCE_ROOT, relativePath),
    destinationPath: path.posix.join(DEST_ROOT, relativePath),
    publicPath: path.posix.join('/media', relativePath),
  };
}

function sanitizePathPart(part) {
  return part
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function uniqueAssetId(existingAssets, baseId) {
  const used = new Set(existingAssets.map((asset) => asset.id));
  if (!used.has(baseId)) return baseId;

  let index = 2;
  while (used.has(`${baseId}-${index}`)) index += 1;
  return `${baseId}-${index}`;
}

function urlToPublicPath(sourceUrl) {
  return buildAssetPaths(sourceUrl).publicPath;
}

async function ensureAssetCopies({ sourceUrl, sourceReferencePath, destinationPath }) {
  const sourceAbsolute = resolveRoot(sourceReferencePath);
  const destinationAbsolute = resolveRoot(destinationPath);

  try {
    let bytes;
    if (fs.existsSync(sourceAbsolute)) {
      bytes = fs.readFileSync(sourceAbsolute);
    } else {
      bytes = await downloadBytes(sourceUrl);
      fs.mkdirSync(path.dirname(sourceAbsolute), { recursive: true });
      fs.writeFileSync(sourceAbsolute, bytes);
    }

    if (!fs.existsSync(destinationAbsolute)) {
      fs.mkdirSync(path.dirname(destinationAbsolute), { recursive: true });
      fs.writeFileSync(destinationAbsolute, bytes);
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function downloadBytes(sourceUrl) {
  const response = await fetch(sourceUrl, {
    headers: {
      'user-agent': 'tablefresh-media-migration/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function replaceActiveReferences(appliedAssets) {
  const replacementsByFile = new Map();

  for (const item of appliedAssets) {
    for (const file of item.activeFiles) {
      if (!replacementsByFile.has(file)) replacementsByFile.set(file, []);
      replacementsByFile.get(file).push({
        sourceUrl: item.sourceUrl,
        publicPath: item.manifestEntry.publicPath,
      });
    }
  }

  for (const [file, replacements] of replacementsByFile) {
    const absoluteFile = resolveRoot(file);
    let content = fs.readFileSync(absoluteFile, 'utf8');
    for (const replacement of replacements) {
      content = replaceUrlVariants(content, replacement.sourceUrl, replacement.publicPath);
    }
    fs.writeFileSync(absoluteFile, content);
  }
}

function replaceUrlVariants(content, sourceUrl, publicPath) {
  const url = new URL(sourceUrl);
  const variants = new Set([
    sourceUrl,
    sourceUrl.replaceAll('/', '\\/'),
    `${url.pathname}`,
    `${url.pathname}`.replaceAll('/', '\\/'),
  ]);

  let updated = content;
  for (const variant of variants) {
    updated = updated.split(variant).join(publicPath);
  }
  return updated;
}

function printReport({ mode, managedCount, discoveredCount, unmanagedActive, unmanagedSourceOnly, managedMissing }) {
  console.log(`media extraction ${mode}`);
  console.log(`managed assets: ${managedCount}`);
  console.log(`discovered upload URLs: ${discoveredCount}`);
  console.log(`unmanaged active URLs: ${unmanagedActive.length}`);
  console.log(`unmanaged source-only URLs: ${unmanagedSourceOnly.length}`);
  console.log(`managed assets missing local copies: ${managedMissing.length}`);

  if (unmanagedActive.length > 0) {
    console.log('');
    console.log('unmanaged active URLs:');
    for (const item of unmanagedActive) {
      console.log(`- ${item.sourceUrl}`);
      console.log(`  sourceReferencePath: ${item.paths.sourceReferencePath}`);
      console.log(`  destinationPath: ${item.paths.destinationPath}`);
      console.log(`  publicPath: ${item.paths.publicPath}`);
      console.log(`  activeFiles: ${item.activeFiles.join(', ')}`);
    }
  }

  if (unmanagedSourceOnly.length > 0) {
    console.log('');
    console.log('source-only URLs not migrated by --apply:');
    for (const item of unmanagedSourceOnly.slice(0, 40)) {
      console.log(`- ${item.sourceUrl}`);
    }
    if (unmanagedSourceOnly.length > 40) {
      console.log(`... ${unmanagedSourceOnly.length - 40} more source-only URL(s) omitted`);
    }
  }

  if (managedMissing.length > 0) {
    console.log('');
    console.log('managed assets missing local copies:');
    for (const asset of managedMissing) {
      console.log(`- ${asset.id}: ${asset.sourceUrl}`);
    }
  }
}

function resolveRoot(relativePath) {
  return path.resolve(ROOT, relativePath);
}

function exitWithError(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
