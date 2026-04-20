#!/usr/bin/env node
// Lint plan.yaml for structural integrity.
// Fails on: missing required fields, invalid status/kind, unknown ID refs,
// duplicate IDs, circular blocked_by, missing parent, missing manifest path.
// Warns on: non-reciprocal unblocks/blocked_by, done task with non-done blockers.

import fs from 'node:fs';
import { parse } from 'yaml';

const PLAN_PATH = 'plan.yaml';
const VALID_STATUS = new Set(['todo', 'in_progress', 'blocked', 'done', 'dropped']);
const VALID_KIND = new Set(['gate', 'epic', 'story']);
const EXTERNAL_ID = /^OD-\d+$/;

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const src = fs.readFileSync(PLAN_PATH, 'utf8');
const doc = parse(src);

if (!doc || !Array.isArray(doc.tasks)) {
  console.error(`${PLAN_PATH}: missing tasks[] array`);
  process.exit(1);
}

const byId = new Map();
for (const t of doc.tasks) {
  if (!t || !t.id) {
    fail(`task missing id: ${JSON.stringify(t).slice(0, 80)}`);
    continue;
  }
  if (byId.has(t.id)) fail(`${t.id}: duplicate id`);
  byId.set(t.id, t);
  if (!t.title) fail(`${t.id}: missing title`);
  if (!t.status) fail(`${t.id}: missing status`);
  else if (!VALID_STATUS.has(t.status)) fail(`${t.id}: invalid status '${t.status}'`);
  if (!t.kind) fail(`${t.id}: missing kind`);
  else if (!VALID_KIND.has(t.kind)) fail(`${t.id}: invalid kind '${t.kind}'`);
}

const refIsValid = (id) => byId.has(id) || EXTERNAL_ID.test(id);
const hasAny = (t, keys) => keys.some((key) => Object.prototype.hasOwnProperty.call(t, key));

for (const t of doc.tasks) {
  for (const dep of t.blocked_by ?? []) {
    if (!refIsValid(dep)) fail(`${t.id}: blocked_by references unknown id '${dep}'`);
  }
  for (const u of t.unblocks ?? []) {
    if (!refIsValid(u)) {
      fail(`${t.id}: unblocks references unknown id '${u}'`);
      continue;
    }
    if (byId.has(u)) {
      const target = byId.get(u);
      const reciprocal = (target.blocked_by ?? []).includes(t.id);
      if (!reciprocal) {
        warn(`${t.id}.unblocks[${u}] is not reciprocated by ${u}.blocked_by`);
      }
    }
  }
  if (t.parent && !byId.has(t.parent)) {
    fail(`${t.id}: parent '${t.parent}' not found`);
  }
  if (t.verify && !fs.existsSync(t.verify)) {
    warn(`${t.id}: verify script missing at ${t.verify}`);
  }
  if (t.kind === 'story' && t.needs === 'execution' && t.status !== 'done' && t.status !== 'dropped') {
    if (!t.mode) fail(`${t.id}: execution story missing mode`);
    if (!hasAny(t, ['source', 'inputs'])) fail(`${t.id}: execution story missing source/inputs`);
    if (!hasAny(t, ['output', 'outputs'])) fail(`${t.id}: execution story missing output/outputs`);
    if (!t.verify) fail(`${t.id}: execution story missing verify`);
    if (!Array.isArray(t.acceptance) || t.acceptance.length === 0) {
      fail(`${t.id}: execution story missing acceptance`);
    }
  }
}

for (const t of doc.tasks) {
  if (t.status !== 'done') continue;
  for (const dep of t.blocked_by ?? []) {
    if (byId.has(dep) && byId.get(dep).status !== 'done') {
      warn(`${t.id} is done but blocker ${dep} is '${byId.get(dep).status}'`);
    }
  }
}

// Cycle detection on blocked_by (iterative DFS with path tracking)
function findCycle(start) {
  const stack = [[start, [start]]];
  const visited = new Set();
  while (stack.length) {
    const [node, path] = stack.pop();
    const t = byId.get(node);
    if (!t) continue;
    for (const dep of t.blocked_by ?? []) {
      if (!byId.has(dep)) continue;
      if (path.includes(dep)) return [...path.slice(path.indexOf(dep)), dep];
      if (visited.has(dep)) continue;
      visited.add(dep);
      stack.push([dep, [...path, dep]]);
    }
  }
  return null;
}
for (const id of byId.keys()) {
  const cycle = findCycle(id);
  if (cycle) { fail(`cycle in blocked_by: ${cycle.join(' -> ')}`); break; }
}

// Manifest contract sanity
if (doc.manifest_contract?.path) {
  if (!fs.existsSync(doc.manifest_contract.path)) {
    warn(`manifest_contract.path does not exist on disk: ${doc.manifest_contract.path}`);
  }
}

if (warnings.length) {
  console.log(`warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (errors.length) {
  console.log(`\nerrors (${errors.length}):`);
  for (const e of errors) console.log(`  x ${e}`);
  process.exit(1);
}
console.log(`plan.yaml ok — ${byId.size} tasks, ${warnings.length} warnings`);
