"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const db = getFirestore(app);
      await setDoc(doc(db, COLLECTIONS.USERS, cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        role: "customer",
        hcCoins: 0,
        addresses: [],
        wishlist: [],
        coinHistory: [],
        createdAt: serverTimestamp(),
      });
      router.replace(ROUTES.HOME);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)/, ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError("");
    setLoading(true);
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const { user } = result;
      const db = getFirestore(app);
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      // Only create doc if it doesn't exist (user may have registered before)
      const { getDoc } = await import("firebase/firestore");
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName ?? "",
          role: "customer",
          hcCoins: 0,
          addresses: [],
          wishlist: [],
          coinHistory: [],
          createdAt: serverTimestamp(),
        });
      }
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
        Create an account
      </h1>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          autoComplete="new-password"
          required
        />
        <Button type="submit" loading={loading} fullWidth>
          Create account
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-sm" style={{ color: "var(--color-muted)" }}>
        <span className="flex-1 border-t" />
        or
        <span className="flex-1 border-t" />
      </div>

      <Button
        variant="secondary"
        fullWidth
        onClick={handleGoogleRegister}
        loading={loading}
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
        Already have an account?{" "}
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
