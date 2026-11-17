import test from 'node:test';
import assert from 'node:assert/strict';
import { DIMENSIONS, VIDEO_ID, buildIndex, sourceHash, isApproved, validateIndex, chunkSource,
  verifySelection, requireCredits, answerQuestion, type Source } from './pilot.ts';
const vector = (n=1) => [n, ...Array(DIMENSIONS-1).fill(0)];
function source(): Source {
  const s: Source = { version: 1, videoId: VIDEO_ID, title: 'Test sermon', date: '2026-04-19', speaker: 'brett_tilford',
    start: 10, end: 30, provenance: 'test', cues: [
      { start: 10, end: 15, text: 'Blame can make us feel in control.' },
      { start: 16, end: 20, text: 'But that does not mean the hurt was your fault.' },
      { start: 21, end: 30, text: 'There is room to learn a different story about ourselves.' }
    ], review: { status: 'approved', reviewer: 'Anna Barnes', reviewedAt: '2026-11-17T12:00:00Z', consent: 'granted', contentHash: null } };
  s.review.contentHash = sourceHash(s); return s;
}
function client() {
  const calls: string[] = [];
  let selection: unknown;
  return { calls, setSelection(v: unknown) { selection=v; }, embeddings: { async create(request: {input: string}) {
    calls.push(request.input); return { data: [{embedding:vector()}] };
  } }, chat: { completions: { async create() { return { choices: [{message:{content:JSON.stringify(selection)}}] }; } } } } as any;
}
test('pending, revoked and edited sources cannot be searched or indexed', async () => {
  const s = source(), c=client();
  const index = await buildIndex(s,c);
  s.review.status='pending';
  await assert.rejects(buildIndex(s,c), /review/);
  assert.throws(()=>validateIndex(index,s));
  s.review.status='approved'; s.review.consent='pending'; assert.equal(isApproved(s),false);
  s.review.consent='granted'; s.cues[0].text='Edited transcript.'; assert.equal(isApproved(s),false);
  assert.throws(()=>validateIndex(index,s));
});
test('saved index survives clean reload and repeated builds make no document calls', async () => {
  const s=source(), c=client(), first=await buildIndex(s,c);
  assert.equal(c.calls.length,1);
  const saved=JSON.parse(JSON.stringify(first)); validateIndex(saved,s);
  await buildIndex(s,c,saved); assert.equal(c.calls.length,1);
  s.cues[0].text += ' Changed.'; s.review.contentHash=sourceHash(s);
  await buildIndex(s,c,saved); assert.equal(c.calls.length,2);
  const wrongModel={...saved,model:'different-model'};
  await buildIndex(source(),c,wrongModel); assert.equal(c.calls.length,3);
  saved.passages[0].text='Corrupted cache content';
  await buildIndex(source(),c,saved); assert.equal(c.calls.length,4);
});
test('rejects stale, incomplete and malformed embeddings', async () => {
  const s=source(), c=client(), index=await buildIndex(s,c);
  assert.throws(()=>validateIndex({...index,sourceHash:'wrong'},s));
  assert.throws(()=>validateIndex({...index,passages:[]},s));
  index.passages[0].vector=[NaN]; assert.throws(()=>validateIndex(index,s));
});
test('verbatim quotation resolves its own cue timestamp; fabricated quotations are rejected', () => {
  const s=source(), passages=chunkSource(s);
  const selected={relevant:true,quotes:[{passage_id:passages[0].id,text:s.cues[1].text}]};
  const quotes=verifySelection(selected,s,passages);
  assert.equal(quotes[0].seconds,16); assert.equal(quotes[0].url,`https://www.youtube.com/watch?v=${VIDEO_ID}&t=16s`);
  assert.throws(()=>verifySelection({relevant:true,quotes:[{passage_id:passages[0].id,text:'Brett definitely said a completely invented thing.'}]},s,passages));
  assert.throws(()=>verifySelection({relevant:true,quotes:[]},s,passages));
  assert.deepEqual(verifySelection({relevant:false,quotes:[]},s,passages),[]);
});
test('a question embeds only itself, with no keyword routing that excludes sermon passages', async () => {
  const s=source(), c=client(), index=await buildIndex(s,c);
  c.setSelection({relevant:true,quotes:[{passage_id:index.passages[0].id,text:s.cues[1].text}]});
  const answer=await answerQuestion('Why do I feel responsible for things I could not control?',s,index,c);
  assert.equal(answer.status,'answered'); assert.equal(c.calls.length,2);
  assert.equal(c.calls[1],'Why do I feel responsible for things I could not control?');
});
test('unsupported topics abstain and malformed model output is explicitly degraded', async () => {
  const s=source(), c=client(), index=await buildIndex(s,c);
  c.setSelection({relevant:false,quotes:[]});
  assert.equal((await answerQuestion('When is the picnic?',s,index,c)).status,'no_match');
  c.setSelection({relevant:true,quotes:[{passage_id:'invented',text:'Here is a made-up quotation.'}]});
  const answer=await answerQuestion('A question',s,index,c);
  assert.equal(answer.status,'degraded'); assert.match(answer.message,/couldn’t check whether they speak to your question/);
  assert.equal(answer.quotes[0].text,index.passages[0].text);
});
test('credits-only configuration fails closed without attestation, isolation or current expiry', () => {
  assert.throws(()=>requireCredits({OPENAI_API_KEY:'legacy-paid-key'}));
  const env={ASK_OPENAI_API_KEY:'test',ASK_OPENAI_ORGANIZATION:'org-test',ASK_OPENAI_PROJECT:'proj-test',
    ASK_CREDITS_ONLY_CONFIRMED:'true',ASK_CREDITS_EXPIRE_AT:new Date(Date.now()+60000).toISOString()};
  assert.doesNotThrow(()=>requireCredits(env));
  assert.throws(()=>requireCredits({...env,ASK_CREDITS_EXPIRE_AT:'2020-01-01'}));
  assert.throws(()=>requireCredits({...env,ASK_CREDITS_ONLY_CONFIRMED:'false'}));
  assert.throws(()=>requireCredits({...env,ASK_OPENAI_PROJECT:''}));
});
