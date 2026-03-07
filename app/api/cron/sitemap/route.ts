/**
 * GET /api/cron/sitemap
 *
 * Called daily by Vercel Cron (schedule defined in vercel.json).
 * Replaces the Firebase `scheduledSitemapRebuild` Cloud Function.
 *
 * Vercel sends an Authorization header with the value `Bearer <CRON_SECRET>`
 * when CRON_SECRET is set as an environment variable.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const PATHS = ["/", "/sitemap.xml", "/blog", "/collections"];

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  for (const path of PATHS) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: PATHS });
}
