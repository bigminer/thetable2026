import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const optionalUrl = z
	.union([z.string().url(), z.string().regex(/^\/.+/), z.string().regex(/^attachments\//), z.literal('')])
	.optional();
const optionalDate = z.union([z.coerce.date(), z.literal('')]).optional();

function collectionReferenceId(value: unknown) {
	if (typeof value !== 'string') return value;

	const trimmed = value.trim();
	const wikilinkMatch = trimmed.match(/^\[\[([^|\]#]+)(?:#[^|\]]*)?(?:\|[^\]]+)?\]\]$/);
	const markdownLinkMatch = trimmed.match(/^\[[^\]]+\]\(([^)]+)\)$/);
	const target = wikilinkMatch ? wikilinkMatch[1] : markdownLinkMatch ? markdownLinkMatch[1] : trimmed;
	const segments = target
		.replace(/\\/g, '/')
		.replace(/[?#].*$/, '')
		.replace(/\.md$/i, '')
		.split('/')
		.filter(Boolean);

	return segments.at(-1) ?? trimmed;
}

const optionalSeriesReference = z
	.preprocess(collectionReferenceId, z.union([reference('series'), z.literal('')]))
	.optional();

const series = defineCollection({
	loader: glob({ base: './src/content/series', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		slug: z.string().optional(),
		featuredImage: optionalUrl,
		featuredImageAlt: z.string().optional(),
		speaker: z.string().optional(),
		scripture: z.string().optional(),
		startDate: optionalDate,
		endDate: optionalDate,
		draft: z.boolean().default(false),
	}),
});

const messages = defineCollection({
	loader: glob({ base: './src/content/messages', pattern: '**/*.md' }),
	schema: z
		.object({
			title: z.string(),
			series: optionalSeriesReference,
			date: z.coerce.date(),
			speaker: z.string().optional(),
			slug: z.string().optional(),
			sourceUrl: optionalUrl,
			podcastUrl: optionalUrl,
			draft: z.boolean().default(false),
		})
		.superRefine((data, context) => {
			if (!data.draft && !data.series) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['series'],
					message: 'Published messages must link to a series.',
				});
			}
		}),
});

export const collections = { series, messages };
