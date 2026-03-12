import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { COLLECTIONS } from "@/constants/firebase";
import type {
  Banner,
  HomeSection,
  Testimonial,
  FAQItem,
  Announcement,
  BlogPost,
  ContentPage,
  PromoBanner,
  CharacterHotspotConfig,
  TrustBadge,
} from "@/types/content";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export async function getBanners(): Promise<Banner[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BANNERS),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Banner);
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.PROMO_BANNERS),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
    limit(4),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PromoBanner);
}

export async function getHomeSections(): Promise<HomeSection[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.HOME_SECTIONS),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HomeSection);
}

export async function getTestimonials(
  featuredOnly = false,
): Promise<Testimonial[]> {
  const db = getDb();
  const constraints = [
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  ];
  if (featuredOnly) constraints.unshift(where("featured", "==", true));
  const q = query(collection(db, COLLECTIONS.TESTIMONIALS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Testimonial);
}

export async function getFAQ(): Promise<FAQItem[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.FAQ),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FAQItem);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.ANNOUNCEMENTS),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Announcement);
}

export async function getPage(slug: string): Promise<ContentPage | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.PAGES, slug));
  if (!snap.exists()) return null;
  return snap.data() as ContentPage;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BLOG),
    where("slug", "==", slug),
    where("published", "==", true),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0]!.id, ...snap.docs[0]!.data() } as BlogPost;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BLOG),
    where("published", "==", true),
    orderBy("publishedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BlogPost);
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

// Banners
export async function createBanner(data: Omit<Banner, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.BANNERS), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}
export async function updateBanner(id: string, data: Partial<Omit<Banner, "id">>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.BANNERS, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteBanner(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.BANNERS, id));
}

// Promo Banners
export async function createPromoBanner(data: Omit<PromoBanner, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.PROMO_BANNERS), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}
export async function updatePromoBanner(id: string, data: Partial<Omit<PromoBanner, "id">>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.PROMO_BANNERS, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deletePromoBanner(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.PROMO_BANNERS, id));
}

// Home Sections
export async function createHomeSection(data: Omit<HomeSection, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.HOME_SECTIONS), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}
export async function updateHomeSection(id: string, data: Partial<Omit<HomeSection, "id">>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.HOME_SECTIONS, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteHomeSection(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.HOME_SECTIONS, id));
}

// Testimonials
export async function createTestimonial(data: Omit<Testimonial, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.TESTIMONIALS), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}
export async function updateTestimonial(id: string, data: Partial<Omit<Testimonial, "id">>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.TESTIMONIALS, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteTestimonial(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.TESTIMONIALS, id));
}

// FAQs
export async function createFAQ(data: Omit<FAQItem, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.FAQ), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}
export async function updateFAQ(id: string, data: Partial<Omit<FAQItem, "id">>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.FAQ, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteFAQ(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.FAQ, id));
}

// Announcements
export async function createAnnouncement(data: Omit<Announcement, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.ANNOUNCEMENTS), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}
export async function updateAnnouncement(id: string, data: Partial<Omit<Announcement, "id">>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.ANNOUNCEMENTS, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.ANNOUNCEMENTS, id));
}

// Blog posts — admin (includes unpublished)
export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTIONS.BLOG), orderBy("publishedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BlogPost);
}
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.BLOG, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as BlogPost;
}
export async function createBlogPost(data: Omit<BlogPost, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.BLOG), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}
export async function updateBlogPost(id: string, data: Partial<Omit<BlogPost, "id">>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.BLOG, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteBlogPost(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.BLOG, id));
}

// Static pages
export async function upsertPage(slug: string, data: Omit<ContentPage, "slug"> & { slug?: string }): Promise<void> {
  await setDoc(doc(getDb(), COLLECTIONS.PAGES, slug), { ...data, slug, updatedAt: serverTimestamp() }, { merge: true });
}

// ─── Character Hotspot (singleton "main") ─────────────────────────────────────

export async function getCharacterHotspotConfig(): Promise<CharacterHotspotConfig | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.CHARACTER_HOTSPOT, "main"));
  if (!snap.exists()) return null;
  return snap.data() as CharacterHotspotConfig;
}

export async function saveCharacterHotspotConfig(data: CharacterHotspotConfig): Promise<void> {
  await setDoc(
    doc(getDb(), COLLECTIONS.CHARACTER_HOTSPOT, "main"),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

// ─── Trust Badges ──────────────────────────────────────────────────

export async function getTrustBadges(): Promise<TrustBadge[]> {
  const q = query(collection(getDb(), COLLECTIONS.TRUST_BADGES), orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TrustBadge);
}
export async function createTrustBadge(data: Omit<TrustBadge, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.TRUST_BADGES), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}
export async function updateTrustBadge(id: string, data: Partial<Omit<TrustBadge, "id">>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.TRUST_BADGES, id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteTrustBadge(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.TRUST_BADGES, id));
}
