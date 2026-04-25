# Navigation Preservation Checklist

## Purpose

Make navigation preservation an explicit migration requirement.

The Astro site must retain the current navigation structure and the behavior users expect from each menu target.

## Requirement

Preserve:

- top-level navigation structure
- submenu grouping
- menu label intent
- internal page destinations
- external menu destinations
- mobile navigation usability

This does not require reproducing WordPress internals. It does require that the user-facing navigation still behaves like the live site.

## Source Of Truth

Use:

- live menu inventory:
  - [_bmad-output/live-site-menu-inventory.md](/Users/gary/Dev/table-cms-vault/_bmad-output/live-site-menu-inventory.md:1)
- live site behavior:
  - `https://thetabletx.com/`

## Checklist

### 1. Preserve Menu Structure

Match the current live grouping:

- top-level links
- submenu membership
- relative prominence of sections

### 2. Preserve Menu Targets

For each live menu item:

- verify the target still exists
- verify it points to the same intended route or destination
- verify internal targets resolve inside Astro
- verify external targets remain external where intended

### 3. Preserve External Target Behavior

Current known external destination:

- Giving
  - external Church Center target

Rule:

- do not accidentally turn external destinations into broken internal routes

### 4. Preserve Label Intent

Labels do not need to be character-for-character identical if a small typography or punctuation change is necessary, but they should still communicate the same destination and grouping.

### 5. Preserve Mobile Navigation Usefulness

Verify:

- menu can be opened and closed easily
- submenu relationships still make sense
- link targets remain easy to reach on smaller screens

### 6. Use Navigation In Parity Review

Navigation review should include:

- labels
- grouping
- target URLs
- external/internal behavior

## Completion Standard

Navigation preservation is complete when:

- every live menu item has a matching Astro behavior
- internal links point to the intended migrated routes
- external links still behave intentionally
- the menu remains usable on desktop and mobile
