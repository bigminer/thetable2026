# Forms Migration Decision

## Decision

For the initial migration, convert form-driven pages into explicit temporary-action Astro pages instead of carrying over WordPress plugin form behavior.

This applies to:

- `contact-us`
- `sign-up-for-our-newsletter`

## What This Means

During migration:

- preserve page copy
- preserve headings and layout intent
- preserve route parity
- remove WordPress plugin form implementation
- replace live form blocks with explicit temporary contact/action content

## Why This Is The Right Move

This keeps the migration focused on:

- content migration
- editorial workflow
- style preservation
- navigation and route parity

It avoids pulling WordPress plugin complexity into Astro before the long-term form system is chosen and implemented well.

## Stub Rule

Do not leave fake working forms in place.

Use a clear temporary path such as:

- a short explanatory message
- a future-contact note
- a temporary phone, mail, Church Center, or hosted form link if appropriate and sourced

The page should make it clear that the final submission flow is a later implementation phase.

Current temporary launch behavior:

- Contact, newsletter, get-involved, and community meal pages point visitors to the sourced church phone number, [(469) 222-3617](tel:+14692223617).
- MeetUp interest and leadership/hosting flows remain intentional external Church Center forms.
- No fake local form is rendered in Astro.

## Later Implementation Options

These can be decided after migration:

- Planning Center People Forms
- Mailchimp signup form
- another external hosted form system if needed

## Recommendation

Treat forms as a deferred integration workstream.

For the initial Astro migration, ship the pages as content-complete with honest temporary action paths.
