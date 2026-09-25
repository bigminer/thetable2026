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
`webadmin.agent@thetabletx.org`, authenticating with an App Password, and arrives at
**`gary@thetabletx.org`**. Credentials are set in the Render dashboard, never
committed. See `src/lib/mailer.ts`.

Do not infer the destination from `.env.example`, which shows `info@thetabletx.org`.
The live `CONTACT_TO_EMAIL` is a `sync: false` Render secret and differs; the real value
was only visible in a delivered message.

The sending account needs 2-Step Verification enabled before an App Password can exist
at all — without one, Google rejects basic SMTP auth and every submission returns HTTP
500. Note also that changing that account's password invalidates its App Passwords, so a
password reset silently breaks form delivery until `SMTP_PASSWORD` is reissued in
Render.

Authentication as of 2026-09-07: SPF, DKIM and DMARC are all published for
`thetabletx.org`; delivered mail shows `SPF: PASS` and `DKIM: PASS`. `thetabletx.com`
has none of the three.

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

The feed originated on Anchor, which Spotify absorbed. **This site does not generate a
podcast feed and is not planned to** — it links out only, to Spotify and Apple Podcasts.
Links live in `src/config/site.ts`. Ignore any older document implying a feed route
exists.

Two links were removed on 2026-09-08. Google Podcasts shut down and its URL now lands on
a YouTube Music notice. Anchor FM is the same service as the Spotify link, since
anchor.fm redirects into Spotify for Podcasters.

## Merch — Printful

`https://the-table-tx.printful.me`, print-on-demand. `/merch/` describes the shop and
hands off with a single chip. No inventory, orders or fulfilment touch this site.

---

## Agents and roles

Two agents work on this project, with different access and different jobs. The split
was agreed 2026-09-07.

**Development agent** — a Claude Code session on the maintainer's workstation. Owns the
repository: reads, edits, builds, tests, commits, opens pull requests. GitHub is its
source of truth. It holds **no** authenticated access to church systems and should not
acquire any.

**Operations agent — `table-bot`** — a Hermes agent on the Linux host `bob1-1`. Holds
the authenticated integrations. Reads external systems on request and returns results
or stages files.

Its access is narrower than the profile suggests. Asked directly on 2026-09-07 it
reported: authenticated as `gary@thetabletx.org`, **Drive scope only — no Gmail scope
and no Workspace administrator access**. So it cannot read mailboxes, cannot inspect
message headers, and cannot see the admin console. Confirm what it can actually reach
before assuming; asking it is cheap and it answers honestly about gaps.

**The maintainer approves.** Pull request review is the gate for everything.

### Invariants

1. **No shared working tree.** Each agent works in its own checkout. Conflicts come from
   two agents editing the same files, not from two agents contributing to one repo.
2. **Nobody pushes directly to `main` or `release`.** Every change arrives as a pull
   request.
3. **Human approval is the control.** Which actor clicks merge is mechanical.

Both agents may author pull requests. A backlog card (`t_805813f3` on the `the-table`
board) covers the intended end state, where staff request content changes through
GroupMe and `table-bot` opens the pull request.

### Reaching table-bot

Over SSH, using the Tailscale FQDN — `known_hosts` trusts that name, not the short one:

```bash
ssh bigminer@bob1-1.tail55ce6a.ts.net
export HERMES_HOME=/home/bigminer/.hermes/profiles/table-bot
HERMES=/home/bigminer/.hermes/hermes-agent/venv/bin/hermes

$HERMES -z "..." --safe-mode   # one-shot request, text only
$HERMES kanban list            # the-table board
$HERMES kanban show <task_id>
$HERMES sessions list
```

An MCP server named `table-hermes` is configured for the same host, but it exposes
**only the messaging bridge** — Telegram, Discord, Slack and so on. `conversations_list`
and `channels_list` return zero because no messaging platform is connected to this
profile; the project history lives in `desktop` and `kanban` sessions, which that bridge
does not surface. **There is no Kanban tool over MCP** — board access is CLI-only.

On Windows, prefix SSH commands with `MSYS_NO_PATHCONV=1`, or Git Bash rewrites
`HERMES_HOME=/home/...` into a `C:/Program Files/Git/...` path.

### table-bot sees Workspace content this session cannot

Its profile holds its own Google credentials, authorized against the church account. It
knows of a Drive folder — **"The Table Photo Gallery 8-2026"**, favouring the
**"\*Favorites\* Edited"** subfolder — that returns nothing when searched through the
connectors described above, because those are bound to the maintainer's personal
account.

Its standing rule for that folder, which this project keeps: **selected photos are
copied into project-owned tracked assets, never hotlinked.**

So when Workspace content is needed and a search comes back empty, ask `table-bot`
rather than concluding the material does not exist.

The reverse also holds. Mailbox contents and message headers are readable by **neither**
agent — this session lacks the church account, `table-bot` lacks Gmail scope. Anything
requiring a mailbox is the maintainer's to check.

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
