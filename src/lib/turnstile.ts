type TurnstileAction = 'contact' | 'newsletter';

function expectedHostnames() {
	return new Set(
		(process.env.TURNSTILE_HOSTNAMES ?? '')
			.split(',')
			.map((hostname) => hostname.trim())
			.filter(Boolean),
	);
}

function getClientIp(request: Request, clientAddress?: string) {
	return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress?.trim();
}

export async function verifyTurnstile({
	request,
	clientAddress,
	token,
	action,
}: {
	request: Request;
	clientAddress?: string;
	token: unknown;
	action: TurnstileAction;
}) {
	const secret = process.env.TURNSTILE_SECRET;
	const hostnames = expectedHostnames();

	if (typeof token !== 'string' || !token || token.length > 2048 || !secret || hostnames.size === 0) {
		return false;
	}

	try {
		const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			signal: AbortSignal.timeout(10_000),
			body: new URLSearchParams({
				secret,
				response: token,
				remoteip: getClientIp(request, clientAddress) ?? '',
			}),
		});
		const result: { success?: unknown; action?: unknown; hostname?: unknown } = await response.json();

		return response.ok && result.success === true && result.action === action && typeof result.hostname === 'string' && hostnames.has(result.hostname);
	} catch {
		return false;
	}
}
