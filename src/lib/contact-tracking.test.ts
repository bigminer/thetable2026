import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createContactConversionTracker } from './contact-tracking.ts';

const config = { adsId: 'AW-123456789', contactSendTo: 'AW-123456789/existing_label' };

describe('contact conversion measurement', () => {
	it('records one acknowledged inquiry without sending form contents', () => {
		const events: unknown[][] = [];
		const record = createContactConversionTracker(config, { gtag: (...args) => events.push(args) });
		const result = { ok: true, email: 'private@example.test', message: 'Private inquiry' };
		record(true, result);
		record(true, result);
		assert.deepEqual(events, [['event', 'conversion', {
			send_to: config.contactSendTo, user_data: {},
		}]]);
	});

	it('ignores failures, misleading success responses, and honeypots before a real success', () => {
		const events: unknown[][] = [];
		const record = createContactConversionTracker(config, { gtag: (...args) => events.push(args) });
		record(false, { ok: true });
		record(true, { error: 'SMTP failed' });
		record(true, { ok: 'true' });
		record(true, null);
		record(true, { ok: true }, true);
		assert.equal(events.length, 0);
		record(true, { ok: true });
		assert.equal(events.length, 1);
	});

	it('lets GTM handle the event instead of sending a second direct conversion', () => {
		const events: unknown[][] = [];
		const browser = { dataLayer: [] as unknown[], gtag: (...args: unknown[]) => events.push(args) };
		const record = createContactConversionTracker({ ...config, gtmId: 'GTM-EXAMPLE' }, browser);
		record(true, { ok: true });
		record(true, { ok: true });
		assert.deepEqual(browser.dataLayer, [{ event: 'contact_form_success' }]);
		assert.deepEqual(events, []);
	});

	it('ignores missing, malformed, or mismatched destinations', () => {
		const events: unknown[][] = [];
		const browser = { gtag: (...args: unknown[]) => events.push(args) };
		for (const contactSendTo of [undefined, '', 'AW-999/label', 'AW-123456789/label?email=private', '</script>']) {
			createContactConversionTracker({ ...config, contactSendTo }, browser)(true, { ok: true });
		}
		assert.deepEqual(events, []);
	});

	it('does not break a delivered form when tracking is unavailable or throws', () => {
		assert.doesNotThrow(() => createContactConversionTracker(config, {})(true, { ok: true }));
		assert.doesNotThrow(() => createContactConversionTracker(config, {
			gtag: () => { throw new Error('Blocked'); },
		})(true, { ok: true }));
	});
});
