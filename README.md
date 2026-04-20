# Tablefresh

This repository contains the rebuilt website for The Table Church.

It is an Astro-based, static site that uses markdown content collections as the primary CMS. Non-technical contributors can author and edit content through Obsidian templates, then save the resulting files into `src/content`.

## Content Workflow

- `obsidian/templates` contains the starter files for pages, messages, staff, and events.
- Content is stored in markdown frontmatter and rendered by Astro.
- Planning Center is used as an external data source for events, with a local fixture fallback so the site can be worked on offline.
- The goal is to keep the site editable and verifiable locally for as long as possible.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the local dev server:

```bash
npm run dev
```

3. Build the site for verification:

```bash
npm run build
```

The dev server will usually be available at `http://localhost:4321`.

## Project Notes

- Static assets live in `public/`.
- Site content lives in `src/content/`.
- Integration helpers live in `src/lib/`.
- Page and layout code lives in `src/pages/`, `src/components/`, and `src/layouts/`.

