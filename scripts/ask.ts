import { loadSource, isApproved, loadIndex, createClient, answerQuestion } from '../src/lib/sermon-chatbot/pilot.ts';
async function main() {
  const query = process.argv.slice(2).join(' ').trim();
  if (!query || query.length > 2000) throw new Error('Provide a question of up to 2,000 characters');
  const source = await loadSource();
  if (!source || !isApproved(source)) throw new Error('Transcript review required');
  console.log(JSON.stringify(await answerQuestion(query, source, await loadIndex(source), createClient()), null, 2));
}
main().catch(() => { console.error('Ask unavailable: check review, saved index, and credits-only configuration.'); process.exitCode = 1; });
