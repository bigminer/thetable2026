# TheTableTX Domain Cutover Plan

**Goal:** Make `thetabletx.org` the primary canonical domain, keep `thetabletx.com` as a redirect-only secondary domain, and serve the site from the existing Render origin at `https://thetabletx.onrender.com/`.

**Current observed DNS state (2026-05-16):**
- DNS provider: GoDaddy / DomainControl (`ns07.domaincontrol.com`, `ns08.domaincontrol.com`)
- `thetabletx.com` apex: `A 34.73.34.70`
- `thetabletx.org` apex: `A 34.73.34.70`
- `www.thetabletx.com`: `CNAME thetabletx.com`
- `www.thetabletx.org`: `CNAME thetabletx.wpengine.com`
- Mail-related records currently in place include Google Workspace MX records and TXT verification/SPF records

---

## 1. Domain roles

- Primary / canonical: `https://thetabletx.org`
- Secondary / legacy: `https://thetabletx.com`
- Render origin: `https://thetabletx.onrender.com/`

Canonical URL, sitemap, OG `url`, and any structured data should point at `thetabletx.org` once cutover is complete.

---

## 2. Cutover order

### Phase 1: Prepare Render and HTTPS
1. Add `thetabletx.org` to the Render service that serves the Astro site.
2. Add `www.thetabletx.org` as a second domain if the host should accept both hostnames.
3. Confirm Render has issued TLS certificates for the new hostname(s).
4. Make sure the Astro site reports `thetabletx.org` as the canonical site URL.
5. Confirm there are no `AAAA` records on any hostname that will point directly at Render.

### Phase 2: Move the primary domain
1. Update DNS so `thetabletx.org` points at the Render service.
2. Keep the existing mail-related DNS records unchanged.
3. Verify the site loads on `https://thetabletx.org` with a valid certificate.
4. If `www.thetabletx.org` is used, confirm it redirects to the apex canonical URL or the chosen canonical hostname.

### Phase 3: Redirect the secondary domain
1. Configure `thetabletx.com` to send a permanent redirect to `https://thetabletx.org`.
2. Apply the same redirect behavior to `www.thetabletx.com`.
3. Preserve path and query string so deep links such as `/contact-us/` or `/?utm_source=...` survive the redirect.
4. Use a 301 redirect, not a meta refresh or JavaScript redirect.

### Phase 4: Retire legacy WordPress exposure
1. Audit old WordPress URLs and the most common indexed paths.
2. Add explicit redirects for any high-value old paths if they are still receiving traffic.
3. Leave genuinely obsolete paths to 404 only if they are not worth preserving.

---

## 3. DNS records to change

### For `thetabletx.org`
- Point the apex record to the Render service.
- Keep `www.thetabletx.org` aligned with the apex canonical choice.
- Remove any `AAAA` records if they exist for the Render-connected hostname.

### For `thetabletx.com`
- Do not leave it serving the site as an alternate canonical host.
- Route all traffic to `thetabletx.org` with a permanent redirect.
- If the DNS provider cannot do cross-domain redirects cleanly, use a dedicated redirect target that exists only to forward traffic.

---

## 4. Records that should remain unchanged

Do not modify mail or verification records as part of the web cutover unless mail migration is separately planned.

Keep:
- Google Workspace MX records
- SPF TXT records
- DKIM / DMARC records if present now or added later
- Google site-verification TXT records
- Any other email or service verification TXT records unrelated to web hosting

The web cutover should be isolated from mail delivery.

---

## 5. Verification checklist

### SSL
- `https://thetabletx.org` loads without certificate warnings
- `https://www.thetabletx.org` behaves as intended and does not expose a second canonical URL
- `https://thetabletx.com` and `https://www.thetabletx.com` redirect cleanly

### Canonical URLs
- Page source on the primary domain points canonical tags at `thetabletx.org`
- OG `url` metadata uses `thetabletx.org`
- Sitemap URLs use `thetabletx.org`
- Any share preview or structured data references use the primary domain

### Redirect behavior
- `thetabletx.com` → `thetabletx.org` with 301
- `www.thetabletx.com` → `thetabletx.org` with 301
- Path and query string are preserved
- Mixed-content warnings do not appear after redirect
- Old indexed paths still either redirect or fail gracefully as intended

### Mail safety
- Send a test email after the cutover to confirm mail still works
- Verify inbound mail records were not altered accidentally

---

## 6. Rollback notes

If the cutover needs to be reversed:
1. Restore the previous DNS target for the primary domain.
2. Temporarily point redirects back to the prior public host.
3. Recheck TLS issuance and canonical tags after rollback.
4. Keep mail records untouched during rollback as well.

---

## 7. Open questions before execution

- Should `www.thetabletx.org` canonicalize to the apex or remain a first-class hostname?
- Is the `thetabletx.com` redirect handled at the registrar, on Render, or by a small redirect-only service?
- Are there any legacy WordPress paths that deserve explicit permanent redirects before the DNS switch?
