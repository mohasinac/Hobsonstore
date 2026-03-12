// i18n/navigation.ts
// Locale-aware navigation helpers — import Link, useRouter, usePathname,
// redirect from here instead of next/link / next/navigation.

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
