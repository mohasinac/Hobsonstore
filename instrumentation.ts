/**
 * Next.js Instrumentation Hook
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Runs once when the Node.js server process starts (not on every request,
 * not in the Edge runtime). Used to verify Firebase connectivity so
 * mis-configuration is caught immediately at boot rather than silently
 * at the first request.
 */

export async function register() {
  // Only run in the Node.js runtime, not in the Edge runtime
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  console.log("[startup] Verifying Firebase Admin SDK connectivity…");

  try {
    // Dynamic import keeps firebase-admin out of the Edge bundle
    const { getAdminApp, getAdminDb } = await import("@/lib/firebase/admin");

    // 1. Verify the service account JSON env var is present and parseable
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var is missing.");
    }
    let parsed: { project_id?: string };
    try {
      parsed = JSON.parse(raw) as { project_id?: string };
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
    }
    if (!parsed.project_id) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is missing 'project_id'.",
      );
    }
    console.log(`[startup] ✓ Service account loaded (project: ${parsed.project_id})`);

    // 2. Initialise the Admin App (idempotent — safe to call multiple times)
    getAdminApp();
    console.log("[startup] ✓ Firebase Admin App initialised");

    // 3. Verify Firestore is reachable with a lightweight read
    const db = getAdminDb();
    await db.collection("siteConfig").limit(1).get();
    console.log("[startup] ✓ Firestore connection OK");

    // 4. Verify Firebase Auth is reachable
    const { getAuth } = await import("firebase-admin/auth");
    await getAuth().listUsers(1);
    console.log("[startup] ✓ Firebase Auth connection OK");

    console.log("[startup] All Firebase checks passed ✓");
  } catch (err) {
    // Log clearly but don't throw — allows the app to start even in CI or
    // local dev without production credentials so errors appear at request
    // time rather than crashing the server process.
    console.error("[startup] ✗ Firebase connectivity check FAILED:", err);
  }
}
