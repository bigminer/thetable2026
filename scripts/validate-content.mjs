#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'src', 'content');
const PUBLIC_ROOT = path.join(ROOT, 'public');
const NAVIGATION_PATH = path.join(ROOT, 'src', 'data', 'navigation.ts');
const ROUTE_CLASSIFICATION_PATH = path.join(ROOT, 'migration-data', 'route-classification.json');

function loadRouteClassification() {
  try {
    const raw = fs.readFileSync(ROUTE_CLASSIFICATION_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('expected an array');
    }

    const byUrl = new Map();
    for (const entry of parsed) {
      if (!isRecord(entry) || !isString(entry.url) || !isString(entry.classification)) {
        continue;
      }
      byUrl.set(entry.url, entry);
    }

    return byUrl;
  } catch (error) {
    throw new Error(`failed to load migration-data/route-classification.json: ${error.message}`);
  }
}

const routeClassification = loadRouteClassification();

function fail(errors) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

function readFrontmatter(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) {
    return { error: `${path.relative(ROOT, filePath)}: missing frontmatter block` };
  }
  try {
    return { data: parse(match[1]) ?? {} };
  } catch (error) {
    return {
      error: `${path.relative(ROOT, filePath)}: invalid frontmatter YAML (${error.message})`,
    };
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function isDateValue(value) {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function isUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isHref(value) {
  return typeof value === 'string' && (value.startsWith('/') || isUrl(value));
}

function resolveMediaPath(value) {
  if (typeof value !== 'string' || value.length === 0) return null;

  if (value.startsWith('/media/')) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.origin === 'https://thetabletx.com' && url.pathname.startsWith('/media/')) {
      return url.pathname;
    }
  } catch {
    return null;
  }

  return null;
}

function validateMediaReference(file, label, value, errors) {
  const mediaPath = resolveMediaPath(value);
  if (!mediaPath) return;

  const relativePath = mediaPath.replace(/^\/+/, '');
  const resolvedPath = path.normalize(path.join(PUBLIC_ROOT, relativePath));
  const publicRootWithSep = `${PUBLIC_ROOT}${path.sep}`;
  if (resolvedPath !== PUBLIC_ROOT && !resolvedPath.startsWith(publicRootWithSep)) {
    errors.push(`${file}: invalid media path for "${label}"`);
    return;
  }

  if (!fs.existsSync(resolvedPath)) {
    errors.push(`${file}: missing media asset for "${label}" (${value})`);
  }
}

function validateMediaObject(file, label, value, errors) {
  if (!isRecord(value)) {
    errors.push(`${file}: invalid field "${label}"`);
    return;
  }

  if (!isString(value.src)) {
    errors.push(`${file}: invalid field "${label}.src"`);
  } else {
    validateMediaReference(file, `${label}.src`, value.src, errors);
  }

  if (!isString(value.alt)) {
    errors.push(`${file}: invalid field "${label}.alt"`);
  }

  if (Object.prototype.hasOwnProperty.call(value, 'width') && value.width !== undefined && !isNonNegativeInteger(value.width)) {
    errors.push(`${file}: invalid field "${label}.width"`);
  }

  if (Object.prototype.hasOwnProperty.call(value, 'height') && value.height !== undefined && !isNonNegativeInteger(value.height)) {
    errors.push(`${file}: invalid field "${label}.height"`);
  }

  if (Object.prototype.hasOwnProperty.call(value, 'credit') && value.credit !== undefined && !isString(value.credit)) {
    errors.push(`${file}: invalid field "${label}.credit"`);
  }

  if (Object.prototype.hasOwnProperty.call(value, 'rights') && value.rights !== undefined && !isString(value.rights)) {
    errors.push(`${file}: invalid field "${label}.rights"`);
  }
}

function validateRawHtmlSource(file, prefix, source, errors) {
  if (!isRecord(source)) {
    errors.push(`${prefix}: missing field "source"`);
    return;
  }

  if (!isUrl(source.url)) {
    errors.push(`${prefix}: invalid field "source.url"`);
  }

  if (!isString(source.reason)) {
    errors.push(`${prefix}: invalid field "source.reason"`);
  }
}

