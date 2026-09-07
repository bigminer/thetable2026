export const canonicalOrigin = 'https://thetabletx.org';
const legacyHosts = new Set(['thetabletx.com', 'www.thetabletx.com', 'www.thetabletx.org']);

export function canonicalRedirect(host, path) {
	if (!legacyHosts.has(host?.toLowerCase())) return undefined;
	const target = new URL(path, canonicalOrigin);
	target.protocol = 'https:';
	target.hostname = new URL(canonicalOrigin).hostname;
	target.port = '';
	return target.href;
}
