import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/revalidate
 * Body: { path: string } or { paths: string[] }
 * Header: Authorization: Bearer <REVALIDATE_SECRET>
 *
 * Used by admin saves and the scheduled Cloud Function to invalidate ISR caches.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET not configured" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { path, paths } = body as { path?: string; paths?: string[] };

  const toRevalidate: string[] = [];
  if (typeof path === "string" && path.startsWith("/")) {
    toRevalidate.push(path);
  }
  if (Array.isArray(paths)) {
    for (const p of paths) {
      if (typeof p === "string" && p.startsWith("/")) {
        toRevalidate.push(p);
      }
    }
  }

  if (toRevalidate.length === 0) {
    return NextResponse.json(
      { error: "No valid paths provided" },
      { status: 400 },
    );
  }

  for (const p of toRevalidate) {
    revalidatePath(p);
  }

  return NextResponse.json({ revalidated: toRevalidate });
}
