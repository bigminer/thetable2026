import 'dotenv/config';
import type { APIRoute } from 'astro';
import { checkRateLimit } from '../../lib/rate-limit.ts';
import { loadSource, isApproved, loadIndex, createClient, answerQuestion } from '../../lib/sermon-chatbot/pilot.ts';
export const prerender = false;
const json = (data: unknown, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
});
export const GET: APIRoute = () => json({ error: 'Send a POST request with a question.' }, 405, { Allow: 'POST' });
export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Bound bytes before JSON parsing, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: 'Missing question.' }, 400);
  let size = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12000) { await reader.cancel(); return json({ error: 'Question is too long.' }, 413); }
      parts.push(value);
    }
  } catch { return json({ error: 'Could not read question.' }, 400); }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(parts).toString('utf8')); }
  catch { return json({ error: 'Invalid JSON.' }, 400); }
  const query = body && typeof body === 'object' && 'query' in body && typeof body.query === 'string' ? body.query.trim() : '';
  if (!query || query.length > 2000) return json({ error: 'Enter a question of up to 2,000 characters.' }, 400);
  const limit = checkRateLimit({ request, clientAddress, key: 'ask', limit: 10 });
  if (!limit.ok) return json({ error: limit.error }, limit.status, { 'Retry-After': String(limit.retryAfterSeconds) });
  try {
    const source = await loadSource();
    if (!source || !isApproved(source)) return json({ error: 'This sermon is awaiting review. Answers are not available yet.', status: 'review_pending' }, 503);
    // Load from disk only. There is deliberately no index generation in this route.
    const index = await loadIndex(source);
    const answer = await answerQuestion(query, source, index, createClient());
    return json(answer);
  } catch {
    console.warn('[ask] semantic_search_unavailable');
    return json({ error: 'Sermon search is temporarily unavailable. Please try again later.', status: 'unavailable' }, 503);
  }
};
