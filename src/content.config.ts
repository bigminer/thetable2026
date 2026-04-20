import { defineCollection, reference, z } from 'astro:content';

const mediaSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  credit: z.string().min(1).optional(),
  rights: z.string().min(1).optional(),
});

const hrefSchema = z
  .string()
  .min(1)
  .regex(/^(?:\/|https?:\/\/)/, 'href must be an internal path or absolute URL');

const seoSchema = z.object({
  title: z.string().min(1).max(70).optional(),
  description: z.string().min(1).max(160).optional(),
  canonical: z.string().url().optional(),
  noindex: z.boolean().default(false).optional(),
  ogImage: mediaSchema.optional(),
  twitterCard: z.enum(['summary', 'summary_large_image']).optional(),
});

const linkSchema = z.object({
  label: z.string().min(1),
  href: hrefSchema,
});

const markdownBlockSchema = z.object({
  type: z.literal('markdown'),
  body: z.string().min(1),
});

const textBlockSchema = z.object({
  type: z.literal('text'),
  body: z.string().min(1),
});

const heroBlockSchema = z.object({
  type: z.literal('hero'),
  eyebrow: z.string().min(1).optional(),
  headline: z.string().min(1),
  rainbowWord: z.string().min(1).optional(),
  subheadline: z.string().min(1).optional(),
  image: mediaSchema.optional(),
  actions: z.array(linkSchema).optional(),
});

const sectionImagePositionSchema = z.enum(['left', 'right']);

const statementBlockSchema = z.object({
  type: z.literal('statement'),
  heading: z.string().min(1).optional(),
  lead: z.string().min(1).optional(),
  emphasis: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  image: mediaSchema.optional(),
  imagePosition: sectionImagePositionSchema.optional(),
});

const valueListBlockSchema = z.object({
  type: z.literal('value_list'),
  heading: z.string().min(1).optional(),
  intro: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(1),
});

const videoBlockSchema = z.object({
  type: z.literal('video'),
  heading: z.string().min(1).optional(),
  url: z.string().url(),
  caption: z.string().min(1).optional(),
});

const featureGridBlockSchema = z.object({
  type: z.literal('feature_grid'),
  heading: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1).optional(),
        icon: z.string().min(1).optional(),
        href: z.string().url().optional(),
      }),
    )
    .min(1),
});

const cardGridBlockSchema = z.object({
  type: z.literal('card_grid'),
  heading: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1).optional(),
        href: z.string().url().optional(),
        image: mediaSchema.optional(),
      }),
    )
    .min(1),
});

const columnsBlockSchema = z.object({
  type: z.literal('columns'),
  columns: z
    .array(
      z.object({
        heading: z.string().min(1).optional(),
        body: z.string().min(1),
      }),
    )
    .min(1),
});

const imageGridBlockSchema = z.object({
  type: z.literal('image_grid'),
  images: z.array(mediaSchema).min(1),
});

const videoEmbedBlockSchema = z.object({
  type: z.literal('video_embed'),
  provider: z.string().min(1).optional(),
  url: z.string().url(),
});

const formEmbedBlockSchema = z.object({
  type: z.literal('form_embed'),
  provider: z.string().min(1).optional(),
  url: z.string().url(),
});

const mapEmbedBlockSchema = z.object({
  type: z.literal('map_embed'),
  provider: z.string().min(1).optional(),
  url: z.string().url(),
});

const ctaBlockSchema = z.object({
  type: z.literal('cta'),
  heading: z.string().min(1),
  body: z.string().min(1).optional(),
  links: z.array(linkSchema).min(1),
  image: mediaSchema.optional(),
  imagePosition: sectionImagePositionSchema.optional(),
});

const ctaListBlockSchema = z.object({
  type: z.literal('cta_list'),
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        href: hrefSchema.optional(),
        description: z.string().min(1).optional(),
      }),
    )
    .min(1),
  image: mediaSchema.optional(),
  imagePosition: sectionImagePositionSchema.optional(),
});

const quoteBlockSchema = z.object({
  type: z.literal('quote'),
  quote: z.string().min(1),
  attribution: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  image: mediaSchema.optional(),
});

const staffSpotlightBlockSchema = z.object({
  type: z.literal('staff_spotlight'),
  staff: reference('staff').optional(),
  speaker: reference('speakers').optional(),
  headline: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
});

