"use server";

import { revalidateTag } from "next/cache";

/** Call after any admin write that affects storefront content (banners, franchises, brands, etc.). */
export async function revalidateContentCache() {
  revalidateTag("content", {});
}

/** Call after any admin write that affects products. */
export async function revalidateProductsCache() {
  revalidateTag("products", {});
}
