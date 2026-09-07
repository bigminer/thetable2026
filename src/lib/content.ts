export function resolveAsset(path: string | undefined | null): string | undefined {
	if (!path) return undefined;
	if (path.startsWith('attachments/') || path.startsWith('./attachments/')) {
		const base = import.meta.env.BASE_URL.replace(/\/$/, '');
		return base + '/' + path.replace(/^\.\//, '');
	}
	return path;
}

export function fallbackSlug(value: string | undefined, entryId: string) {
	const candidate = value?.trim() || entryId;
	return candidate
		.toLowerCase()
		.replace(/\.md$/i, '')
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-/_]/g, '')
		.replace(/\/+/g, '/')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

export async function safeGetCollection<T>(getter: () => Promise<T[]>) {
	try {
		return await getter();
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes('does not exist or is empty')
		) {
			return [];
		}
		throw error;
	}
}
