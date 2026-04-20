#!/usr/bin/env bash
# Verify E3-S1: local route parity matrix from classification artifact.

set -euo pipefail

MATRIX="migration-data/redirect-matrix.yaml"
CLASSIFICATION="migration-data/route-classification.json"

if [ ! -f "$MATRIX" ]; then
  echo "not ready: $MATRIX does not exist yet"
  exit 2
fi

node --input-type=module <<'NODE'
import fs from 'node:fs';
import { parse } from 'yaml';

const matrixPath = 'migration-data/redirect-matrix.yaml';
const classificationPath = 'migration-data/route-classification.json';

const matrix = parse(fs.readFileSync(matrixPath, 'utf8'));
const classifications = JSON.parse(fs.readFileSync(classificationPath, 'utf8'));

if (!matrix || matrix.generated_from !== classificationPath) {
  throw new Error(`${matrixPath}: generated_from must be ${classificationPath}`);
}

if (!Array.isArray(matrix.routes)) {
  throw new Error(`${matrixPath}: routes must be an array`);
}

if (matrix.routes.length !== classifications.length) {
  throw new Error(`${matrixPath}: expected ${classifications.length} routes, got ${matrix.routes.length}`);
}

const byPath = new Map();
for (const route of matrix.routes) {
  if (!route.source || !route.classification || !route.expected?.type) {
    throw new Error(`${matrixPath}: each route needs source, classification, and expected.type`);
  }
  byPath.set(route.source, route);
}

for (const entry of classifications) {
  const url = new URL(entry.url);
  const source = `${url.pathname}${url.search}`;
  const route = byPath.get(source);
  if (!route) throw new Error(`${matrixPath}: missing route for ${source}`);
  if (route.classification !== entry.classification) {
    throw new Error(`${matrixPath}: ${source} classification mismatch`);
  }
  if (entry.classification === 'redirect' && route.expected.type !== 'redirect') {
    throw new Error(`${matrixPath}: ${source} must be a redirect expectation`);
  }
  if (entry.classification === 'technical' && route.expected.type !== 'not_public_content') {
    throw new Error(`${matrixPath}: ${source} must be not_public_content`);
  }
}
NODE

echo "E3-S1 ok (local route parity matrix matches classification artifact)"
