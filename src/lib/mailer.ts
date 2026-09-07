// Load .env into process.env for local development. In production (Render) the
// env vars come from the platform and dotenv finds no file, which is a no-op.
// dotenv does not overwrite variables that are already set, so a machine-level
// SMTP_PASSWORD takes precedence over anything in .env.
import 'dotenv/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type SendMailResult = { error?: unknown };

type SendMailOptions = {
	subject: string;
	html: string;
	replyTo: string;
};

// Google Workspace SMTP. The sending account is a dedicated Workspace user
// (webadmin.agent@thetabletx.org) authenticating with an App Password, so the
// domain's existing SPF/DKIM records cover these messages with no extra DNS.
const DEFAULT_HOST = 'smtp.gmail.com';
const DEFAULT_PORT = 587;

export function getMailConfig() {
	const host = process.env.SMTP_HOST ?? DEFAULT_HOST;
	const port = Number(process.env.SMTP_PORT ?? DEFAULT_PORT);
	const user = process.env.SMTP_USER;
	const password = process.env.SMTP_PASSWORD;
	const toEmail = process.env.CONTACT_TO_EMAIL;
	const fromEmail = process.env.CONTACT_FROM_EMAIL ?? user;

	return { host, port, user, password, toEmail, fromEmail };
}

export function isMailConfigured() {
	const { user, password, toEmail } = getMailConfig();
	return Boolean(user && password && toEmail);
}

// One pooled transport for the process rather than one per request.
let transporter: Transporter | undefined;

function getTransporter() {
	if (transporter) return transporter;

	const { host, port, user, password } = getMailConfig();

	transporter = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		requireTLS: port !== 465,
		pool: true,
		auth: { user, pass: password },
	});

	return transporter;
}

export async function sendMail({ subject, html, replyTo }: SendMailOptions): Promise<SendMailResult> {
	const { toEmail, fromEmail } = getMailConfig();

	try {
		await getTransporter().sendMail({
			from: `The Table Website <${fromEmail}>`,
			to: toEmail,
			replyTo,
			subject,
			html,
		});
		return {};
	} catch (error) {
		return { error };
	}
}
