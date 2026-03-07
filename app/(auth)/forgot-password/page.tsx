"use client";

import { useState } from "react";
import Link from "next/link";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(getFirebaseApp());
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send reset email.";
      setError(msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)/, ""));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mb-4 text-3xl">📧</div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">
          Check your email
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Password reset instructions have been sent to <strong>{email}</strong>
          .
        </p>
        <Link
          href="/login"
          className="text-indigo-600 text-sm font-medium hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-xl font-bold text-gray-900 text-center">
        Reset password
      </h1>
      <p className="mb-6 text-sm text-gray-500 text-center">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Button type="submit" loading={loading} fullWidth>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-indigo-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
