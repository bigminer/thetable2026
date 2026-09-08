import assert from "node:assert";
import { describe, it } from "node:test";
import { checkRateLimit } from "./rate-limit.ts";

function request(headers: Record<string, string> = {}) {
  return new Request("https://thetabletx.org/api/contact", { headers });
}

describe("checkRateLimit", () => {
  it("uses Render's original client address instead of its proxy address", () => {
    const key = "render-forwarded-for";
    const first = checkRateLimit({
      request: request({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }),
      clientAddress: "10.0.0.1",
      key,
      limit: 1,
    });
    const second = checkRateLimit({
      request: request({ "x-forwarded-for": "203.0.113.7" }),
      clientAddress: "10.0.0.2",
      key,
      limit: 1,
    });

    assert.deepStrictEqual(first, { ok: true });
    assert.strictEqual(second.ok, false);
  });

  it("falls back to clientAddress when no proxy header exists", () => {
    const key = "client-address-fallback";
    const first = checkRateLimit({ request: request(), clientAddress: "203.0.113.8", key, limit: 1 });
    const second = checkRateLimit({ request: request(), clientAddress: "203.0.113.8", key, limit: 1 });

    assert.deepStrictEqual(first, { ok: true });
    assert.strictEqual(second.ok, false);
  });
});
