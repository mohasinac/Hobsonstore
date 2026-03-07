"use client";

import { useState } from "react";
import { doc, setDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;

    setStatus("loading");
    try {
      const db = getFirestore(getFirebaseApp());
      await setDoc(doc(db, COLLECTIONS.NEWSLETTER_SIGNUPS, trimmed), {
        email: trimmed,
        subscribedAt: serverTimestamp(),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center text-sm font-medium text-green-700">
        🎉 You&rsquo;re subscribed! Watch your inbox for the latest drops.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Input
          type="email"
          label="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        loading={status === "loading"}
        className="sm:mb-[1px]"
      >
        Subscribe
      </Button>
      {status === "error" && (
        <p className="w-full text-xs text-red-600">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
