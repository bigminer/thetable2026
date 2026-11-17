import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('recovered captions cannot import approval or silently overwrite reviewed edits', async () => {
  const dir=await mkdtemp(join(tmpdir(),'ask-import-test-'));
  const candidate=join(dir,'candidate.json');
  const source={version:1,videoId:'u7Q-WVrNLfc',title:'Test',date:'2026-04-19',speaker:'brett_tilford',
    start:10,end:20,provenance:'test',cues:[{start:10,end:20,text:'Source text for review.'}],
    review:{status:'approved',reviewer:'Someone',reviewedAt:new Date().toISOString(),consent:'granted',contentHash:'untrusted'}};
  const run=()=>execFileSync(process.execPath,['--import',import.meta.resolve('tsx'),
    fileURLToPath(new URL('./ask-pilot.ts',import.meta.url)),'import',candidate],{cwd:dir,stdio:'pipe'});
  try {
    await writeFile(candidate,JSON.stringify(source)); run();
    const path=join(dir,'data/ask/self-blame.json');
    const imported=JSON.parse(await readFile(path,'utf8'));
    assert.equal(imported.review.status,'pending'); assert.equal(imported.review.consent,'pending');
    assert.equal(imported.review.contentHash,null);
    imported.review.reviewer='Human edits in progress'; await writeFile(path,JSON.stringify(imported));
    run(); assert.equal(JSON.parse(await readFile(path,'utf8')).review.reviewer,'Human edits in progress');
    source.cues[0].text='Unexpected replacement'; await writeFile(candidate,JSON.stringify(source));
    assert.throws(run); assert.equal(JSON.parse(await readFile(path,'utf8')).cues[0].text,'Source text for review.');
  } finally {await rm(dir,{recursive:true,force:true});}
});
