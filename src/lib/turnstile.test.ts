import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import { verifyTurnstile } from './turnstile.ts';

const originalFetch = globalThis.fetch;
const originalSecret = process.env.TURNSTILE_SECRET;
const originalHostnames = process.env.TURNSTILE_HOSTNAMES;

afterEach(() => {
	globalThis.fetch = originalFetch;
	process.env.TURNSTILE_SECRET = originalSecret;
	process.env.TURNSTILE_HOSTNAMES = originalHostnames;
});

describe('verifyTurnstile', () => {
	it('requires a successful token for the expected action and hostname', async () => {
		process.env.TURNSTILE_SECRET = 'test-secret';
		process.env.TURNSTILE_HOSTNAMES = 'thetabletx.org';
		globalThis.fetch = async () => Response.json({ success: true, action: 'contact', hostname: 'thetabletx.org' });

		const verified = await verifyTurnstile({
			request: new Request('https://thetabletx.org/api/contact', { headers: { 'x-forwarded-for': '203.0.113.7' } }),
			token: 'test-token',
			action: 'contact',
		});

		assert.strictEqual(verified, true);
	});

	it('rejects a token returned for another form action', async () => {
		process.env.TURNSTILE_SECRET = 'test-secret';
		process.env.TURNSTILE_HOSTNAMES = 'thetabletx.org';
		globalThis.fetch = async () => Response.json({ success: true, action: 'newsletter', hostname: 'thetabletx.org' });

		const verified = await verifyTurnstile({
			request: new Request('https://thetabletx.org/api/contact'),
			token: 'test-token',
			action: 'contact',
		});

		assert.strictEqual(verified, false);
	});
});
