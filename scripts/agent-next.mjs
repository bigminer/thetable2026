#!/usr/bin/env node
// Print the next actionable task, with its recipe and verify command.
// Preflight: runs plan:lint and verify:manifest; aborts if either fails.

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { parse } from 'yaml';

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString();
  } catch (e) {
    const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
    return { error: true, out, code: e.status ?? 1 };
  }
}

// --- Preflight -------------------------------------------------------------
const lint = run('node scripts/lint-plan.mjs');
if (lint.error) {
  console.error('PREFLIGHT FAIL: plan.yaml lint\n');
  console.error(lint.out);
  process.exit(1);
}

const manifest = run('bash scripts/verify/manifest.sh');
if (manifest.error) {
  console.error('PREFLIGHT FAIL: manifest contract drift\n');
  console.error(manifest.out);
  process.exit(1);
}

// --- Pick task -------------------------------------------------------------
const doc = parse(fs.readFileSync('plan.yaml', 'utf8'));
const tasks = doc.tasks ?? [];
const byId = new Map(tasks.map(t => [t.id, t]));
const OD_RE = /^OD-\d+$/;

const isOpenDecision = id => OD_RE.test(id);
const depsClear = t =>
  (t.blocked_by ?? []).every(dep => {
    if (isOpenDecision(dep)) return false;
    const target = byId.get(dep);
    return target?.status === 'done';
  });
const isStory = t => t.kind === 'story';

let cursor = tasks.find(t => isStory(t) && t.status === 'in_progress');
let reason = cursor ? 'in_progress' : null;

if (!cursor) {
  cursor = tasks.find(t => isStory(t) && t.status === 'todo' && depsClear(t));
  if (cursor) reason = 'next todo with all blockers cleared';
}

if (!cursor) {
  const openStories = tasks.filter(
    t => isStory(t) && t.status !== 'done' && t.status !== 'dropped'
  );
  const blockingODs = new Set();
  for (const t of openStories) {
    for (const dep of t.blocked_by ?? []) {
      if (isOpenDecision(dep)) blockingODs.add(dep);
    }
  }
  console.log('NO UNBLOCKED STORY AVAILABLE.\n');
  console.log(`open stories remaining: ${openStories.length}`);
  if (blockingODs.size) {
    console.log(`open decisions blocking work: ${[...blockingODs].sort().join(', ')}`);
    console.log('\nClose an open decision in DECISIONS.md (convert OD-### to D-###), then re-run.');
  }
  process.exit(0);
}

// --- Render ----------------------------------------------------------------
const budget = cursor.budget ?? doc.budgets_default;

console.log(`=== next task (${reason}) ===\n`);
console.log(`id:      ${cursor.id}`);
console.log(`title:   ${cursor.title}`);
if (cursor.needs)  console.log(`needs:   ${cursor.needs}`);
if (cursor.recipe) console.log(`recipe:  ${cursor.recipe}`);
if (cursor.verify) console.log(`verify:  bash ${cursor.verify}`);
if (cursor.output) console.log(`output:  ${cursor.output}`);
if (cursor.source) console.log(`source:  ${cursor.source}`);
if (budget) console.log(`budget:  ${budget.attempts} attempts / ${budget.time_hours}h`);
if (cursor.note) {
  const firstLine = String(cursor.note).trim().split('\n')[0];
  console.log(`note:    ${firstLine}`);
}

function printList(title, value) {
  if (!value) return;
  const items = Array.isArray(value) ? value : [value];
  console.log(`\n${title}:`);
  for (const item of items) console.log(`  - ${item}`);
}

printList('inputs', cursor.inputs ?? cursor.source);
printList('outputs', cursor.outputs ?? cursor.output);
printList('implementation steps', cursor.implementation_steps);
printList('non-goals', cursor.non_goals);

console.log('\nacceptance:');
for (const a of cursor.acceptance ?? []) {
  if (typeof a === 'string') {
    console.log(`  - ${a}`);
  } else if (a && typeof a === 'object') {
    // Mid-string ":" unquoted — YAML parsed as a mapping. Flatten for display.
    for (const [k, v] of Object.entries(a)) console.log(`  - ${k}: ${v}`);
  }
}

console.log('\nsteps:');
console.log(`  1. If a recipe is listed, read it (${cursor.recipe ?? 'no recipe — work from acceptance list'}).`);
console.log(`  2. Set ${cursor.id}.status to in_progress in plan.yaml (skip if already).`);
console.log('  3. Execute. Track attempts against the budget above.');
if (cursor.verify) {
  console.log(`  4. Run: bash ${cursor.verify}. Do not mark done unless exit 0.`);
} else {
  console.log('  4. Confirm all acceptance bullets above are met (no verify script yet).');
}
console.log('  5. Append a JOURNAL.md entry: Changed / Learned / Next / Open.');
console.log(`  6. Set ${cursor.id}.status to done in plan.yaml.`);
console.log('\nIf you exceed the budget, STOP and follow AGENTS.md Escalation Protocol.');
