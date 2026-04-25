---
stepsCompleted: [1, 2]
inputDocuments: []
session_topic: 'Astro migration strategy for thetabletx.com from WordPress'
session_goals: 'Brainstorm the migration strategy, content model, and which WordPress features to replace, with the goal of ending up with a phased plan and architecture decisions.'
selected_approach: 'ai-recommended'
techniques_used: ['Question Storming', 'First Principles Thinking', 'Morphological Analysis']
ideas_generated: []
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Gary
**Date:** 2026-04-21 22:18:25

## Session Overview

**Topic:** Astro migration strategy for thetabletx.com from WordPress
**Goals:** Brainstorm the migration strategy, content model, and which WordPress features to replace, with the goal of ending up with a phased plan and architecture decisions.

### Session Setup

This session is focused on designing a practical migration from the existing WordPress site to Astro with Markdown-managed content, while modernizing the site's architecture and editorial workflow.

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Astro migration strategy for thetabletx.com from WordPress with focus on migration strategy, content model, and WordPress feature replacement

**Recommended Techniques:**

- **Question Storming:** Surface the real migration questions and unknowns before discussing solutions
- **First Principles Thinking:** Separate essential site needs from WordPress-era assumptions
- **Morphological Analysis:** Systematically compare architecture combinations across content, media, integrations, and editorial workflows

**AI Rationale:** This sequence starts by defining the real decision space, then rebuilds the site from fundamentals, and finally turns those insights into structured architecture options that can feed a phased migration plan.

## Technique Execution

### Question Storming

