# Contact conversion measurement

Approved 2026-11-07 after the domain migration. Reuses the existing Google Ads
**Submit lead form** conversion, preserving its history and one-conversion setting.
This does not create a new Analytics property or change campaign bidding.

## Configuration

The live service is `thetabletx` in Render workspace `Table2026`. The service's
environment is the source of truth for actual tag values; `render.yaml` declares
`sync: false` placeholders. Both public build-time settings were staged in Render
on 2026-11-07, without replacing unrelated variables:

- `PUBLIC_GOOGLE_ADS_ID`: existing `AW-...` Google tag ID.
- `PUBLIC_GOOGLE_ADS_CONTACT_SEND_TO`: existing `AW-.../label` event destination,
  copied from Goals → Submit lead form → Manage → See event snippet.

These values are public in the delivered website, but account-specific values are
kept out of the repository. A **new production build** is required after changing
them because contact and other public routes are prerendered. Merely restarting
the old build will not activate tracking.

No GTM or GA4 ID was configured on the Render service at inspection time. The shell
now shares one gtag.js loader for direct GA4 and/or Ads. If `PUBLIC_GTM_ID` is added
later, GTM owns installation instead; configure the Google tag, Conversion Linker,
and existing Ads conversion there using custom event `contact_form_success`.
Do not add a second generic form-submit conversion or count a contact page view as
a delivered inquiry.

## What counts

`contact-us.astro` calls `createContactConversionTracker` after the API response.
It counts once per page only when HTTP succeeded, the response has `ok: true`, and
the honeypot is empty. Failed validation, CAPTCHA/SMTP failures, non-boolean success
values, and repeated responses do not count. Blocked or broken tags cannot turn
an accepted inquiry into an error in the form.

The event contains only the conversion destination and an empty user-data object.
Names, email, phone, and message fields are never passed to tracking. The shell
denies advertising user-data/personalization and disables Google signals before
loading tags. This intentionally forgoes enhanced-conversion matching and can
reduce attribution. Measurement cookies are not disabled by this change.

The existing Google tag had automatic detection of user-provided details enabled.
**Allow user-provided data capabilities was turned off and the saved state verified
on 2026-11-07.** Its only connected tag destination was the existing Ads account.
Do not re-enable automatic collection of contact details for this implementation.
The privacy page explains measurement and links Google's partner-site disclosure.

## Deployment and verification

1. Review the tracking PR, merge to main, then promote main to release. Render
   builds from release. Keep actual IDs in the service environment.
2. Check live page HTML for one gtag.js loader, the expected Ads configuration, and
   privacy defaults before the loader. Check the contact bundle has the configured
   event destination. No GTM/GA4 property is created as part of this work.
3. Use Tag Assistant with the production site and submit a clearly labelled test
   inquiry; confirm the success message, mail delivery, and one conversion event.
   Do not click a live paid ad for testing. A test without an ad interaction may
   verify the tag without appearing as an attributed campaign conversion.
4. Confirm no form values appear in the event. Check that failed submissions do
   not send a conversion. Allow for Google Ads reporting/diagnostic delays before
   expecting the account status to update.

Local validation: 65 tests, production build, 62 smoke checks, HTML loader/order
assertions, and browser checks of contact and privacy pages passed. An empty form
submission displayed the validation error. Production submission/mail delivery and
Google's receipt of a production event remain unverified until release activation.

## Existing integrations recovered

Ads Data Manager shows **The Table TX** as an already-linked GA4 property and one
already-linked Business Profile. Ads auto-tagging is enabled. Direct management
access to those products is a separate ownership task; earlier welcome screens
were not proof they did not exist. The reused Google tag itself has only the Ads
destination, so this change restores Ads inquiry measurement, not full GA4 traffic
reporting.
