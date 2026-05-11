import type { APIRoute } from 'astro';
import { createReadStream, existsSync } from 'node:fs';
import { extname, normalize, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';

const CONTENT_ATTACHMENTS_ROOT = resolve(process.cwd(), 'src/content/attachments');
const PUBLIC_ATTACHMENTS_ROOT = resolve(process.cwd(), 'public/attachments');

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

function safeResolve(root: string, requestedPath: string) {
  const normalized = normalize(requestedPath).replace(/^([/\\])+/, '');
  const candidate = resolve(root, normalized);
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  return candidate;
}

export const GET: APIRoute = async ({ params }) => {
  const requestedPath = params.path;
  if (!requestedPath) return new Response('Not found', { status: 404 });

  const candidates = [CONTENT_ATTACHMENTS_ROOT, PUBLIC_ATTACHMENTS_ROOT]
    .map((root) => safeResolve(root, requestedPath))
    .filter((value): value is string => Boolean(value));

  const filePath = candidates.find((candidate) => existsSync(candidate));
  if (!filePath) return new Response('Not found', { status: 404 });

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  const contentType = CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';

  return new Response(stream, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