**[Question Storming #1]**: Success Criteria
_Concept_: The desired end state is a site that looks nearly identical to the current WordPress site, is easier to manage through a Markdown-based workflow, and is more secure than the current setup. These three goals create a useful tension between visual fidelity, editorial simplicity, and technical modernization.
_Novelty_: This frames the migration as a preservation-and-improvement exercise rather than a redesign, which changes how we evaluate architecture and tooling choices.

**[Question Storming #2]**: Scope Anchor
_Concept_: The true migration scope should be defined by what the live production site at `thetabletx.com` currently displays on pages reachable from the site's navigation, not by everything present in the downloaded WordPress folder. This draws a strong line between user-facing requirements and historical WordPress residue.
_Novelty_: Instead of treating the WordPress backup as the source of truth, this uses the production experience as the canonical product definition for migration decisions.

**[Question Storming #3]**: Editable Content Boundaries
_Concept_: After migration, the site should keep editable pages, podcast episodes, series, speakers, staff, events, and homepage sections. Forms are different: they should be preserved for launch compatibility, but are not part of the preferred long-term content system and should eventually be replaced by API-based integrations with Planning Center or Google Workspace.
_Novelty_: This separates editorial content from operational workflows, which makes the Astro content model cleaner and keeps temporary legacy support from distorting the long-term architecture.

**[Question Storming #4]**: Editor Profile
_Concept_: The post-migration editors are expected to be administrative staff who are non-technical, but likely capable of working in Markdown through Obsidian. This implies the system should minimize exposure to code, Git complexity, schema confusion, and file management pitfalls.
_Novelty_: The editing workflow is not being designed for developers pretending to be editors; it must be genuinely usable by non-technical staff while still benefiting from Markdown-based content storage.

**[Question Storming #5]**: Editorial Experience Target
_Concept_: "Easier to manage" means the staff should be able to update page text, add podcast episodes, update homepage sections, upload images, and manage routine content in something that feels like editing a text document. Obsidian plus Vault CMS appears aligned with that goal. Events are different: scheduling should remain in the external system and be displayed on the site through an API integration or lightweight Markdown reference rather than duplicated as manually maintained local content.
_Novelty_: This creates a hybrid model where Markdown is the canonical source for authored content, while externally managed operational data can be referenced or synced into the site without pretending everything belongs in the vault.

**[Question Storming #6]**: Migration Pain Drivers
_Concept_: The strongest reasons to leave WordPress are plugin maintenance burden, overdue updates, security exposure, a complicated admin interface, fragile or complex theme/editor workflows, and bots targeting the site's forms. These are operational pain points, not just aesthetic preferences.
_Novelty_: This reframes the migration as an effort to reduce recurring organizational friction and attack surface, not merely to adopt a newer frontend stack.

**[Question Storming #7]**: Cutover Strategy
_Concept_: The preferred launch model is an all-at-once replacement: the Astro site should be fully functional before cutover, then replace WordPress in a single switchover. A preview hosting mechanism is needed so the client can review and approve the rebuilt site before launch.
_Novelty_: This prioritizes launch confidence and stakeholder signoff over incremental deployment, which increases the importance of preview infrastructure, parity validation, and pre-launch checklists.

**[Question Storming #8]**: Preview Access Model
_Concept_: A public preview URL is acceptable for staging and client review. This lowers operational friction around authentication and makes it easier to share interim builds during migration validation.
_Novelty_: By allowing a public preview environment, the project can optimize for fast feedback loops instead of gated internal deployment workflows.

**[Question Storming #9]**: Launch Risk Focus
_Concept_: The main launch risks include page fidelity, navigation, podcast completeness, event display, SEO and URL continuity, and editor readiness after launch. However, the deepest uncertainty is not what to validate but how to perform the domain cutover safely once the replacement site is approved.
_Novelty_: This distinguishes product validation risks from infrastructure transition risks, which means the migration plan should treat DNS/domain cutover as a separate launch workstream with its own checklist.

**[Question Storming #10]**: Domain Control Dependency
_Concept_: The current domain and DNS appear to be controlled through the WordPress hosting setup rather than an independently managed DNS account. That means final cutover may depend on extracting DNS control or coordinating changes through the existing hosting provider.
_Novelty_: This surfaces a non-content blocker that could delay launch even if the Astro rebuild is complete, making infrastructure ownership discovery part of migration readiness.

**[Question Storming #11]**: Hosting Provider Context
_Concept_: The current WordPress site is hosted on WP Engine. This likely means the launch transition will involve understanding whether the domain is registered there, whether DNS is managed there or elsewhere, and how to repoint the live site to the new Astro hosting platform.
_Novelty_: Knowing the specific host turns an abstract cutover concern into a concrete migration task: map WP Engine's role in domain, DNS, SSL, and current routing before launch.

**[Question Storming #12]**: URL Continuity
_Concept_: The migration should preserve the current URL structure wherever possible. This makes route parity, slug preservation, and redirect planning part of the core implementation rather than post-launch cleanup.
_Novelty_: Instead of treating routing as an implementation detail, this elevates it into a product requirement tied directly to continuity, SEO, and stakeholder trust.

**[Question Storming #13]**: Content Change Frequency
_Concept_: The most frequently changing content areas are podcast episodes, events display, and series, while all pages should remain editable even if they change less often. This suggests the future content architecture should optimize editorial workflows especially for recurring audio/event-related updates.
_Novelty_: This prevents the system from being designed around static pages alone and highlights which collections deserve the most ergonomic authoring experience.

**[Question Storming #14]**: Podcast Source Strategy
_Concept_: For podcast episodes, pulling data from the existing podcast source is preferred over manually authoring each episode as a Markdown entry. The site should ideally consume episode metadata from its upstream system and focus on presentation rather than duplicate editorial maintenance.
_Novelty_: This draws a line between content that should live in the vault and content that should be integrated from a system of record, which can significantly reduce maintenance overhead for recurring media content.

**[Question Storming #15]**: Podcast System Dependency
_Concept_: The podcast appears to be distributed through Spotify, but the actual account or feed source is not yet known and will need to be confirmed with the person who manages it. This creates a discovery dependency before the final podcast integration plan can be locked in.
_Novelty_: It reveals that some migration architecture decisions depend on recovering ownership and system-of-record details, not just code or content extraction.

**[Question Storming #16]**: Flexible Vault-CMS-Driven Structure
_Concept_: Media handling and homepage editing structure should follow the cleanest `vaultcms`-compatible pattern rather than being over-decided upfront. The user is open to either a single homepage document or modular section-based editing, depending on which pattern proves simplest and safest for non-technical staff.
_Novelty_: This keeps the architecture adaptable to the editorial ergonomics of the chosen Markdown CMS workflow instead of forcing a rigid content structure prematurely.

**[Question Storming #17]**: Safe Compromise Areas
_Concept_: Two acceptable temporary compromises are simplifying forms for launch and handling events through an external embed or API, with both areas allowed to remain simple or partially stubbed until the main site migration is substantially complete. This creates room to prioritize parity for the broader site before polishing the more integration-heavy features.
_Novelty_: This explicitly identifies low-regret corners where the migration can trade completeness for safety without violating the core success criteria.

### First Principles Thinking

**[First Principles #1]**: Core Job Hypothesis
_Concept_: The first instinct for the essential job of the new site is simply "manage content." That answer is broad, but it reveals the foundational expectation that the site should make publishing and maintaining church information straightforward rather than burdensome.
_Novelty_: Instead of assuming the site's essence is tied to WordPress features, this starts from the minimal principle that the system exists to make content stewardship easy.

**[First Principles #2]**: Preserve Proven Public UX
_Concept_: The visitor-facing goals are already handled by the existing user experience, and the migration is not intended to redesign that. The essential requirement is therefore to preserve the current public UX while replacing the backend/editorial system behind it.
_Novelty_: This separates product redesign from platform migration and clarifies that the innovation target is operational simplicity, not user-facing reinvention.

**[First Principles #3]**: Delivery Over Complexity
_Concept_: The new system mainly needs to serve the same content, preserve the same navigation, and maintain standard web requirements like HTTPS. There may be relatively little true hidden application logic; the core responsibility is reliable publishing and delivery of the current site experience.
_Novelty_: This challenges the assumption that every CMS migration involves deep backend behavior and suggests the replacement can stay intentionally simple if it preserves presentation, routing, and content availability.

**[First Principles #4]**: Publish-Step Acceptance
_Concept_: The editorial workflow does not need to be instant-publish. A sync, deploy, or publish step after editing is acceptable, which means the system can prioritize clarity and reliability over live inline publishing.
_Novelty_: This removes pressure to build a more complex real-time CMS and keeps static-site deployment workflows viable for a non-technical editorial team.

**[First Principles #5]**: Dual Non-Negotiables
_Concept_: The editorial CMS experience and the CI/CD or deployment pipeline should both be strong; they are not interchangeable tradeoffs. The system needs a usable content workflow for staff and a safe, dependable publishing path at the same time.
_Novelty_: This rejects a common false dichotomy in migration planning and establishes two equal success criteria for the replacement architecture.

**[First Principles #6]**: Validate Editorial Fit First
_Concept_: The next most important discovery is whether `vaultcms` can support the desired content workflow. Hosting and cutover planning are secondary until the editorial model proves viable.
_Novelty_: This sets an evidence-first migration order: validate authoring ergonomics before investing deeply in delivery infrastructure.

**[First Principles #7]**: Framework-Level Validation
_Concept_: A convincing `vaultcms` proof should demonstrate multiple content types modeled cleanly, not just a single editable page. The user wants confidence that the framework truly works for the site's broader architecture rather than merely appearing plausible in a narrow demo.
_Novelty_: This defines success as architectural repeatability across collections, which is a stronger validation standard than a one-off prototype.

**[First Principles #8]**: Proof-of-Framework Content Set
_Concept_: The best validation set for the framework is a series collection, a representative page with text and images, and the default landing page. Together these cover structured repeatable content, ordinary rich editorial content, and the most visible layout-critical page on the site.
_Novelty_: This creates a targeted proof set that can expose whether the content model generalizes across different shapes of content instead of only handling a trivial case.

### Morphological Analysis

**[Morphology #1]**: Series Field Breadth
_Concept_: The series content type should support editing of title, description, image, linked episodes, speaker, scripture, dates, and related visible metadata. This indicates the framework test must handle a reasonably rich structured collection rather than a shallow title-and-body model.
_Novelty_: The chosen proof set is not just visually representative; it deliberately exercises linked references, media, and multiple field types in one collection.

**[Morphology #2]**: Page Model Should Follow Vault CMS Conventions
_Concept_: For standard text-and-image pages, the preferred field/body structure should follow the cleanest `vaultcms` pattern rather than being pre-decided now. If `vaultcms` favors a frontmatter-plus-Markdown-body approach, that is acceptable so long as it remains intuitive for editors.
_Novelty_: This keeps the page schema subordinate to the CMS workflow instead of forcing the CMS to adapt to a premature content model.
