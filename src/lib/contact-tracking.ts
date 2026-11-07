type TrackingConfig = {
	adsId?: string;
	contactSendTo?: string;
	gtmId?: string;
};

type TrackingBrowser = {
	dataLayer?: unknown[];
	gtag?: (...args: unknown[]) => void;
};

// One recorder per page. Failed requests, honeypots, retries, and missing tags must
// never turn into inquiries or interfere with the form's success message.
export function createContactConversionTracker(config: TrackingConfig, browser: TrackingBrowser) {
	let recorded = false;
	const adsId = config.adsId?.trim();
	const sendTo = config.contactSendTo?.trim();
	const validDestination = /^AW-\d+\/[A-Za-z0-9_-]+$/.test(sendTo ?? '')
		&& /^AW-\d+$/.test(adsId ?? '') && sendTo?.split('/')[0] === adsId;
	const useGtm = Boolean(config.gtmId?.trim());

	return (responseOk: boolean, result: unknown, honeypotFilled = false) => {
		if (recorded || !responseOk || honeypotFilled || !result || typeof result !== 'object'
			|| !('ok' in result) || result.ok !== true) return;
		try {
			if (useGtm) {
				(browser.dataLayer ??= []).push({ event: 'contact_form_success' });
			} else if (validDestination && browser.gtag) {
				browser.gtag('event', 'conversion', { send_to: sendTo, user_data: {} });
			} else {
				return;
			}
			recorded = true;
		} catch {
			// Ad blockers or tag errors must not make a delivered inquiry look failed.
		}
	};
}
