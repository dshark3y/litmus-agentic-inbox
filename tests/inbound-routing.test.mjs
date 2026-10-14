import assert from "node:assert/strict";
import test from "node:test";
import { resolveInboundMailbox } from "../workers/lib/inbound-routing.ts";

const env = { DOMAINS: "takelitmus.com", CATCH_ALL_MAILBOX: "hello@takelitmus.com" };

test("aliases and the hello address share the hello mailbox", () => {
	for (const to of ["orders@takelitmus.com", "anything+123@takelitmus.com", "HELLO@TAKELITMUS.COM"]) {
		assert.equal(resolveInboundMailbox(to, env), "hello@takelitmus.com");
	}
});

test("only explicitly configured recipient domains are accepted", () => {
	for (const to of ["x@other.com", "x@takelitmus.com.attacker.com", "x@order.takelitmus.com"]) {
		assert.equal(resolveInboundMailbox(to, env), undefined);
	}
});

test("recipient allowlists still apply before catch-all delivery", () => {
	const restricted = { ...env, EMAIL_ADDRESSES: ["orders@takelitmus.com"] };
	assert.equal(resolveInboundMailbox("orders@takelitmus.com", restricted), "hello@takelitmus.com");
	assert.equal(resolveInboundMailbox("someone@takelitmus.com", restricted), undefined);
});

test("an explicitly enabled subdomain delivers into the same hello mailbox", () => {
	const subdomainEnv = { ...env, DOMAINS: "takelitmus.com,order.takelitmus.com" };
	assert.equal(resolveInboundMailbox("support@order.takelitmus.com", subdomainEnv), "hello@takelitmus.com");
	assert.equal(resolveInboundMailbox("hello@takelitmus.com", subdomainEnv), "hello@takelitmus.com");
	assert.equal(resolveInboundMailbox("support@other.takelitmus.com", subdomainEnv), undefined);
});

test("without a catch-all target, delivery uses the envelope's own mailbox", () => {
	assert.equal(resolveInboundMailbox("ORDERS@takelitmus.com", { DOMAINS: "takelitmus.com" }), "orders@takelitmus.com");
});
