import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { POST } from '../../pages/api/ask.ts';
async function post(body: string) {
  return POST({request:new Request('http://localhost/api/ask/',{method:'POST',body}),clientAddress:'test-api'} as any);
}
test('malformed input is rejected without contacting a model', async () => {
  for (const body of ['null','[]','{}','broken','{"query":12}','{"query":""}']) assert.equal((await post(body)).status,400);
  assert.equal((await post(JSON.stringify({query:'x'.repeat(2001)}))).status,400);
  assert.equal((await post(' '.repeat(12001))).status,413);
});
test('a valid question with no reviewed source stays unavailable without network access', async () => {
  const originalDirectory=process.cwd(), originalFetch=globalThis.fetch;
  const directory=await mkdtemp(join(tmpdir(),'ask-api-test-'));
  let calls=0;
  try {
    process.chdir(directory);
    globalThis.fetch=async () => { calls++; throw new Error('Unexpected network call'); };
    const response=await post(JSON.stringify({query:'Why do I blame myself?'}));
    assert.equal(response.status,503);
    assert.equal(calls,0);
  } finally { globalThis.fetch=originalFetch; process.chdir(originalDirectory); await rm(directory,{recursive:true}); }
});
