import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  getFirestore,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { COLLECTIONS } from "@/constants/firebase";
import type { Product, ProductFilters } from "@/types/product";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export async function getProduct(slug: string): Promise<Product | null> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where("slug", "==", slug),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0]!.id, ...snap.docs[0]!.data() } as Product;
}

export async function getProducts(
  filters: ProductFilters = {},
  pageSize = 24,
  cursor?: QueryDocumentSnapshot,
): Promise<{ products: Product[]; lastDoc: QueryDocumentSnapshot | null }> {
  const db = getDb();
  const constraints = [];

  if (filters.franchise) {
    constraints.push(where("franchise", "==", filters.franchise));
  }
  if (filters.brand) {
    constraints.push(where("brand", "==", filters.brand));
  }
  if (filters.inStockOnly) {
    constraints.push(where("inStock", "==", true));
  }
  if (filters.priceMin !== undefined) {
    constraints.push(where("salePrice", ">=", filters.priceMin));
  }
  if (filters.priceMax !== undefined) {
    constraints.push(where("salePrice", "<=", filters.priceMax));
  }

  const sortField =
    filters.sort === "price_asc" || filters.sort === "price_desc"
      ? "salePrice"
      : filters.sort === "az" || filters.sort === "za"
        ? "name"
        : filters.sort === "oldest"
          ? "createdAt"
          : "createdAt";

  const sortDir =
    filters.sort === "price_asc" ||
    filters.sort === "az" ||
    filters.sort === "oldest"
      ? ("asc" as const)
      : ("desc" as const);

  constraints.push(orderBy(sortField, sortDir));

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));

  const q = query(collection(db, COLLECTIONS.PRODUCTS), ...constraints);
  const snap = await getDocs(q);

  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { products, lastDoc };
}

export async function getRelatedProducts(
  product: Product,
  count = 4,
): Promise<Product[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where("franchise", "==", product.franchise),
    where("inStock", "==", true),
    limit(count + 1),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Product)
    .filter((p) => p.id !== product.id)
    .slice(0, count);
}

export async function searchProducts(searchQuery: string): Promise<Product[]> {
  if (!searchQuery.trim()) return [];
  const db = getDb();
  // Firestore prefix query trick: >= query AND < query with a high Unicode char appended
  const end = searchQuery + "\uf8ff";
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where("name", ">=", searchQuery),
    where("name", "<=", end),
    limit(30),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}
