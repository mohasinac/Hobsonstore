"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(getFirebaseApp());
      await signInWithEmailAndPassword(auth, email, password);
      router.replace(ROUTES.HOME);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      setError(msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)/, ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(getFirebaseApp());
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace(ROUTES.HOME);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)/, ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-center" style={{ color: "var(--color-black)" }}>
        Sign in to your account
      </h1>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-indigo-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} fullWidth>
          Sign in
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-sm" style={{ color: "var(--color-muted)" }}>
        <span className="flex-1 border-t" style={{ borderColor: "var(--border-ink)", opacity: 0.2 }} />
        or
        <span className="flex-1 border-t" style={{ borderColor: "var(--border-ink)", opacity: 0.2 }} />
      </div>

      <Button
        variant="secondary"
        fullWidth
        onClick={handleGoogleLogin}
        loading={loading}
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-indigo-600 font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
