# Launch Checklist

This checklist covers the big-bang cutover from the WordPress origin to Cloudflare Pages and the rollback path back to the WordPress snapshot.

Do not execute the production DNS switch, Cloudflare Pages production promotion, or CDN purge before the approved launch window. Until then, use local preview, local API calls, fixtures, snapshots, or explicitly approved Cloudflare Pages preview deploys so the currently live WordPress production site is not disturbed.

## Cutover

1. Confirm `npm run plan:lint` and `npm run build` are green on the launch commit.
2. Confirm the preview deploy for the launch branch is healthy in Cloudflare Pages.
3. Promote the `main` branch deployment in Cloudflare Pages.
4. Update DNS so `thetabletx.com` resolves to Cloudflare Pages and `thetabletx.org` continues to redirect to `thetabletx.com`.
5. Purge CDN cache for the canonical public routes, at minimum `/`, `/giving/`, `/robots.txt`, and `/sitemap.xml`.
6. Verify key routes return the expected content and metadata:
   - `/`
   - `/giving/`
   - `/robots.txt`
   - `/sitemap.xml`
   - `/debug/planning-center/`
7. Confirm Search Console and sitemap submission continue to point at `thetabletx.com`.

## Rollback

1. Re-point `thetabletx.com` and `thetabletx.org` back to the WordPress origin.
2. Purge CDN cache again so stale Pages responses do not persist.
3. Verify the key routes on the WordPress snapshot before reopening the migration window.
4. Record the rollback window, reason, and owner in the launch log.

## Staging Rehearsal

Use a Cloudflare Pages preview deploy for the rehearsal branch when credentials are available. If preview deploy access is not available, rehearse the same route checks against the built preview server locally.

### Rehearsal steps

1. Build the site.
2. Start the preview server.
3. Smoke-test the key routes listed above.
4. Execute the DNS switch and CDN purge steps as checklist items, even if the rehearsal uses placeholders or a sandbox.
5. Walk the rollback path immediately after the cutover path.

### Rehearsal log

- Date: 2026-04-18
- Environment: local preview rehearsal
- Result: passed
- Notes: verified `/`, `/giving/`, `/robots.txt`, `/sitemap.xml`, and `/debug/planning-center/` against the local preview build; the rollback path remains the DNS re-point plus CDN purge sequence documented above.

## Final Hosted Launch Log

When the approved launch window opens, create `migration-data/hosted-launch-log.md` and record:

- approved launch window
- Cloudflare Pages production promotion result
- DNS switch result
- CDN purge result
- key routes verified
- rollback path verified
