import type { App } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

export function getAdminApp(): App {
  if (adminApp) return adminApp;

  // Lazy import to ensure this module is only ever loaded server-side
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initializeApp, getApps, cert } = require("firebase-admin/app");

  if (getApps().length) {
    adminApp = getApps()[0] as App;
    return adminApp;
  }

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "{}",
  ) as object;

  adminApp = initializeApp({ credential: cert(serviceAccount) }) as App;
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (adminDb) return adminDb;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getFirestore } = require("firebase-admin/firestore");
  adminDb = getFirestore(getAdminApp()) as Firestore;
  return adminDb;
}
