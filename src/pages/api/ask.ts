import 'dotenv/config';
import type { APIRoute } from 'astro';
import { checkRateLimit } from '../../lib/rate-limit.ts';
import { loadSource, isApproved, loadIndex, createClient, answerQuestion } from '../../lib/sermon-chatbot/pilot.ts';
export const prerender = false;
const json = (data: unknown, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
});
export const GET: APIRoute = () => json({ error: 'You’re welcome to ask a question using the form on Ask The Table.' }, 405, { Allow: 'POST' });
export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Bound bytes before JSON parsing, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: 'Add a question in your own words, and we’ll look through the sermon with you.' }, 400);
  let size = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12000) { await reader.cancel(); return json({ error: 'Please shorten your question to 2,000 characters or fewer, then try again.' }, 413); }
      parts.push(value);
    }
  } catch { return json({ error: 'We couldn’t read your question. Please try sending it again.' }, 400); }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(parts).toString('utf8')); }
  catch { return json({ error: 'We couldn’t read your question. Please try sending it again.' }, 400); }
  const query = body && typeof body === 'object' && 'query' in body && typeof body.query === 'string' ? body.query.trim() : '';
  if (!query) return json({ error: 'Add a question in your own words, and we’ll look through the sermon with you.' }, 400);
  if (query.length > 2000) return json({ error: 'Please shorten your question to 2,000 characters or fewer, then try again.' }, 400);
  const limit = checkRateLimit({ request, clientAddress, key: 'ask', limit: 10 });
  if (!limit.ok) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return json({ error: `Please wait about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} before asking another question. Thanks for your patience.` }, limit.status, { 'Retry-After': String(limit.retryAfterSeconds) });
  }
  try {
    const source = await loadSource();
    if (!source || !isApproved(source)) return json({ error: 'We’re giving this sermon’s transcript a careful read before opening it up for your questions. Please check back with us.', status: 'review_pending' }, 503);
    // Load from disk only. There is deliberately no index generation in this route.
    const index = await loadIndex(source);
    const answer = await answerQuestion(query, source, index, createClient());
    return json(answer);
  } catch {
    console.warn('[ask] semantic_search_unavailable');
    return json({ error: 'We’re having trouble searching right now. Please try again in a little while.', status: 'unavailable' }, 503);
  }
};
