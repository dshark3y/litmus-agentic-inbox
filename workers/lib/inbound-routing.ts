type InboundRoutingConfig = {
	DOMAINS: string;
	EMAIL_ADDRESSES?: string[];
	CATCH_ALL_MAILBOX?: string;
};

// Route using SMTP's envelope recipient, never the sender-controlled To header.
// This also handles Bcc messages, which need not have a To header at all.
export function resolveInboundMailbox(to: string, env: InboundRoutingConfig): string | undefined {
	const recipient = to.trim().toLowerCase();
	const domain = recipient.slice(recipient.lastIndexOf("@") + 1);
	const domains = env.DOMAINS.split(",").map((value) => value.trim().toLowerCase());
	if (!recipient.includes("@") || !domains.includes(domain)) return undefined;

	const allowedAddresses = (env.EMAIL_ADDRESSES ?? []).map((address) => address.toLowerCase());
	if (allowedAddresses.length && !allowedAddresses.includes(recipient)) return undefined;

	return env.CATCH_ALL_MAILBOX?.trim().toLowerCase() || recipient;
}
