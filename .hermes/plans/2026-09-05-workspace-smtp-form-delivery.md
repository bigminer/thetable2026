# Form Delivery via Google Workspace (replacing Resend)

> Decision recorded 2026-09-05. Supersedes the Resend delivery path for
> `/api/contact` and `/api/newsletter`. Spec only — not yet implemented.
> Related: `2026-09-05-pre-cutover-audit.md` (D4, F2, F2a), `2026-05-16-domain-cutover-plan.md`.

---

## Decision

Send contact and newsletter form notifications through **Google Workspace SMTP**
instead of Resend.

**Rationale (owner, 2026-09-05):** consolidate on tooling already owned and managed.
Avoid standing up and maintaining another third-party vendor account for what is a
handful of notification emails per week.

**Supporting technical reasons:**
- The domain's Google Workspace MX, SPF and DKIM records already exist. No new DNS
  records, no domain-verification step, so this drops out of the cutover critical path.
- Deliverability to staff inboxes inside the same Workspace is effectively guaranteed.
- One fewer credential and one fewer dashboard to remember at renewal time.

**Accepted tradeoffs:**
- No delivery dashboard or bounce log. A silent delivery failure is discovered when
  staff notice form mail stopped. Mitigation in "Monitoring" below.
- An SMTP credential authenticates to a mailbox, a wider blast radius than a
  send-only Resend key. Mitigated by using a dedicated, empty mailbox.
- Google has repeatedly tightened App Password availability. If it is unavailable,
  fall back to Option B.

---

## Chosen approach

**Option A — App Password on a dedicated sending mailbox.** Recommended.

- Create a Workspace user `website@thetabletx.org` used for nothing else.
- Enable 2-Step Verification on it, then generate an App Password.
- Send via `smtp.gmail.com:587` (STARTTLS) authenticating as that user.

**Option B — Workspace SMTP relay** (`smtp-relay.gmail.com`). Fallback if App
Passwords are disabled by admin policy.

- Admin Console → Apps → Google Workspace → Gmail → Routing → SMTP relay service.
- Authenticate with **SMTP credentials, not an IP allowlist** — Render's egress IPs
  are not stable.
- More admin setup; same application code apart from host and credentials.

**Not chosen:** Gmail API with a service account and domain-wide delegation. Better
credential hygiene, but materially more code and admin work than two notification
forms justify.

---

## Prerequisites (owner tasks, outside the repo)

1. Create the `website@thetabletx.org` Workspace user.
2. Confirm App Passwords are permitted for the domain; enable 2SV on that account and
   generate one. If blocked, switch to Option B.
3. Create or confirm a **Google Group** for the destination (e.g. `office@thetabletx.org`)
   so `CONTACT_TO_EMAIL` does not point at one person's mailbox and survive staff turnover.
4. Confirm the intended sending domain is `.org`, not `.com` — `.env.example` currently
   says `.com` while canonical is `thetabletx.org`.

---

## Implementation scope

**Dependencies**
- Add `nodemailer` (+ `@types/nodemailer`).
- Remove `resend` from `site/package.json`.

**New shared module — `site/src/lib/mailer.ts`**
- Single `sendMail({ subject, html, replyTo })` used by both routes.
- One module-level `nodemailer.createTransport` (pooled) rather than one per request.
- Reads `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_TO_EMAIL`,
  `CONTACT_FROM_EMAIL`.
- Returns the same `{ error }`-shaped result the routes already branch on, so the
  call sites change minimally.

**Route changes — `src/pages/api/contact.ts`, `src/pages/api/newsletter.ts`**
- Replace the `new Resend(...)` / `resend.emails.send(...)` block with `sendMail(...)`.
- Keep every existing guard untouched: honeypot, required-field validation, email
  regex, length caps, HTML escaping, rate limiting, and the existing user-facing error
  strings with the phone-number fallback.

**Config**
- `render.yaml`: add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
  `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` as `sync: false`. This resolves audit D4,
  which is a cutover blocker regardless of which provider is used.
- `site/.env.example`: replace the Resend block with the SMTP block; fix the `.com`
  reference to `.org`.
- `site/.env`: create locally for testing. Gitignored — never committed.

**Docs**
- Note the delivery path in `site/docs/editorial-workflow.md` so staff know where
  form mail comes from and who owns the mailbox.

---

## Out of scope

- Audit item **F2a** (rate limiter may see Render's proxy IP rather than the client's)
  is independent of the mail provider. Track and fix separately.
- **F2c** (forms are JavaScript-only, no `<form action>` fallback) likewise.
- No change to what the forms collect, or to the "email the staff on submit" behavior,
  which is the intended and complete design.

---

## Acceptance criteria

1. `npm run build` passes; `resend` no longer appears in `package.json` or the lockfile.
2. Local submission of the contact form delivers to `CONTACT_TO_EMAIL`, arrives from
   `website@thetabletx.org`, and `replyTo` is the submitter's address.
3. Same verified for the newsletter form.
4. Honeypot submission still returns 200 and sends nothing.
5. Fourth submission within ten minutes still returns 429 with `Retry-After`.
6. With SMTP env vars unset, both routes still return the existing 500 "Form is not
   configured" message rather than throwing.
7. Received mail passes SPF and DKIM (check "Show original" in Gmail).
8. Verified on the deployed Render instance, not only locally.

---

## Monitoring

Since there is no delivery dashboard, add a standing check: submit the contact form
once after each production deploy that touches the API routes or env config, and
confirm arrival. Cheap, and it catches the silent-failure mode this approach accepts.
