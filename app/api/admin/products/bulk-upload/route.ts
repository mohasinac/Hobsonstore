import { NextRequest, NextResponse } from "next/server";
import { getAdminApp, getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants/firebase";

interface BulkRow {
  name: string;
  slug: string;
  salePrice: number;
  regularPrice: number;
  franchise: string;
  brand: string;
  tags: string[];
  stock: number;
}

async function verifyAdminToken(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase-admin/auth");
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    const db = getAdminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists) return null;
    const userData = userSnap.data() as { role?: string };
    if (userData.role !== "admin") return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const adminUid = await verifyAdminToken(req);
  if (!adminUid) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { rows: BulkRow[] };
  try {
    body = (await req.json()) as { rows: BulkRow[] };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { rows } = body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided." }, { status: 400 });
  }

  const db = getAdminDb();
  // Firestore batch limit is 500 writes
  const BATCH_SIZE = 499;
  let written = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const row of chunk) {
      const ref = db.collection(COLLECTIONS.PRODUCTS).doc();
      batch.set(ref, {
        name: row.name,
        slug: row.slug,
        salePrice: row.salePrice,
        regularPrice: row.regularPrice,
        franchise: row.franchise,
        brand: row.brand,
        tags: row.tags,
        stock: row.stock,
        availableStock: row.stock,
        reservedStock: 0,
        inStock: row.stock > 0,
        images: [],
        videos: [],
        specs: {},
        restockHistory: [],
        lowStockThreshold: 5,
        isPreorder: false,
        published: false,
        featured: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
    written += chunk.length;
  }

  return NextResponse.json({ count: written });
}