function validateSeo(file, data, errors) {
  if (!Object.prototype.hasOwnProperty.call(data, 'seo') || data.seo === undefined) {
    return;
  }

  if (!isRecord(data.seo)) {
    errors.push(`${file}: invalid field "seo"`);
    return;
  }

  if (Object.prototype.hasOwnProperty.call(data.seo, 'title') && data.seo.title !== undefined && !isString(data.seo.title)) {
    errors.push(`${file}: invalid field "seo.title"`);
  }

  if (Object.prototype.hasOwnProperty.call(data.seo, 'description') && data.seo.description !== undefined && !isString(data.seo.description)) {
    errors.push(`${file}: invalid field "seo.description"`);
  }

  if (Object.prototype.hasOwnProperty.call(data.seo, 'canonical') && data.seo.canonical !== undefined && !isUrl(data.seo.canonical)) {
    errors.push(`${file}: invalid field "seo.canonical"`);
  }

  if (Object.prototype.hasOwnProperty.call(data.seo, 'noindex') && !isBoolean(data.seo.noindex)) {
    errors.push(`${file}: invalid field "seo.noindex"`);
  }

  if (Object.prototype.hasOwnProperty.call(data.seo, 'ogImage') && data.seo.ogImage !== undefined) {
    validateMediaObject(file, 'seo.ogImage', data.seo.ogImage, errors);
  }

  if (Object.prototype.hasOwnProperty.call(data.seo, 'twitterCard') && data.seo.twitterCard !== undefined) {
    if (!['summary', 'summary_large_image'].includes(data.seo.twitterCard)) {
      errors.push(`${file}: invalid field "seo.twitterCard"`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(data.seo, 'jsonLd') && data.seo.jsonLd !== undefined && !Array.isArray(data.seo.jsonLd)) {
    errors.push(`${file}: invalid field "seo.jsonLd"`);
  }
}

function extractNavigationSection(source, name) {
  const match = source.match(new RegExp(`export const ${name}[\\s\\S]*?=\\s*\\[(.*?)\\];`, 's'));
  return match ? match[1] : null;
}

function validateNavigation(errors) {
  if (!fs.existsSync(NAVIGATION_PATH)) {
    errors.push(`src/data/navigation.ts: navigation file missing`);
    return;
  }

  const source = fs.readFileSync(NAVIGATION_PATH, 'utf8');
  const mainSection = extractNavigationSection(source, 'mainNavigation');
  const footerSection = extractNavigationSection(source, 'footerNavigation');

  if (!mainSection) {
    errors.push(`src/data/navigation.ts: missing mainNavigation array`);
    return;
  }

  if (!footerSection) {
    errors.push(`src/data/navigation.ts: missing footerNavigation array`);
    return;
  }

  const mainHrefMatches = [...mainSection.matchAll(/href:\s*'([^']+)'/g)];
  if (mainHrefMatches.length === 0) {
    errors.push(`src/data/navigation.ts: mainNavigation must contain at least one link`);
  }

  for (const match of mainHrefMatches) {
    const href = match[1];
    if (!href.startsWith('/')) {
      errors.push(`src/data/navigation.ts: mainNavigation href "${href}" must be internal`);
      continue;
    }

    const absoluteHref = new URL(href, 'https://thetabletx.com').href;
    const entry = routeClassification.get(absoluteHref);
    if (!entry) {
      errors.push(`src/data/navigation.ts: mainNavigation href "${href}" is unclassified in migration-data/route-classification.json`);
      continue;
    }
    if (!['keep', 'needs-content', 'needs-integration'].includes(entry.classification)) {
      errors.push(`src/data/navigation.ts: mainNavigation href "${href}" has disallowed classification "${entry.classification}"`);
    }
  }

  if (!/external:\s*true/.test(footerSection)) {
    errors.push(`src/data/navigation.ts: footerNavigation must mark external links with external: true`);
  }
}

function requireField(file, data, key, predicate, errors, label = key) {
  if (!Object.prototype.hasOwnProperty.call(data, key)) {
    errors.push(`${file}: missing required field "${label}"`);
    return;
  }
  if (!predicate(data[key])) {
    errors.push(`${file}: invalid field "${label}"`);
  }
}

function validatePages(file, data, errors) {
  requireField(file, data, 'title', isString, errors);
  requireField(file, data, 'url', (value) => isString(value) && value.startsWith('/'), errors);
  if (Object.prototype.hasOwnProperty.call(data, 'description') && data.description !== undefined && !isString(data.description)) {
    errors.push(`${file}: invalid field "description"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'draft') && !isBoolean(data.draft)) {
    errors.push(`${file}: invalid field "draft"`);
  }
  validateSeo(file, data, errors);
  if (isString(data.url)) {
    const routeUrl = new URL(data.url, 'https://thetabletx.com').href;
    const routeEntry = routeClassification.get(routeUrl);
    if (!routeEntry) {
      errors.push(`${file}: page url "${data.url}" is unclassified in migration-data/route-classification.json`);
    } else if (routeEntry.classification === 'technical') {
      errors.push(`${file}: page url "${data.url}" is technical and must not be stored in content collections`);
    } else if (!['keep', 'needs-content', 'needs-integration'].includes(routeEntry.classification)) {
      errors.push(`${file}: page url "${data.url}" has disallowed classification "${routeEntry.classification}" in migration-data/route-classification.json`);
    }
  }
  if (!Array.isArray(data.blocks) || data.blocks.length === 0) {
    errors.push(`${file}: missing required field "blocks"`);
    return;
  }
  data.blocks.forEach((block, index) => {
    const prefix = `${file}: blocks[${index}]`;
    if (!isRecord(block)) {
      errors.push(`${prefix}: invalid block`);
      return;
    }
    if (!isString(block.type)) {
      errors.push(`${prefix}: missing field "type"`);
      return;
    }
    switch (block.type) {
      case 'markdown':
        if (!isString(block.body)) errors.push(`${prefix}: invalid field "body"`);
        break;
      case 'text':
        if (!isString(block.body)) errors.push(`${prefix}: invalid field "body"`);
        break;
      case 'hero':
        if (Object.prototype.hasOwnProperty.call(block, 'eyebrow') && block.eyebrow !== undefined && !isString(block.eyebrow)) {
          errors.push(`${prefix}: invalid field "eyebrow"`);
        }
        if (!isString(block.headline)) errors.push(`${prefix}: invalid field "headline"`);
        if (Object.prototype.hasOwnProperty.call(block, 'subheadline') && block.subheadline !== undefined && !isString(block.subheadline)) {
          errors.push(`${prefix}: invalid field "subheadline"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'image') && block.image !== undefined) {
          validateMediaObject(file, `${prefix}.image`, block.image, errors);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'actions') && block.actions !== undefined) {
          if (!Array.isArray(block.actions)) {
            errors.push(`${prefix}: invalid field "actions"`);
          } else {
            block.actions.forEach((action, actionIndex) => {
              if (!isRecord(action) || !isString(action.label) || !isUrl(action.href)) {
                errors.push(`${prefix}.actions[${actionIndex}]: invalid action`);
              }
            });
          }
        }
        break;
      case 'statement':
        if (Object.prototype.hasOwnProperty.call(block, 'heading') && block.heading !== undefined && !isString(block.heading)) {
          errors.push(`${prefix}: invalid field "heading"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'lead') && block.lead !== undefined && !isString(block.lead)) {
          errors.push(`${prefix}: invalid field "lead"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'emphasis') && block.emphasis !== undefined && !isString(block.emphasis)) {
          errors.push(`${prefix}: invalid field "emphasis"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'body') && block.body !== undefined && !isString(block.body)) {
          errors.push(`${prefix}: invalid field "body"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'imagePosition') && block.imagePosition !== undefined && !['left', 'right'].includes(block.imagePosition)) {
          errors.push(`${prefix}: invalid field "imagePosition"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'image') && block.image !== undefined) {
          validateMediaObject(file, `${prefix}.image`, block.image, errors);
        }
        break;
      case 'value_list':
        if (Object.prototype.hasOwnProperty.call(block, 'heading') && block.heading !== undefined && !isString(block.heading)) {
          errors.push(`${prefix}: invalid field "heading"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'intro') && block.intro !== undefined && !isString(block.intro)) {
          errors.push(`${prefix}: invalid field "intro"`);
        }
        if (!Array.isArray(block.items) || block.items.length === 0) {
          errors.push(`${prefix}: invalid field "items"`);
          break;
        }
        block.items.forEach((item, itemIndex) => {
          if (!isRecord(item) || !isString(item.title) || !isString(item.description)) {
            errors.push(`${prefix}.items[${itemIndex}]: invalid item`);
          }
        });
        break;
      case 'video':
        if (Object.prototype.hasOwnProperty.call(block, 'heading') && block.heading !== undefined && !isString(block.heading)) {
          errors.push(`${prefix}: invalid field "heading"`);
        }
        if (!isUrl(block.url)) errors.push(`${prefix}: invalid field "url"`);
        if (Object.prototype.hasOwnProperty.call(block, 'caption') && block.caption !== undefined && !isString(block.caption)) {
          errors.push(`${prefix}: invalid field "caption"`);
        }
        break;
      case 'feature_grid':
      case 'card_grid':
        if (!Array.isArray(block.items) || block.items.length === 0) {
          errors.push(`${prefix}: invalid field "items"`);
          break;
        }
        block.items.forEach((item, itemIndex) => {
          if (!isRecord(item) || !isString(item.title)) {
            errors.push(`${prefix}.items[${itemIndex}]: invalid item`);
            return;
          }
          if (Object.prototype.hasOwnProperty.call(item, 'description') && item.description !== undefined && !isString(item.description)) {
            errors.push(`${prefix}.items[${itemIndex}]: invalid field "description"`);
          }
          if (Object.prototype.hasOwnProperty.call(item, 'icon') && item.icon !== undefined && !isString(item.icon)) {
            errors.push(`${prefix}.items[${itemIndex}]: invalid field "icon"`);
          }
          if (Object.prototype.hasOwnProperty.call(item, 'href') && item.href !== undefined && !isUrl(item.href)) {
            errors.push(`${prefix}.items[${itemIndex}]: invalid field "href"`);
          }
          if (Object.prototype.hasOwnProperty.call(item, 'image') && item.image !== undefined) {
            validateMediaObject(file, `${prefix}.items[${itemIndex}].image`, item.image, errors);
          }
        });
        break;
      case 'columns':
        if (!Array.isArray(block.columns) || block.columns.length === 0) {
          errors.push(`${prefix}: invalid field "columns"`);
          break;
        }
        block.columns.forEach((column, columnIndex) => {
          if (!isRecord(column) || !isString(column.body)) {
            errors.push(`${prefix}.columns[${columnIndex}]: invalid column`);
          }
          if (Object.prototype.hasOwnProperty.call(column, 'heading') && column.heading !== undefined && !isString(column.heading)) {
            errors.push(`${prefix}.columns[${columnIndex}]: invalid field "heading"`);
          }
        });
        break;
      case 'image_grid':
        if (!Array.isArray(block.images) || block.images.length === 0) {
          errors.push(`${prefix}: invalid field "images"`);
          break;
        }
        block.images.forEach((image, imageIndex) => {
          validateMediaObject(file, `${prefix}.images[${imageIndex}]`, image, errors);
        });
        break;
      case 'video_embed':
      case 'form_embed':
      case 'map_embed':
        if (Object.prototype.hasOwnProperty.call(block, 'provider') && block.provider !== undefined && !isString(block.provider)) {
          errors.push(`${prefix}: invalid field "provider"`);
        }
        if (!isUrl(block.url)) errors.push(`${prefix}: invalid field "url"`);
        break;
      case 'quote':
        if (!isString(block.quote)) errors.push(`${prefix}: invalid field "quote"`);
        if (Object.prototype.hasOwnProperty.call(block, 'attribution') && block.attribution !== undefined && !isString(block.attribution)) {
          errors.push(`${prefix}: invalid field "attribution"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'role') && block.role !== undefined && !isString(block.role)) {
          errors.push(`${prefix}: invalid field "role"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'image') && block.image !== undefined) {
          validateMediaObject(file, `${prefix}.image`, block.image, errors);
        }
        break;
      case 'staff_spotlight':
        if (Object.prototype.hasOwnProperty.call(block, 'staff') && block.staff !== undefined && !isString(block.staff)) {
          errors.push(`${prefix}: invalid field "staff"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'speaker') && block.speaker !== undefined && !isString(block.speaker)) {
          errors.push(`${prefix}: invalid field "speaker"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'headline') && block.headline !== undefined && !isString(block.headline)) {
          errors.push(`${prefix}: invalid field "headline"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'body') && block.body !== undefined && !isString(block.body)) {
          errors.push(`${prefix}: invalid field "body"`);
        }
        break;
      case 'series_feature':
        if (!isString(block.featuredSeries)) errors.push(`${prefix}: invalid field "featuredSeries"`);
        if (Object.prototype.hasOwnProperty.call(block, 'headline') && block.headline !== undefined && !isString(block.headline)) {
          errors.push(`${prefix}: invalid field "headline"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'description') && block.description !== undefined && !isString(block.description)) {
          errors.push(`${prefix}: invalid field "description"`);
        }
        break;
      case 'event_feature':
        if (!isString(block.featuredEvent)) errors.push(`${prefix}: invalid field "featuredEvent"`);
        if (Object.prototype.hasOwnProperty.call(block, 'headline') && block.headline !== undefined && !isString(block.headline)) {
          errors.push(`${prefix}: invalid field "headline"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'description') && block.description !== undefined && !isString(block.description)) {
          errors.push(`${prefix}: invalid field "description"`);
        }
        break;
      case 'cta':
        if (!isString(block.heading)) errors.push(`${prefix}: invalid field "heading"`);
        if (Object.prototype.hasOwnProperty.call(block, 'body') && block.body !== undefined && !isString(block.body)) {
          errors.push(`${prefix}: invalid field "body"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'imagePosition') && block.imagePosition !== undefined && !['left', 'right'].includes(block.imagePosition)) {
          errors.push(`${prefix}: invalid field "imagePosition"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'image') && block.image !== undefined) {
          validateMediaObject(file, `${prefix}.image`, block.image, errors);
        }
        if (!Array.isArray(block.links) || block.links.length === 0) {
          errors.push(`${prefix}: invalid field "links"`);
          break;
        }
        block.links.forEach((link, linkIndex) => {
          if (!isRecord(link) || !isString(link.label) || !isHref(link.href)) {
            errors.push(`${prefix}.links[${linkIndex}]: invalid link`);
          }
          if (Object.prototype.hasOwnProperty.call(link, 'description') && link.description !== undefined && !isString(link.description)) {
            errors.push(`${prefix}.links[${linkIndex}]: invalid field "description"`);
          }
        });
        break;
      case 'cta_list':
        if (!isString(block.heading)) errors.push(`${prefix}: invalid field "heading"`);
        if (Object.prototype.hasOwnProperty.call(block, 'intro') && block.intro !== undefined && !isString(block.intro)) {
          errors.push(`${prefix}: invalid field "intro"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'imagePosition') && block.imagePosition !== undefined && !['left', 'right'].includes(block.imagePosition)) {
          errors.push(`${prefix}: invalid field "imagePosition"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'image') && block.image !== undefined) {
          validateMediaObject(file, `${prefix}.image`, block.image, errors);
        }
        if (!Array.isArray(block.items) || block.items.length === 0) {
          errors.push(`${prefix}: invalid field "items"`);
          break;
        }
        block.items.forEach((item, itemIndex) => {
          if (!isRecord(item) || !isString(item.label)) {
            errors.push(`${prefix}.items[${itemIndex}]: invalid item`);
            return;
          }
          if (Object.prototype.hasOwnProperty.call(item, 'href') && item.href !== undefined && !isHref(item.href)) {
            errors.push(`${prefix}.items[${itemIndex}]: invalid field "href"`);
          }
          if (Object.prototype.hasOwnProperty.call(item, 'description') && item.description !== undefined && !isString(item.description)) {
            errors.push(`${prefix}.items[${itemIndex}]: invalid field "description"`);
          }
        });
        break;
      case 'social_links':
        if (!Array.isArray(block.links) || block.links.length === 0) {
          errors.push(`${prefix}: invalid field "links"`);
          break;
        }
        block.links.forEach((link, linkIndex) => {
          if (!isRecord(link) || !isString(link.label) || !isUrl(link.href)) {
            errors.push(`${prefix}.links[${linkIndex}]: invalid link`);
            return;
          }
          if (Object.prototype.hasOwnProperty.call(link, 'icon') && link.icon !== undefined && !isString(link.icon)) {
            errors.push(`${prefix}.links[${linkIndex}]: invalid field "icon"`);
          }
        });
        break;
      case 'location':
        if (!isString(block.heading)) errors.push(`${prefix}: invalid field "heading"`);
        if (Object.prototype.hasOwnProperty.call(block, 'intro') && block.intro !== undefined && !isString(block.intro)) {
          errors.push(`${prefix}: invalid field "intro"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'note') && block.note !== undefined && !isString(block.note)) {
          errors.push(`${prefix}: invalid field "note"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'imagePosition') && block.imagePosition !== undefined && !['left', 'right'].includes(block.imagePosition)) {
          errors.push(`${prefix}: invalid field "imagePosition"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'image') && block.image !== undefined) {
          validateMediaObject(file, `${prefix}.image`, block.image, errors);
        }
        if (!Array.isArray(block.addressLines) || block.addressLines.length === 0 || block.addressLines.some((line) => !isString(line))) {
          errors.push(`${prefix}: invalid field "addressLines"`);
        }
        if (!isString(block.phone)) errors.push(`${prefix}: invalid field "phone"`);
        if (!isString(block.serviceTime)) errors.push(`${prefix}: invalid field "serviceTime"`);
        if (!isUrl(block.mapUrl)) errors.push(`${prefix}: invalid field "mapUrl"`);
        if (Object.prototype.hasOwnProperty.call(block, 'mapLabel') && block.mapLabel !== undefined && !isString(block.mapLabel)) {
          errors.push(`${prefix}: invalid field "mapLabel"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'links') && block.links !== undefined) {
          if (!Array.isArray(block.links)) {
            errors.push(`${prefix}: invalid field "links"`);
          } else {
            block.links.forEach((link, linkIndex) => {
              if (!isRecord(link) || !isString(link.label) || !isHref(link.href)) {
                errors.push(`${prefix}.links[${linkIndex}]: invalid link`);
              }
            });
          }
        }
        break;
      case 'form':
        if (!isString(block.heading)) errors.push(`${prefix}: invalid field "heading"`);
        if (Object.prototype.hasOwnProperty.call(block, 'intro') && block.intro !== undefined && !isString(block.intro)) {
          errors.push(`${prefix}: invalid field "intro"`);
        }
        if (block.route !== 'contact-us') {
          errors.push(`${prefix}: invalid field "route"`);
        }
        if (Object.prototype.hasOwnProperty.call(block, 'submitLabel') && block.submitLabel !== undefined && !isString(block.submitLabel)) {
          errors.push(`${prefix}: invalid field "submitLabel"`);
        }
        break;
      case 'raw_html':
        if (!isString(block.html)) errors.push(`${prefix}: invalid field "html"`);
        if (block.sanitized !== true) {
          errors.push(`${prefix}: invalid field "sanitized"`);
        }
        validateRawHtmlSource(file, prefix, block.source, errors);
        break;
      case 'belong_split':
        if (!isString(block.quote)) errors.push(`${prefix}: invalid field "quote"`);
        break;
      case 'affirming_chips':
        if (!Array.isArray(block.chips)) errors.push(`${prefix}: invalid field "chips"`);
        break;
      default:
        errors.push(`${prefix}: unknown block type "${block.type}"`);
    }
  });
}

function validateMessages(file, data, errors) {
  requireField(file, data, 'title', isString, errors);
  requireField(file, data, 'publishedAt', isDateValue, errors);
  requireField(file, data, 'summary', isString, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'series') && data.series !== undefined && !isString(data.series)) {
    errors.push(`${file}: invalid field "series"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'speakers') && data.speakers !== undefined) {
    if (!Array.isArray(data.speakers)) {
      errors.push(`${file}: invalid field "speakers"`);
    } else if (data.speakers.some((speaker) => !isString(speaker))) {
      errors.push(`${file}: invalid field "speakers"`);
    }
  }
  if (Object.prototype.hasOwnProperty.call(data, 'audioUrl') && data.audioUrl !== undefined && !isUrl(data.audioUrl)) {
    errors.push(`${file}: invalid field "audioUrl"`);
  } else if (Object.prototype.hasOwnProperty.call(data, 'audioUrl') && isUrl(data.audioUrl)) {
    validateMediaReference(file, 'audioUrl', data.audioUrl, errors);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'videoUrl') && data.videoUrl !== undefined && !isUrl(data.videoUrl)) {
    errors.push(`${file}: invalid field "videoUrl"`);
  } else if (Object.prototype.hasOwnProperty.call(data, 'videoUrl') && isUrl(data.videoUrl)) {
    validateMediaReference(file, 'videoUrl', data.videoUrl, errors);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'scripture') && data.scripture !== undefined && !isString(data.scripture)) {
    errors.push(`${file}: invalid field "scripture"`);
  }
  validateSeo(file, data, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'draft') && !isBoolean(data.draft)) {
    errors.push(`${file}: invalid field "draft"`);
  }
}