const seriesFeatureBlockSchema = z.object({
  type: z.literal('series_feature'),
  featuredSeries: reference('series'),
  headline: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

const eventFeatureBlockSchema = z.object({
  type: z.literal('event_feature'),
  featuredEvent: reference('events'),
  headline: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

const socialLinksBlockSchema = z.object({
  type: z.literal('social_links'),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().url(),
        icon: z.string().min(1).optional(),
      }),
    )
    .min(1),
});

const locationBlockSchema = z.object({
  type: z.literal('location'),
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  addressLines: z.array(z.string().min(1)).min(1),
  phone: z.string().min(1),
  serviceTime: z.string().min(1),
  note: z.string().min(1).optional(),
  mapUrl: z.string().url(),
  mapLabel: z.string().min(1).optional(),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        href: hrefSchema,
      }),
    )
    .optional(),
  image: mediaSchema.optional(),
  imagePosition: sectionImagePositionSchema.optional(),
});

const formBlockSchema = z.object({
  type: z.literal('form'),
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  route: z.literal('contact-us'),
  submitLabel: z.string().min(1).optional(),
});

const rawHtmlBlockSchema = z.object({
  type: z.literal('raw_html'),
  html: z.string().min(1),
  sanitized: z.literal(true),
  source: z.object({
    url: z.string().url(),
    reason: z.string().min(1),
  }),
});

const belongSplitBlockSchema = z.object({
  type: z.literal('belong_split'),
  quote: z.string().min(1),
  subquote: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
});

const affirmingChipsBlockSchema = z.object({
  type: z.literal('affirming_chips'),
  heading: z.string().min(1).optional(),
  chips: z.array(z.string().min(1)).min(1),
});

const contentBlockSchema = z.discriminatedUnion('type', [
  markdownBlockSchema,
  textBlockSchema,
  heroBlockSchema,
  statementBlockSchema,
  valueListBlockSchema,
  videoBlockSchema,
  featureGridBlockSchema,
  cardGridBlockSchema,
  columnsBlockSchema,
  imageGridBlockSchema,
  videoEmbedBlockSchema,
  formEmbedBlockSchema,
  mapEmbedBlockSchema,
  ctaBlockSchema,
  ctaListBlockSchema,
  quoteBlockSchema,
  staffSpotlightBlockSchema,
  seriesFeatureBlockSchema,
  eventFeatureBlockSchema,
  socialLinksBlockSchema,
  locationBlockSchema,
  formBlockSchema,
  rawHtmlBlockSchema,
  belongSplitBlockSchema,
  affirmingChipsBlockSchema,
]);

const pageSchema = z.object({
  title: z.string().min(1),
  url: z.string().regex(/^\//, 'url must start with /'),
  description: z.string().optional(),
  draft: z.boolean().default(false).optional(),
  seo: seoSchema.optional(),
  blocks: z.array(contentBlockSchema).min(1),
});

const sharedEntrySchema = z.object({
  seo: seoSchema.optional(),
  draft: z.boolean().default(false).optional(),
});

const pages = defineCollection({
  type: 'content',
  schema: pageSchema,
});

const messages = defineCollection({
  type: 'content',
  schema: sharedEntrySchema.extend({
    title: z.string().min(1),
    publishedAt: z.coerce.date(),
    summary: z.string().min(1),
    series: reference('series').optional(),
    speakers: z.array(reference('speakers')).optional(),
    audioUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    scripture: z.string().min(1).optional(),
  }),
});

const series = defineCollection({
  type: 'content',
  schema: sharedEntrySchema.extend({
    title: z.string().min(1),
    summary: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    image: mediaSchema.optional(),
    churchCenterUrl: z.string().url().optional(),
  }),
});

const speakers = defineCollection({
  type: 'content',
  schema: sharedEntrySchema.extend({
    name: z.string().min(1),
    bio: z.string().min(1),
    photo: mediaSchema.optional(),
    staff: reference('staff').optional(),
    order: z.number().int().nonnegative().default(0).optional(),
  }),
});

const staff = defineCollection({
  type: 'content',
  schema: sharedEntrySchema.extend({
    name: z.string().min(1),
    role: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    bio: z.string().min(1),
    photo: mediaSchema.optional(),
    groups: z.array(reference('staff-groups')).optional(),
    order: z.number().int().nonnegative().default(0).optional(),
  }),
});

const staffGroups = defineCollection({
  type: 'content',
  schema: sharedEntrySchema.extend({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    order: z.number().int().nonnegative().default(0).optional(),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: sharedEntrySchema.extend({
    title: z.string().min(1),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date().optional(),
    summary: z.string().min(1),
    location: z.string().min(1).optional(),
    url: z.string().url().optional(),
    categories: z.array(reference('event-categories')).optional(),
  }),
});

const eventCategories = defineCollection({
  type: 'content',
  schema: sharedEntrySchema.extend({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    order: z.number().int().nonnegative().default(0).optional(),
  }),
});

export const collections = {
  pages,
  messages,
  series,
  speakers,
  staff,
  'staff-groups': staffGroups,
  events,
  'event-categories': eventCategories,
};
