"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";
import { saveCharacterHotspotConfig } from "@/lib/firebase/content";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { CharacterHotspotConfig, HotspotPin } from "@/types/content";

type WizardStep = "image" | "place" | "details" | "review";

interface DraftPosition {
  id: string;
  xPct: number;
  yPct: number;
}

function randomId() {
  return Math.random().toString(36).slice(2, 9);
}

interface CharacterHotspotFormProps {
  initial?: CharacterHotspotConfig | null;
}

export function CharacterHotspotForm({ initial }: CharacterHotspotFormProps) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt ?? "DC, Marvel and Anime characters");
  const [active, setActive] = useState(initial?.active ?? true);
  const [pins, setPins] = useState<HotspotPin[]>(initial?.pins ?? []);
  const [step, setStep] = useState<WizardStep>(initial?.imageUrl ? "review" : "image");

  // Draft pin state â€” position captured in step 2, details filled in step 3
  const [draftPos, setDraftPos] = useState<DraftPosition | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftUniverse, setDraftUniverse] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftHref, setDraftHref] = useState("");
  const [draftBuyText, setDraftBuyText] = useState("Shop Now");
  const [draftBadge, setDraftBadge] = useState("");
  const [draftAccent, setDraftAccent] = useState("#E8001C");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // â”€â”€ Image upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const storage = getStorage(getFirebaseApp());
      const storageRef = ref(storage, `character-hotspot/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
    } catch {
      setError("Image upload failed. Check Firebase Storage rules.");
    } finally {
      setUploading(false);
    }
  }

  // â”€â”€ Step 2: click image to drop draft pin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.round(Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100)) * 10) / 10;
    const yPct = Math.round(Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100)) * 10) / 10;
    setDraftPos((prev) => ({ id: prev?.id ?? randomId(), xPct, yPct }));
  }

  // â”€â”€ Commit draft pin to the list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function commitDraftPin() {
    if (!draftPos) return;
    setPins((prev) => [
      ...prev,
      {
        id: draftPos.id,
        name: draftName,
        universe: draftUniverse,
        description: draftDescription,
        href: draftHref,
        xPct: draftPos.xPct,
        yPct: draftPos.yPct,
        accent: draftAccent,
        badge: draftBadge,
        buyText: draftBuyText,
      },
    ]);
    setDraftPos(null);
    setDraftName("");
    setDraftUniverse("");
    setDraftDescription("");
    setDraftHref("");
    setDraftBuyText("Shop Now");
    setDraftBadge("");
    setDraftAccent("#E8001C");
  }

  // â”€â”€ Delete committed pin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function deletePin(id: string) {
    setPins((prev) => prev.filter((p) => p.id !== id));
  }

  // â”€â”€ Save to Firestore â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function handleSave() {
    if (!imageUrl) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await saveCharacterHotspotConfig({ imageUrl, imageAlt, active, pins });
      setSuccess(true);
    } catch {
      setError("Save failed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const STEPS: { key: WizardStep; label: string }[] = [
    { key: "image", label: "Image" },
    { key: "place", label: "Place Pin" },
    { key: "details", label: "Pin Details" },
    { key: "review", label: "Review & Save" },
  ];
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
          Saved to database successfully!
        </p>
      )}

      {/* Progress stepper */}
      <div className="flex items-start">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className="h-0.5 flex-1"
                  style={{ background: i <= stepIndex ? "var(--color-black)" : "var(--border-ink)" }}
                />
              )}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: i < stepIndex ? "var(--color-black)" : i === stepIndex ? "var(--color-yellow)" : "var(--surface-elevated)",
                  color: i < stepIndex ? "var(--color-yellow)" : "var(--color-black)",
                  border: i <= stepIndex ? "2px solid var(--color-black)" : "2px solid var(--border-ink)",
                }}
              >
                {i < stepIndex ? "âœ“" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-0.5 flex-1"
                  style={{ background: i < stepIndex ? "var(--color-black)" : "var(--border-ink)" }}
                />
              )}
            </div>
            <span className="mt-1 text-center text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* â”€â”€ Step 1: Upload Image â”€â”€ */}
      {step === "image" && (
        <div
          className="space-y-4 rounded-lg border-2 p-6"
          style={{ borderColor: "var(--border-ink)", background: "var(--surface-elevated)" }}
        >
          <h2 className="text-lg font-bold">Upload Background Image</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Choose a wide panoramic image that shows all the characters. You will place pins on it in the next step.
          </p>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors hover:opacity-80" style={{ borderColor: "var(--border-ink)" }}>
            <span className="text-3xl">ðŸ–¼</span>
            <span className="font-medium">{uploading ? "Uploadingâ€¦" : "Click to choose image"}</span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>JPG, PNG, WebP â€” wide landscape images work best</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>

          {imageUrl && (
            <div className="space-y-1">
              <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: "37.5%" }}>
                <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes="680px" />
              </div>
              <p className="text-xs font-medium text-green-700">âœ“ Image uploaded</p>
            </div>
          )}

          <Input
            label="Image Alt Text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="DC, Marvel and Anime characters"
          />
          <Checkbox
            label="Active (show on homepage)"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />

          <div className="flex items-center justify-end gap-3 border-t pt-4" style={{ borderColor: "var(--border-ink)" }}>
            {(initial?.pins?.length ?? 0) > 0 && (
              <Button type="button" variant="ghost" onClick={() => setStep("review")}>
                Skip to Review
              </Button>
            )}
            <Button type="button" onClick={() => setStep("place")} disabled={!imageUrl || uploading}>
              Next: Place Pins â†’
            </Button>
          </div>
        </div>
      )}

      {/* â”€â”€ Step 2: Place Pin â”€â”€ */}
      {step === "place" && (
        <div
          className="space-y-4 rounded-lg border-2 p-6"
          style={{ borderColor: "var(--border-ink)", background: "var(--surface-elevated)" }}
        >
          <h2 className="text-lg font-bold">Place a Pin</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            <strong>Click anywhere on the image</strong> to drop a pin, or enter exact coordinates below.
          </p>

          {/* Image â€” crosshair cursor, click to place */}
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-lg"
            style={{ paddingTop: "56.25%", cursor: "crosshair", background: "#111" }}
            onClick={handleImageClick}
          >
            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes="(max-width: 680px) 100vw" />

            {/* Committed pins â€” non-interactive preview */}
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="pointer-events-none absolute"
                style={{ left: `${pin.xPct}%`, top: `${pin.yPct}%`, transform: "translate(-50%, -50%)", zIndex: 10 }}
              >
                <div
                  className="flex items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ width: 24, height: 24, background: pin.accent || "#E8001C", border: "2px solid white", boxShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                >
                  +
                </div>
                {pin.name && (
                  <div
                    className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
                    style={{ background: "#0D0D0D" }}
                  >
                    {pin.name}
                  </div>
                )}
              </div>
            ))}

            {/* Draft pin marker (pulsing star) */}
            {draftPos && (
              <div
                className="absolute"
                style={{ left: `${draftPos.xPct}%`, top: `${draftPos.yPct}%`, transform: "translate(-50%, -50%)", zIndex: 20 }}
              >
                <span
                  className="absolute animate-ping rounded-full"
                  style={{ inset: -6, background: "rgba(255,228,0,0.4)", pointerEvents: "none" }}
                />
                <div
                  className="relative flex items-center justify-center rounded-full font-bold"
                  style={{
                    width: 32,
                    height: 32,
                    background: "var(--color-yellow)",
                    border: "3px solid var(--color-black)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.55)",
                    color: "var(--color-black)",
                    fontSize: 18,
                  }}
                >
                  â˜…
                </div>
                <div
                  className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: "var(--color-black)", color: "var(--color-yellow)" }}
                >
                  NEW PIN
                </div>
              </div>
            )}
          </div>

          {/* Manual coordinate fallback */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="X Position (%)"
              type="number"
              min={1}
              max={99}
              step={0.1}
              value={draftPos?.xPct ?? ""}
              placeholder="e.g. 42.5"
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v))
                  setDraftPos((prev) => ({ id: prev?.id ?? randomId(), xPct: Math.max(1, Math.min(99, v)), yPct: prev?.yPct ?? 50 }));
              }}
            />
            <Input
              label="Y Position (%)"
              type="number"
              min={1}
              max={99}
              step={0.1}
              value={draftPos?.yPct ?? ""}
              placeholder="e.g. 30.0"
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v))
                  setDraftPos((prev) => ({ id: prev?.id ?? randomId(), xPct: prev?.xPct ?? 50, yPct: Math.max(1, Math.min(99, v)) }));
              }}
            />
          </div>

          {pins.length > 0 && (
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              {pins.length} pin{pins.length !== 1 ? "s" : ""} already placed on this image.
            </p>
          )}

          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--border-ink)" }}>
            <Button type="button" variant="ghost" onClick={() => setStep("image")}>â† Back</Button>
            <div className="flex items-center gap-3">
              {pins.length > 0 && (
                <Button type="button" variant="secondary" onClick={() => setStep("review")}>
                  Done Adding Pins
                </Button>
              )}
              <Button type="button" onClick={() => setStep("details")} disabled={!draftPos}>
                Continue: Add Details â†’
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Step 3: Pin Details â”€â”€ */}
      {step === "details" && (
        <div
          className="space-y-4 rounded-lg border-2 p-6"
          style={{ borderColor: "var(--border-ink)", background: "var(--surface-elevated)" }}
        >
          <h2 className="text-lg font-bold">Pin Details</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Fill in the details for the pin at <strong>{draftPos?.xPct}%, {draftPos?.yPct}%</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Name *" value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="SPIDER-MAN" />
            <Input label="Universe / Category *" value={draftUniverse} onChange={(e) => setDraftUniverse(e.target.value)} placeholder="Marvel" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold">Description *</label>
            <textarea
              rows={3}
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              className="resize-none rounded border-2 px-3 py-2 text-sm outline-none focus:opacity-80"
              style={{ borderColor: "var(--border-ink)", background: "var(--surface-elevated)", color: "var(--color-black)" }}
              placeholder="Short description shown in the popupâ€¦"
            />
          </div>

          <Input label="Link (href) *" value={draftHref} onChange={(e) => setDraftHref(e.target.value)} placeholder="/franchise/marvel" />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Button Text *" value={draftBuyText} onChange={(e) => setDraftBuyText(e.target.value)} placeholder="Get Spider-Man Figures" />
            <Input label="Badge Label" value={draftBadge} onChange={(e) => setDraftBadge(e.target.value)} placeholder="MARVEL" />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input label="Accent Colour (hex)" value={draftAccent} onChange={(e) => setDraftAccent(e.target.value)} placeholder="#E8001C" />
            </div>
            <input
              type="color"
              value={draftAccent}
              onChange={(e) => setDraftAccent(e.target.value)}
              className="mb-0.5 h-10 w-10 cursor-pointer rounded border-2"
              style={{ borderColor: "var(--border-ink)" }}
              title="Pick colour"
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--border-ink)" }}>
            <Button type="button" variant="ghost" onClick={() => setStep("place")}>â† Back</Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={!draftName || !draftHref}
                onClick={() => { commitDraftPin(); setStep("review"); }}
              >
                Save Pin &amp; Finish
              </Button>
              <Button
                type="button"
                disabled={!draftName || !draftHref}
                onClick={() => { commitDraftPin(); setStep("place"); }}
              >
                Save Pin &amp; Add Another â†’
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Step 4: Review & Save â”€â”€ */}
      {step === "review" && (
        <div
          className="space-y-4 rounded-lg border-2 p-6"
          style={{ borderColor: "var(--border-ink)", background: "var(--surface-elevated)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Review &amp; Save</h2>
            <span className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: "var(--surface-warm)" }}>
              {pins.length} pin{pins.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Preview image */}
          <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: "56.25%", background: "#111" }}>
            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes="(max-width: 680px) 100vw" />
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="pointer-events-none absolute"
                style={{ left: `${pin.xPct}%`, top: `${pin.yPct}%`, transform: "translate(-50%, -50%)", zIndex: 10 }}
              >
                <div
                  className="flex items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ width: 28, height: 28, background: pin.accent || "#E8001C", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.55)" }}
                >
                  +
                </div>
                {pin.name && (
                  <div
                    className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
                    style={{ background: "#0D0D0D" }}
                  >
                    {pin.name}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pin list */}
          {pins.length > 0 ? (
            <ul className="divide-y rounded-lg border" style={{ borderColor: "var(--border-ink)" }}>
              {pins.map((pin, i) => (
                <li key={pin.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: pin.accent || "#E8001C" }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {pin.name || <span className="italic" style={{ color: 'var(--color-muted)' }}>Unnamed</span>}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {pin.universe} Â· {pin.xPct.toFixed(0)}%, {pin.yPct.toFixed(0)}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePin(pin.id)}
                    className="shrink-0 rounded p-1 text-xs text-red-500 hover:bg-red-50"
                    title="Remove pin"
                  >
                    âœ•
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="rounded-lg border-2 border-dashed p-8 text-center text-sm"
              style={{ borderColor: "var(--border-ink)", color: "var(--color-muted)" }}
            >
              No pins yet â€” add some using the button below.
            </div>
          )}

          {/* Image settings (collapsible) */}
          <details className="rounded-lg border p-3" style={{ borderColor: "var(--border-ink)" }}>
            <summary className="cursor-pointer text-sm font-medium">Image Settings</summary>
            <div className="mt-3 space-y-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded border-2 border-dashed px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80" style={{ borderColor: "var(--border-ink)" }}>
                {uploading ? "Uploadingâ€¦" : "Replace Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <Input label="Image Alt Text" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
              <Checkbox label="Active (show on homepage)" checked={active} onChange={(e) => setActive(e.target.checked)} />
            </div>
          </details>

          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--border-ink)" }}>
            <Button type="button" variant="secondary" onClick={() => { setDraftPos(null); setStep("place"); }}>
              + Add Another Pin
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              loading={saving}
              disabled={!imageUrl || saving || pins.length === 0}
            >
              Save to Database
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}