function validateSeries(file, data, errors) {
  requireField(file, data, 'title', isString, errors);
  requireField(file, data, 'summary', isString, errors);
  requireField(file, data, 'startDate', isDateValue, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'endDate') && data.endDate !== undefined && !isDateValue(data.endDate)) {
    errors.push(`${file}: invalid field "endDate"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'image') && data.image !== undefined) {
    validateMediaObject(file, 'image', data.image, errors);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'churchCenterUrl') && data.churchCenterUrl !== undefined && !isUrl(data.churchCenterUrl)) {
    errors.push(`${file}: invalid field "churchCenterUrl"`);
  }
  validateSeo(file, data, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'draft') && !isBoolean(data.draft)) {
    errors.push(`${file}: invalid field "draft"`);
  }
}

function validateStaff(file, data, errors) {
  requireField(file, data, 'name', isString, errors);
  requireField(file, data, 'role', isString, errors);
  if (!Object.prototype.hasOwnProperty.call(data, 'bio')) {
    errors.push(`${file}: missing required field "bio"`);
  } else if (!isString(data.bio)) {
    errors.push(`${file}: invalid field "bio"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'email') && data.email !== undefined && !isUrl(`mailto:${data.email}`)) {
    errors.push(`${file}: invalid field "email"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'phone') && data.phone !== undefined && !isString(data.phone)) {
    errors.push(`${file}: invalid field "phone"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'photo') && data.photo !== undefined) {
    validateMediaObject(file, 'photo', data.photo, errors);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'groups') && data.groups !== undefined) {
    if (!Array.isArray(data.groups) || data.groups.some((group) => !isString(group))) {
      errors.push(`${file}: invalid field "groups"`);
    }
  }
  if (Object.prototype.hasOwnProperty.call(data, 'order') && !isNonNegativeInteger(data.order)) {
    errors.push(`${file}: invalid field "order"`);
  }
  validateSeo(file, data, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'draft') && !isBoolean(data.draft)) {
    errors.push(`${file}: invalid field "draft"`);
  }
}

