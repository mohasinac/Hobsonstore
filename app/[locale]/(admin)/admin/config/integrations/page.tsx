"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/ToastProvider";

// ── Auth token helper ───────────────────────────────────────────────────────

function useAdminToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    import("@/lib/firebase/client").then(({ getFirebaseApp }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getAuth } = require("firebase/auth");
      const auth = getAuth(getFirebaseApp());
      unsub = auth.onAuthStateChanged(async (user: { getIdToken: () => Promise<string> } | null) => {
        if (user) setToken(await user.getIdToken());
        else setToken(null);
      });
    });
    return () => unsub?.();
  }, []);
  return token;
}

// ── Types ───────────────────────────────────────────────────────────────────

interface KeyState {
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioAuthTokenIsSet?: boolean;
  twilioWhatsappFrom: string;
  whatsappNumber: string;
  whatsappAdminBotNumber: string;
  whatsappWebhookSecret: string;
  whatsappWebhookSecretIsSet?: boolean;
  razorpayKeyId: string;
  razorpayKeyIdIsSet?: boolean;
  razorpayKeySecret: string;
  razorpayKeySecretIsSet?: boolean;
  razorpayOAuthConnected?: boolean;
  razorpayAccountId?: string;
  adminEmails: string;
}

const EMPTY: KeyState = {
  twilioAccountSid: "",
  twilioAuthToken: "",
  twilioWhatsappFrom: "",
  whatsappNumber: "",
  whatsappAdminBotNumber: "",
  whatsappWebhookSecret: "",
  razorpayKeyId: "",
  razorpayKeySecret: "",
  razorpayOAuthConnected: false,
  razorpayAccountId: "",
  adminEmails: "",
};

// ── Sub-components ──────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 text-sm font-mono outline-none transition-shadow disabled:opacity-50";

function SavedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      Saved
    </span>
  );
}

