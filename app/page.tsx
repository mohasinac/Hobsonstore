import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

// Phase 1: redirect root to /collections.
// Phase 2 replaces this with the full dynamic homepage at app/(storefront)/page.tsx.
export default function RootPage() {
  redirect(ROUTES.COLLECTIONS);
}
