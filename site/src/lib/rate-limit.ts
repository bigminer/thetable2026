export type RateLimitResult =
	| { ok: true }
	| { ok: false; status: number; error: string; retryAfterSeconds: number };

type Bucket = {
	count: number;
	resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(request: Request, clientAddress?: string) {
	if (clientAddress?.trim()) return clientAddress.trim();

	const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim();
	if (cloudflareIp) return cloudflareIp;

	const realIp = request.headers.get('x-real-ip')?.trim();
	if (realIp) return realIp;

	return null;
}

function pruneExpired(now: number) {
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
}

export function checkRateLimit({
	request,
	clientAddress,
	key,
	limit = 3,
	windowMs = 10 * 60 * 1000,
}: {
	request: Request;
	clientAddress?: string;
	key: string;
	limit?: number;
	windowMs?: number;
}): RateLimitResult {
	const now = Date.now();
	pruneExpired(now);

	const clientIp = getClientIp(request, clientAddress);
	if (!clientIp) return { ok: true };

	const bucketKey = `${key}:${clientIp}`;
	const existing = buckets.get(bucketKey);

	if (!existing || existing.resetAt <= now) {
		buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
		return { ok: true };
	}

	if (existing.count >= limit) {
		return {
			ok: false,
			status: 429,
			error: 'Too many submissions. Please try again in a few minutes.',
			retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
		};
	}

	existing.count += 1;
	buckets.set(bucketKey, existing);
	return { ok: true };
}
