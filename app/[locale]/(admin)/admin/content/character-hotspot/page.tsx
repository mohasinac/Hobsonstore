"use client";

import { useEffect, useState } from "react";
import { getCharacterHotspotConfig } from "@/lib/firebase/content";
import { CharacterHotspotForm } from "@/components/admin/CharacterHotspotForm";
import type { CharacterHotspotConfig } from "@/types/content";

export default function AdminCharacterHotspotPage() {
  const [config, setConfig] = useState<CharacterHotspotConfig | null | undefined>(undefined);

  useEffect(() => {
    getCharacterHotspotConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  if (config === undefined) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Character Hotspot</h1>
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Character Hotspot</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a panoramic scene image then click on it to place interactive
          character pins. Each pin has a name, description, accent colour, and a
          link to a franchise or search page.
        </p>
      </div>
      <CharacterHotspotForm initial={config ?? undefined} />
    </div>
  );
}