function validateSpeakers(file, data, errors) {
  requireField(file, data, 'name', isString, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'summary') && data.summary !== undefined && !isString(data.summary)) {
    errors.push(`${file}: invalid field "summary"`);
  }
  if (!Object.prototype.hasOwnProperty.call(data, 'bio')) {
    errors.push(`${file}: missing required field "bio"`);
  } else if (!isString(data.bio)) {
    errors.push(`${file}: invalid field "bio"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'photo') && data.photo !== undefined) {
    validateMediaObject(file, 'photo', data.photo, errors);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'staff') && data.staff !== undefined && !isString(data.staff)) {
    errors.push(`${file}: invalid field "staff"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'order') && !isNonNegativeInteger(data.order)) {
    errors.push(`${file}: invalid field "order"`);
  }
  validateSeo(file, data, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'draft') && !isBoolean(data.draft)) {
    errors.push(`${file}: invalid field "draft"`);
  }
}

function validateStaffGroups(file, data, errors) {
  requireField(file, data, 'title', isString, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'description') && data.description !== undefined && !isString(data.description)) {
    errors.push(`${file}: invalid field "description"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'order') && !isNonNegativeInteger(data.order)) {
    errors.push(`${file}: invalid field "order"`);
  }
  validateSeo(file, data, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'draft') && !isBoolean(data.draft)) {
    errors.push(`${file}: invalid field "draft"`);
  }
}

function validateEvents(file, data, errors) {
  requireField(file, data, 'title', isString, errors);
  requireField(file, data, 'startsAt', isDateValue, errors);
  requireField(file, data, 'summary', isString, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'endsAt') && data.endsAt !== undefined && !isDateValue(data.endsAt)) {
    errors.push(`${file}: invalid field "endsAt"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'location') && data.location !== undefined && !isString(data.location)) {
    errors.push(`${file}: invalid field "location"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'url') && data.url !== undefined && !isUrl(data.url)) {
    errors.push(`${file}: invalid field "url"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'categories') && data.categories !== undefined) {
    if (!Array.isArray(data.categories) || data.categories.some((category) => !isString(category))) {
      errors.push(`${file}: invalid field "categories"`);
    }
  }
  validateSeo(file, data, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'draft') && !isBoolean(data.draft)) {
    errors.push(`${file}: invalid field "draft"`);
  }
}

