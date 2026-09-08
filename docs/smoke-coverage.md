# Smoke Coverage

What `npm run test:smoke` (`scripts/verify-site.mjs`) checks, what it deliberately
does not, and why. Runs in CI on every push and pull request via
`.github/workflows/verify.yml`.

It boots the real built server through `scripts/start.mjs` — not a mock — and exercises
it over HTTP. Its purpose is **build integrity**: does every route still exist, finish
rendering, and connect to the routes it claims to. It is not a behaviour or visual test.

Reviewed 2026-09-07.

---

## Covered

| Check | What it catches |
|---|---|
| 21 page routes return 2xx | A route deleted, renamed, or throwing at render |
| HTML bodies contain `</html>` | A render that crashed partway and returned a truncated page |
| `sitemap-index.xml` and `robots.txt` return 2xx | The sitemap integration or the robots route breaking |
| 3 sample attachments return 2xx | Static media not being copied into the build |
| Unknown route returns a real 404 | A catch-all or redirect swallowing missing pages as 200 |
| One series detail page renders | `getStaticPaths` or the series template breaking |
| **Form endpoints are wired** | `/api/contact` or `/api/newsletter` missing or throwing on entry |
| **Every internal link resolves** | A typo'd `href`, or a link left behind when a page was renamed or removed |

### On the form checks

Two probes per endpoint, neither of which sends mail:

- malformed JSON → expects **400**, rejected at parse
- `{ "hp_name": "bot" }` → expects **200**, the honeypot returns early

This proves the routes exist and their handlers run. **It cannot prove SMTP is
configured.** Reaching `isMailConfigured()` requires a valid submission, which would
send real email to the church, so that check belongs to a production health check rather
than CI. A misconfigured mailer still ships green.

### On the link check

Internal `href`s are collected from every crawled page and each distinct target is
fetched once. Failures name the page that linked to the broken target. Anchors, query
strings, protocol-relative URLs and `/api/` routes are skipped — the last because they
require POST.

Redirects are followed, so a target that 301s is treated as resolving. That is
intentional: `/plan-your-visit/` redirects to `/service-times-locations` and should keep
passing.

## Not covered, deliberately

| Gap | Why it is left out |
|---|---|
| Header and nav actually rendered | Asserting specific markup is brittle against ordinary design edits. The GitHub Pages preview covers this visually |
| Visual and layout correctness | Out of scope by design — this is what the preview at <https://bigminer.github.io/thetable2026/> is for |
| `/api/ask` POST | The feature is hidden and unfinished. See [`ask-remaining-work.md`](ask-remaining-work.md) |
| SMTP actually configured | Cannot be tested without sending real email. Needs a production health check — **and this gap bit: on 2026-09-07 both forms were found returning HTTP 500 to every visitor while all 62 checks passed. `SMTP_USER` and `SMTP_PASSWORD` had never been set.** |
| Sitemap contents — right routes, right host | Worth adding at domain cutover, when the host matters. Not before |
| Canonical 301 (`thetabletx.com` → `.org`) | Requires Host-header spoofing against the built server. `canonicalRedirect` is already unit-tested directly |
| Every series detail page | Cost grows with the archive for little added signal. One sample catches template breakage |
| Whether a redirect is a redirect | `/plan-your-visit/` passes whether it 301s or is re-created as a page. Low stakes |

## Known weaknesses

- **The series sample is whichever link appears first** on `/series/`. A template that
  breaks only for, say, a series with no `featuredImage` would not be caught.
- **Link checking only sees crawled pages.** Series detail pages are not scanned for
  links, so a broken link inside one would be missed.
- **No timing or payload-size assertions.** A page that renders correctly but ships a
  9 MB hero video passes. Image optimisation is tracked in [`../ROADMAP.md`](../ROADMAP.md).
