/**
 * scheduledSitemapRebuild — Firebase Cloud Function
 *
 * Runs daily at 2am IST (20:30 UTC previous day) via Cloud Scheduler.
 * POSTs to /api/revalidate with the homepage and sitemap path so that
 * Next.js ISR caches are refreshed with the latest Firestore data.
 */

import * as functions from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { initializeApp, getApps } from "firebase-admin/app";

if (!getApps().length) initializeApp();

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://hobsoncollectibles.in";
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? "";

async function revalidate(paths: string[]): Promise<void> {
  const url = `${APP_URL}/api/revalidate`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${REVALIDATE_SECRET}`,
    },
    body: JSON.stringify({ paths }),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error("[scheduledSitemapRebuild] revalidate call failed", {
      status: res.status,
      body: text,
    });
    throw new Error(`Revalidate failed: ${res.status}`);
  }

  const json = (await res.json()) as { revalidated?: string[] };
  logger.info("[scheduledSitemapRebuild] revalidated", json.revalidated);
}

// Runs at 20:30 UTC = 02:00 IST
export const scheduledSitemapRebuild = functions.onSchedule(
  {
    schedule: "30 20 * * *",
    timeZone: "UTC",
    region: "asia-south1",
  },
  async () => {
    logger.info("[scheduledSitemapRebuild] starting daily sitemap rebuild");
    await revalidate(["/", "/sitemap.xml", "/blog", "/collections"]);
    logger.info("[scheduledSitemapRebuild] done");
  },
);
