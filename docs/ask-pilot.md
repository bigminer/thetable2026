# Ask The Table: self-blame pilot

Status: implementation prepared; transcript approval, credits-only API activation,
real semantic evaluation, and release verification are separate gates. Anna reviews
“Trauma Self Blame” (`u7Q-WVrNLfc`). Nothing here constitutes that review.

## Content and review

`npm run ask:pilot -- ingest` downloads only this video's English captions, clips the
candidate sermon interval (21:20–53:30.24), and writes `data/ask/self-blame.json` with
pending review and consent. Full-service captions remain temporary and are deleted.
If YouTube cannot provide captions, the job fails; there is no paid transcription
fallback and no archive mark hiding the failure. An authorized local caption file can
be passed as `npm run ask:pilot -- ingest /absolute/path/to/captions.vtt`.

If YouTube blocks the GitHub runner, acquire locally and commit only the bounded
pending `data/ask/self-blame.json` on a staging branch. Dispatch the workflow with
that full commit SHA in `prepared_source_commit`. It fetches that one file, validates
it, clears any imported approval, and opens the same review PR. It never runs code
from the source commit. Identical existing content preserves its review; different
content requires a deliberate replacement. Do not commit full-service captions or
cookies. The 2026-11-17 direct runner attempt failed because its saved YouTube cookies
were expired; that failure did not mark the sermon processed.

The manual **Ingest sermon transcripts** workflow opens a draft PR for that file.
Its base is the branch selected when dispatching it. Weekly ingestion is paused for
the pilot; the obsolete archive-only branch must not be merged. The source file is
its own successful acquisition record. Identical reruns preserve review state;
changed upstream captions require an explicit review rather than overwriting edits.

The workflow also restores the existing review branch's source before acquisition,
so reruns detect and protect edits in the open PR. PRs created with GitHub's built-in
Actions token do not automatically trigger another workflow. After it creates or
updates the review branch, run `gh workflow run verify.yml --ref ask/self-blame-review`
and confirm the resulting checks pass on that PR's current commit before merging.

Anna checks the recording, speaker, consent, date (currently upload date), start/end
bounds, and caption accuracy. Preserve wording; correct transcription mistakes only
against the audio. Edit cues/metadata first, then get the exact content hash:

```
npm run ask:pilot -- hash
```

Only after Anna explicitly approves that content and consent, record it with:

```
npm run ask:pilot -- approve <the-approved-content-hash>
```

Changing any source content invalidates approval. Pending, revoked or stale-review
material is absent from both answers and the source feed. Removing the source also
immediately disables runtime answers. The statically generated feed is refreshed by
a rebuild; revoke and deploy together to remove its title/link as well.

## Credits-only billing gate

The user authorized promotional API credits with **no paid overage**, using a separate
API organization. Its creation currently requires OpenAI support. Do not use the
existing paid organization, a legacy key, purchased credits, or auto recharge.
The request was sent and escalated to a specialist on 2026-11-17; support says
the response will arrive by email in the coming days. The organization is not yet created.

Before making ANY embedding or answer call, verify the isolated organization has an
active promotional grant and no paid balance/payment arrangement/auto recharge. Make
a dedicated Ask project/key there. Keep actual account IDs, balances and keys out of
Git. Configure these in a local ignored `.env` and, later, Render:

- `ASK_OPENAI_API_KEY`
- `ASK_OPENAI_ORGANIZATION`
- `ASK_OPENAI_PROJECT`
- `ASK_CREDITS_ONLY_CONFIRMED=true`
- `ASK_CREDITS_EXPIRE_AT=<actual grant expiration, ISO 8601 with timezone>`

The configuration flag records verification; it does not itself enforce provider
billing. The **isolated promotional-only billing arrangement** is the financial
boundary. Never enable this flag on an organization that can charge paid usage.
Missing settings and expired grants fail closed before each network call. Requests
have no automatic retries, paid fallback or recharge. Renew the expiration only
when the next grant is verified. Set a conservative enforced project spend limit
within the verified balance as an additional control; alerts alone are not limits.
No API calls have been made by preparing this implementation.

## Saved semantic index

After source approval and billing verification:

```
npm run ask:pilot -- index
npm run ask:pilot -- check
```

Indexing uses `text-embedding-3-small`, 512 dimensions, and bounded passages with
small overlap. `data/ask/index.json` is a versioned deployable file, not a disposable
server cache. It contains the approved source hash, model, dimension and chunking
version plus passage vectors. The pilot file is small enough to review and ship with
the app; measure full-corpus size before expanding. Reuse unchanged passage vectors.
A changed model/dimension/chunker rebuilds the affected vectors offline. Stage source
and index together so an approved source without its matching index cannot build.

`npm run build` validates source/index consistency without contacting any model.
At question time, the server loads the saved source/index, embeds only the question,
and selects matching passages. There is no runtime corpus builder or lexical fallback
on this path. The answer model (`gpt-4.1-mini-2025-04-14`) selects at most two exact
excerpts; code validates them and generates source links. The UI uses text nodes,
never model-produced HTML. Failed selection returns clearly labeled search matches;
failed query embedding/index/credit gates return unavailable, not fabricated answers.

The 0.32 relevance cutoff is provisional. Similarity is not a calibrated probability.
One-sermon tests cannot establish ranking quality across a whole archive.

## Evaluation and publication

Before release, test real semantic questions against Anna-approved expected passages:

- Why do I feel responsible for things I could not control?
- Why does blaming myself make me feel safer?
- What is the difference between guilt and shame in this sermon?
- What time is Sunday service? (out of scope for this one-sermon pilot)
- How do I repair a dishwasher? (must abstain)

Record the actual question embedding and selection costs, latency, excerpts and
playback timestamps for these synthetic tests. Do not retain real visitors' question
text. Simulate provider errors and exhausted/expired credits. Verify clean deployments
and restarts make **zero document-embedding calls**, and content changes invalidate
approval/indexes. Unit tests use mock provider responses; they do not establish real
semantic relevance or model access.

Run `npm test`, `npm run build`, and `npm run test:smoke`. Use a local Node/Render
preview to test `/api/ask`; the static GitHub Pages preview has no working API.
Merge only reviewed PRs into `main`, then promote through a PR to `release`. Keep
navigation/noindex unchanged. Verify the production answer and timestamp after deploy.
Milestone 1 is complete only after that observed result, not when tests turn green.

## Current scope

The old multi-source helpers remain historical code, but the API, CLI and page now
use only `pilot.ts`. The older Ask/ingestion notes are superseded for this milestone.
`/series/` publishing, the backlog, and general website Q&A remain later milestones.