function SecretInput({
  label,
  sublabel,
  value,
  isSet,
  placeholder,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: string;
  isSet?: boolean;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <label className="text-sm font-semibold" style={{ color: 'var(--color-black)' }}>{label}</label>
        {isSet && <SavedBadge />}
      </div>
      {sublabel && <p className="mb-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>{sublabel}</p>}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className={inputCls + " pr-10"}
          style={{ border: '2px solid var(--border-ink)', boxShadow: '3px 3px 0px var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSet ? "Leave blank to keep existing value" : placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 dark:text-slate-400 dark:hover:text-slate-100 text-gray-400 hover:text-gray-700"
          tabIndex={-1}
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88 6.59 6.59m7.532 7.532 3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function PlainInput({
  label,
  sublabel,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  sublabel?: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--color-black)' }}>{label}</label>
      {sublabel && <p className="mb-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>{sublabel}</p>}
      <input
        type={type}
        className={inputCls}
        style={{ border: '2px solid var(--border-ink)', boxShadow: '3px 3px 0px var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="overflow-hidden rounded-lg"
      style={{ background: 'var(--surface-elevated)', border: "2px solid var(--border-ink)", boxShadow: "4px 4px 0px var(--border-ink)" }}
    >
      <div
        className="px-5 py-3"
        style={{ borderBottom: "2px solid #0D0D0D", background: "#FFE500" }}
      >
        <h3
          className="text-base font-bold tracking-wide"
          style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", color: "#0D0D0D", letterSpacing: "0.05em" }}
        >
          {title}
        </h3>
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </section>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function IntegrationsSettingsPage() {
  const token = useAdminToken();
  const { toast } = useToast();
  const [data, setData] = useState<KeyState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings/integration-keys", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json() as Partial<KeyState>;
      setData((prev) => ({ ...prev, ...json }));
    } catch {
      toast("Failed to load integration keys", "error");
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token !== null) void load();
  }, [load, token]);

  // Show toast for OAuth redirect result and clean the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("razorpay_connected");
    const error = params.get("razorpay_error");
    if (!connected && !error) return;
    window.history.replaceState({}, "", window.location.pathname);
    if (connected === "1") toast("Razorpay connected successfully!", "success");
    else if (error) toast(`Razorpay OAuth failed: ${error.replace(/_/g, " ")}`, "error");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectRazorpay = async () => {
    setOauthLoading(true);
    try {
      const res = await fetch("/api/admin/razorpay/oauth/connect", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Failed to initiate OAuth");
      }
      const { url } = await res.json() as { url: string };
      window.location.href = url;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to connect Razorpay", "error");
      setOauthLoading(false);
    }
  };

  const disconnectRazorpay = async () => {
    setOauthLoading(true);
    try {
      const res = await fetch("/api/admin/razorpay/oauth/disconnect", {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      toast("Razorpay disconnected", "success");
      setLoading(true);
      await load();
    } catch {
      toast("Failed to disconnect Razorpay", "error");
    } finally {
      setOauthLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/integration-keys", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          twilioAccountSid: data.twilioAccountSid || undefined,
          twilioAuthToken: data.twilioAuthToken || undefined,
          twilioWhatsappFrom: data.twilioWhatsappFrom || undefined,
          whatsappNumber: data.whatsappNumber || undefined,
          whatsappAdminBotNumber: data.whatsappAdminBotNumber || undefined,
          whatsappWebhookSecret: data.whatsappWebhookSecret || undefined,
          razorpayKeyId: data.razorpayKeyId || undefined,
          razorpayKeySecret: data.razorpayKeySecret || undefined,
          adminEmails: data.adminEmails || undefined,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast("Integration keys saved!", "success");
      setData(EMPTY);
      setLoading(true);
      await load();
    } catch {
      toast("Failed to save keys", "error");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof KeyState, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFEF0]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "3px solid var(--border-ink)", background: "var(--surface-elevated)" }}
      >
        <div>
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", color: "var(--color-black)", letterSpacing: "0.06em" }}
          >
            INTEGRATIONS
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--color-muted)' }}>
            API secrets are encrypted with AES-256-GCM before being stored in the database.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-md px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "#E8001C", border: "2px solid #0D0D0D", boxShadow: "2px 2px 0px #0D0D0D" }}
        >
          {saving && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {saving ? "Saving…" : "Save Keys"}
        </button>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        {/* Twilio */}
        <Section title="Twilio — WhatsApp & SMS">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Twilio powers outbound WhatsApp notifications and the inventory bot.
            Find these in your{" "}
            <a
              href="https://console.twilio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              Twilio Console
            </a>.
          </p>
          <PlainInput
            label="Account SID"
            sublabel="e.g. ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={data.twilioAccountSid}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            onChange={(v) => set("twilioAccountSid", v)}
          />
          <SecretInput
            label="Auth Token"
            sublabel="32-char token from Twilio Console — stored encrypted"
            value={data.twilioAuthToken}
            isSet={data.twilioAuthTokenIsSet}
            placeholder="Enter Twilio Auth Token"
            onChange={(v) => set("twilioAuthToken", v)}
          />
          <PlainInput
            label="WhatsApp From Number"
            sublabel='Twilio WhatsApp sender, e.g. "whatsapp:+14155552671"'
            value={data.twilioWhatsappFrom}
            placeholder="whatsapp:+14155552671"
            onChange={(v) => set("twilioWhatsappFrom", v)}
          />
        </Section>

        {/* WhatsApp */}
        <Section title="WhatsApp — Business Numbers">
          <PlainInput
            label="Customer WhatsApp Number"
            sublabel="Your business WhatsApp number customers can message (with country code)"
            value={data.whatsappNumber}
            placeholder="+919876543210"
            onChange={(v) => set("whatsappNumber", v)}
          />
          <PlainInput
            label="Admin Bot Number"
            sublabel="The number from which the inventory bot sends commands"
            value={data.whatsappAdminBotNumber}
            placeholder="+919876543210"
            onChange={(v) => set("whatsappAdminBotNumber", v)}
          />
          <SecretInput
            label="Webhook Secret"
            sublabel="Used to verify incoming webhook HMAC signatures — stored encrypted"
            value={data.whatsappWebhookSecret}
            isSet={data.whatsappWebhookSecretIsSet}
            placeholder="Enter webhook secret"
            onChange={(v) => set("whatsappWebhookSecret", v)}
          />
        </Section>

        {/* Razorpay */}
        <Section title="Razorpay — Online Payments">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Connect via OAuth (recommended) — your Razorpay account authorises this app without
            sharing long-lived API secrets. Or paste API keys manually as a fallback.
          </p>

          {/* OAuth connect / status card */}
          <div
            className="rounded-md px-4 py-3"
            style={{ border: "1.5px solid var(--border-ink)", background: "var(--color-surface)" }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-black)' }}>
                  OAuth Connection
                </p>
                {data.razorpayOAuthConnected ? (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                    Connected{data.razorpayAccountId ? ` · ${data.razorpayAccountId}` : ""}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                    Not connected — click to authorise via Razorpay
                  </p>
                )}
              </div>
              {data.razorpayOAuthConnected ? (
                <button
                  type="button"
                  disabled={oauthLoading}
                  onClick={disconnectRazorpay}
                  className="shrink-0 rounded px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                  style={{
                    border: "2px solid var(--border-ink)",
                    background: "#fff",
                    color: "var(--color-black)",
                    boxShadow: "2px 2px 0px var(--border-ink)",
                  }}
                >
                  {oauthLoading ? "…" : "Disconnect"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={oauthLoading}
                  onClick={connectRazorpay}
                  className="shrink-0 flex items-center gap-2 rounded px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                  style={{
                    background: "#2280EF",
                    border: "2px solid #0D0D0D",
                    boxShadow: "2px 2px 0px #0D0D0D",
                  }}
                >
                  {oauthLoading ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 0 0 5.656 0l4-4a4 4 0 1 0-5.656-5.656l-1.1 1.1" />
                    </svg>
                  )}
                  Connect with Razorpay
                </button>
              )}
            </div>
          </div>

          {/* Manual keys — fallback when OAuth is not used */}
          <div>
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              — or use manual API keys —
            </p>
            <div className="space-y-4">
              <SecretInput
                label="Key ID"
                sublabel="e.g. rzp_live_... — stored encrypted"
                value={data.razorpayKeyId}
                isSet={data.razorpayKeyIdIsSet}
                placeholder="rzp_live_..."
                onChange={(v) => set("razorpayKeyId", v)}
              />
              <SecretInput
                label="Key Secret"
                sublabel="Keep this confidential — stored encrypted"
                value={data.razorpayKeySecret}
                isSet={data.razorpayKeySecretIsSet}
                placeholder="Enter Razorpay secret key"
                onChange={(v) => set("razorpayKeySecret", v)}
              />
            </div>
          </div>
        </Section>

        {/* Admin emails */}
        <Section title="Admin Notification Emails">
          <PlainInput
            label="Admin Email Addresses"
            sublabel="Comma-separated list of emails that receive order and alert notifications"
            value={data.adminEmails}
            type="text"
            placeholder="admin@hobsoncollectibles.com, team@hobsoncollectibles.com"
            onChange={(v) => set("adminEmails", v)}
          />
        </Section>

        <p className="rounded-md bg-amber-50 px-4 py-3 text-xs text-amber-700" style={{ border: "1px solid #FDE68A" }}>
          <strong>ENCRYPTION_KEY env var required</strong> — Set a 64-character hex string as{" "}
          <code className="font-mono">ENCRYPTION_KEY</code> in your Vercel environment variables
          before deploying. Without it, secrets are stored as plaintext.
        </p>
      </div>
    </div>
  );
}
