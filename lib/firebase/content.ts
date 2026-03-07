import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
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
