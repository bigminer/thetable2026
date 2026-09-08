# External Resources

Systems this site depends on or draws content from, and what an agent session may do
with each. None of it lives in the repository, so none of it is discoverable by reading
the code.

`AGENTS.md` lists the external *destinations* the site links out to and must not turn
into local routes. This file covers the *sources* — the places the church's own material
lives.

---

## Google Workspace — `thetabletx.org`

The church runs on Google Workspace. Two things matter here.

### Drive

Assets that never made it into the repository. Known folders:

| Folder | ID | Holds |
|---|---|---|
| Sermon Slides | `1dDtYU36ezPqOViILkx2T0-TU06PjcC7P` | Weekly service decks, named by date (`July 20`, `April 27`). Series artwork is usually the title slide inside a deck rather than a standalone file |
| Media Team Roles | `15FpkVpNT39T3zzk_3HjWnCIyLlAs-unl` | Team documentation |

Both sit under parent `12rE-6m4MwZcJMKqlldoxvfsSvGeeLJIy`.

**Searched 2026-09-07 and not found in Drive:** standalone series cover art. Queries for
`Unclean`, `1 Peter`, `Deconstruction`, `Enchanted` and `Rooted` returned nothing. If
series art is needed, extract it from the title slide of the matching weekly deck, or
fall back — `/series/` renders a numbered key column when a series has no
`featuredImage`, and YouTube thumbnails are available at
`https://img.youtube.com/vi/<id>/hqdefault.jpg` (the pattern `our-story.astro` already
uses).

### Mail

Contact and newsletter form delivery goes out through Google Workspace SMTP as
`webadmin.agent@thetabletx.org`, authenticating with an App Password. Credentials are
set in the Render dashboard, never committed. See `src/lib/mailer.ts`.

### Connector access

The Gmail and Drive connectors are authorized against **one** Google account at a time.
As of 2026-09-07 that account is `bigminer@gmail.com`, the maintainer's personal
address, **not** `gary@thetabletx.org`.

The practical consequence: mail sent only to the church address is invisible to an agent
session, and church-owned Drive files are visible only where they have been shared with
the personal account. A search returning nothing is therefore **not** evidence the thing
does not exist.

Re-authorizing to the Workspace account is done by the maintainer in Claude's connector
settings, not by an agent.

## YouTube — `@thetabletx7926`

The source of every transcript. `.github/workflows/ingest-transcripts.yml` pulls
auto-captions weekly via `yt-dlp`, using the `YOUTUBE_CHANNEL_URL` repository variable
and a `YOUTUBE_COOKIES` secret. 334 transcripts are committed under
`data/transcripts/raw/`.

Message entries link out to YouTube rather than embedding a player, and `/ask` builds
deep links with a `?t=` offset from the detected sermon bounds.

## Church Center

`https://thetabletx.churchcenter.com` — giving, and the MeetUp interest forms. The
giving form is embedded inline on `/giving/`; everything else links out. Planning Center
is the church's system of record for people and events; the site holds none of that data
and should not try to.

## Podcast — Anchor / Spotify

The feed is hosted on Anchor and syndicated to Spotify, Apple and Google. **This site
does not generate a podcast feed and is not planned to** — it links out only. Links live
in `src/config/site.ts`. Ignore any older document implying a feed route exists.

## Merch — Printful

`https://the-table-tx.printful.me`, print-on-demand. `/merch/` describes the shop and
hands off with a single chip. No inventory, orders or fulfilment touch this site.

---

## What an agent session may do

- **Read** Drive and Gmail to find assets or answer a question about church material.
- **Copy an asset into the repository** when it belongs there — web-sized, renamed for
  content, following the media rules in `AGENTS.md`.
- **Never send mail, never modify or delete** anything in Drive or Gmail without being
  asked for that specific action.
- **Never copy personal data** — member names, contact details, giving records, prayer
  requests — out of Workspace and into the repository. The repository is public.
- **Say which account was searched** when reporting a result, since a miss may only mean
  the wrong mailbox.
