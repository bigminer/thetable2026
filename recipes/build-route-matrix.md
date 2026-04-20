# Recipe: build local route parity matrix

## Purpose
Create the local route expectation artifact from `migration-data/route-classification.json`.

## Inputs
- `migration-data/route-classification.json`

## Output
- `migration-data/redirect-matrix.yaml`

## Rules
- Do not re-crawl production.
- Do not invent redirects. A redirect row is valid only when `route-classification.json` has `classification: redirect`.
- `keep`, `needs-content`, and `needs-integration` entries should map to local expected paths.
- `technical` entries should document local non-public handling and must not become navigation/content routes.

## Expected Shape
Use this YAML shape:

```yaml
generated_from: migration-data/route-classification.json
host: https://thetabletx.com
routes:
  - source: /
    classification: keep
    expected:
      type: local_path
      path: /
  - source: /author/mhill/
    classification: technical
    expected:
      type: not_public_content
      status: 404
```

For redirects, use:

```yaml
  - source: /old-path/
    classification: redirect
    expected:
      type: redirect
      target: /new-path/
      status: 301
```

## Verify
```bash
bash scripts/verify/E3-S1.sh
```

Expected exit code: `0`.

## If it fails
- Missing route count: regenerate from `route-classification.json`, not from production.
- Redirect without target: fix `route-classification.json` first using `recipes/classify-route.md`.
- Ambiguous handling: stop and mark the story blocked; do not guess.
