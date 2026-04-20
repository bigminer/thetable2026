# Integration Wishlist (Deferred / Growth)

This file captures future integrations so they are not lost during the core migration.

Status legend:
- `deferred` = explicitly out of current launch scope
- `candidate` = worth evaluating after launch stabilization

## 1) YouTube Integration
- **Status:** deferred
- **Goal:** auto-surface latest sermons/messages from YouTube channel.
- **Candidate implementation:** nightly fetch to local JSON manifest, rendered by Astro.
- **Potential outputs:** homepage "Latest Video", `/messages/video` archive page.

## 2) Facebook Integration
- **Status:** deferred
- **Goal:** surface social updates without manual copy/paste.
- **Candidate implementation:** link-first strategy (low fragility), optional embedded feed block where stable.
- **Potential outputs:** social highlight section with latest post link(s).

## 3) Podcast Pipeline
- **Status:** deferred
- **Goal:** streamline publication from sermon workflow to podcast endpoints.
- **Candidate implementation:** normalize metadata in content files and emit feed-compatible outputs.
- **Potential outputs:** improved podcast index and feed generation automation.

## 4) Google Slides Integration (Events + Sermons)
- **Status:** deferred
- **Goal:** reduce manual duplication for event slides and sermon decks.
- **Candidate implementation:** Drive/Slides metadata sync into site content models.
- **Potential outputs:** "Current Series Deck", event-specific slide links, reusable slide blocks.

## 5) Cross-Channel Content Automation
- **Status:** candidate
- **Goal:** single publish action updates website + YouTube + podcast references + social links.
- **Candidate implementation:** lightweight orchestration job with channel-specific adapters.
- **Potential outputs:** publish checklist automation and channel sync status.

## Guardrails
- Do not implement these items in the initial migration unless scope is explicitly reopened.
- Keep interfaces stable so these integrations can be layered in without redesign.