function validateEventCategories(file, data, errors) {
  requireField(file, data, 'title', isString, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'description') && data.description !== undefined && !isString(data.description)) {
    errors.push(`${file}: invalid field "description"`);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'order') && !isNonNegativeInteger(data.order)) {
    errors.push(`${file}: invalid field "order"`);
  }
  validateSeo(file, data, errors);
  if (Object.prototype.hasOwnProperty.call(data, 'draft') && !isBoolean(data.draft)) {
    errors.push(`${file}: invalid field "draft"`);
  }
}

const validators = new Map([
  ['pages', validatePages],
  ['messages', validateMessages],
  ['series', validateSeries],
  ['speakers', validateSpeakers],
  ['staff', validateStaff],
  ['staff-groups', validateStaffGroups],
  ['events', validateEvents],
  ['event-categories', validateEventCategories],
]);

const errors = [];

for (const [collection, validator] of validators) {
  const collectionDir = path.join(CONTENT_ROOT, collection);
  if (!fs.existsSync(collectionDir)) {
    continue;
  }
  const files = fs
    .readdirSync(collectionDir)
    .filter((name) => name.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    continue;
  }

  for (const file of files) {
    const fullPath = path.join(collectionDir, file);
    const parsed = readFrontmatter(fullPath);
    if (parsed.error) {
      errors.push(parsed.error);
      continue;
    }
    validator(path.relative(ROOT, fullPath), parsed.data, errors);
  }
}

validateNavigation(errors);

if (errors.length > 0) {
  fail(errors);
}

console.log(`content schema ok — ${validators.size} collections validated`);
