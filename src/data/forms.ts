export type FormRoute = {
  slug: 'contact-us' | 'get-involved' | 'sign-up-for-our-newsletter';
  title: string;
  mode: 'embed' | 'link-first' | 'fallback';
  destination: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  completion: string;
  note: string;
};

const contactScriptUrl = process.env.GOOGLE_APPS_SCRIPT_CONTACT_URL ?? 'mailto:hello@thetabletx.com';

export const forms: Record<FormRoute['slug'], FormRoute> = {
  'contact-us': {
    slug: 'contact-us',
    title: 'Contact Us',
    mode: 'fallback',
    destination: 'Apps Script',
    primaryLabel: 'Send a message',
    primaryHref: contactScriptUrl,
    secondaryLabel: 'Open Church Center',
    secondaryHref: 'https://thetabletx.churchcenter.com',
    completion: 'Your message has been sent. Someone from our team will be in contact with you shortly.',
    note: "How can we help? If you have a question or need to connect with someone from The Table TX, we'd love to hear from you. Please just fill out the form and someone will be in contact with you shortly. We look forward to hearing from you!",
  },
  'get-involved': {
    slug: 'get-involved',
    title: 'Get Involved',
    mode: 'link-first',
    destination: 'Planning Center / Church Center',
    primaryLabel: 'Open involvement form',
    primaryHref: 'https://thetabletx.churchcenter.com',
    secondaryLabel: 'Planning Center',
    secondaryHref: 'https://planningcenter.com',
    completion: 'Thank you for your interest! The destination page will confirm your request.',
    note: 'Ready to find your place at The Table? We have many ways to get involved, from serving on Sundays to joining a meetup. Click below to start the conversation.',
  },
  'sign-up-for-our-newsletter': {
    slug: 'sign-up-for-our-newsletter',
    title: 'Sign Up for Our Newsletter',
    mode: 'link-first',
    destination: 'Planning Center form',
    primaryLabel: 'Open newsletter form',
    primaryHref: 'https://planningcenter.com',
    secondaryLabel: 'Church Center',
    secondaryHref: 'https://thetabletx.churchcenter.com',
    completion: 'Thank you for subscribing! You will receive a confirmation email shortly.',
    note: 'Stay up to date with the latest news, events, and stories from The Table community. Sign up for our weekly newsletter below.',
  },
};
