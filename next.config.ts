import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// All @mohasinac/* packages are resolved via tsconfig paths pointing to their
// src/ directories — transpilePackages tells Next.js/webpack to compile them.
const MOHASINAC_PACKAGES = [
  "@mohasinac/contracts",
  "@mohasinac/core",
  "@mohasinac/tokens",
  "@mohasinac/errors",
  "@mohasinac/utils",
  "@mohasinac/validation",
  "@mohasinac/http",
  "@mohasinac/next",
  "@mohasinac/react",
  "@mohasinac/ui",
  "@mohasinac/monitoring",
  "@mohasinac/seo",
  "@mohasinac/security",
  "@mohasinac/css-tailwind",
  "@mohasinac/css-vanilla",
  "@mohasinac/db-firebase",
  "@mohasinac/auth-firebase",
  "@mohasinac/email-resend",
  "@mohasinac/storage-firebase",
  "@mohasinac/feat-layout",
  "@mohasinac/feat-forms",
  "@mohasinac/feat-filters",
  "@mohasinac/feat-media",
  "@mohasinac/feat-search",
  "@mohasinac/feat-categories",
  "@mohasinac/feat-blog",
  "@mohasinac/feat-reviews",
  "@mohasinac/feat-faq",
  "@mohasinac/feat-auth",
  "@mohasinac/feat-account",
  "@mohasinac/feat-homepage",
  "@mohasinac/feat-products",
  "@mohasinac/feat-wishlist",
  "@mohasinac/feat-cart",
  "@mohasinac/feat-payments",
  "@mohasinac/feat-checkout",
  "@mohasinac/feat-orders",
  "@mohasinac/feat-admin",
  "@mohasinac/feat-loyalty",
  "@mohasinac/feat-collections",
  "@mohasinac/feat-preorders",
  "@mohasinac/feat-whatsapp-bot",
  "@mohasinac/cli",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  transpilePackages: MOHASINAC_PACKAGES,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
