import { createHmac } from "crypto";
import { describe, it, expect } from "vitest";
import {
  verifyWebhookSignature,
  isAdminNumber,
  parseIncomingWebhook,
  buildHelpMessage,
} from "@/lib/whatsapp";

const SECRET = "test-secret-key";

function makeSignature(payload: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

// ─── verifyWebhookSignature ───────────────────────────────────────────────────

describe("verifyWebhookSignature", () => {
  it("returns true for a valid HMAC signature", () => {
    const payload = "RESTOCK SKU-123 qty:10";
    const sig = makeSignature(payload);
    expect(verifyWebhookSignature(payload, sig, SECRET)).toBe(true);
  });

  it("returns false for a tampered payload", () => {
    const original = "RESTOCK SKU-123 qty:10";
    const tampered = "RESTOCK SKU-123 qty:999";
    const sig = makeSignature(original);
    expect(verifyWebhookSignature(tampered, sig, SECRET)).toBe(false);
  });

  it("returns false for a wrong secret", () => {
    const payload = "RESTOCK SKU-123 qty:10";
    const sig = makeSignature(payload, "wrong-secret");
    expect(verifyWebhookSignature(payload, sig, SECRET)).toBe(false);
  });

  it("returns false when signature lengths differ", () => {
    expect(verifyWebhookSignature("payload", "aabbcc", SECRET)).toBe(false);
  });
});

// ─── isAdminNumber ───────────────────────────────────────────────────────────

describe("isAdminNumber", () => {
  it("returns true when numbers match after stripping non-digits", () => {
    expect(isAdminNumber("+91 98765 43210", "919876543210")).toBe(true);
  });

  it("returns true for exact digit matches", () => {
    expect(isAdminNumber("919876543210", "919876543210")).toBe(true);
  });

  it("returns false for different numbers", () => {
    expect(isAdminNumber("919876543210", "911234567890")).toBe(false);
  });
});

// ─── parseIncomingWebhook ────────────────────────────────────────────────────

describe("parseIncomingWebhook — Twilio form-encoded", () => {
  const ct = "application/x-www-form-urlencoded";

  it("parses a well-formed Twilio payload", () => {
    const body = new URLSearchParams({
      From: "whatsapp:+919876543210",
      Body: "RESTOCK SKU-123 qty:50",
    }).toString();
    const result = parseIncomingWebhook(body, ct);
    expect(result).toEqual({
      from: "919876543210",
      body: "RESTOCK SKU-123 qty:50",
    });
  });

  it("strips the whatsapp: prefix from From", () => {
    const body = new URLSearchParams({
      From: "whatsapp:+1 (555) 123-4567",
      Body: "HELP",
    }).toString();
    const result = parseIncomingWebhook(body, ct);
    expect(result?.from).toBe("15551234567");
  });

  it("returns null when From is missing", () => {
    const body = new URLSearchParams({ Body: "HELP" }).toString();
    expect(parseIncomingWebhook(body, ct)).toBeNull();
  });

  it("returns null when Body is missing", () => {
    const body = new URLSearchParams({ From: "whatsapp:+91999" }).toString();
    expect(parseIncomingWebhook(body, ct)).toBeNull();
  });
});

describe("parseIncomingWebhook — JSON (generic / Wati.io)", () => {
  const ct = "application/json";

  it("parses a generic JSON payload", () => {
    const raw = JSON.stringify({ from: "919876543210", body: "STOCK SKU-A" });
    expect(parseIncomingWebhook(raw, ct)).toEqual({
      from: "919876543210",
      body: "STOCK SKU-A",
    });
  });

  it("parses a Wati.io-style payload", () => {
    const raw = JSON.stringify({
      senderWaId: "919876543210",
      text: { body: "SOLDOUT SKU-99" },
    });
    expect(parseIncomingWebhook(raw, ct)).toEqual({
      from: "919876543210",
      body: "SOLDOUT SKU-99",
    });
  });

  it("returns null for malformed JSON", () => {
    expect(parseIncomingWebhook("{not json}", ct)).toBeNull();
  });

  it("returns null when required fields are absent", () => {
    expect(parseIncomingWebhook("{}", ct)).toBeNull();
  });
});

// ─── buildHelpMessage ────────────────────────────────────────────────────────

describe("buildHelpMessage", () => {
  it("contains all command keywords", () => {
    const msg = buildHelpMessage();
    for (const cmd of ["RESTOCK", "SOLDOUT", "PREORDER", "STATUS", "STOCK", "HELP"]) {
      expect(msg).toContain(cmd);
    }
  });
});
