import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { SiteConfig } from "@/types/config";

interface FooterProps {
  siteConfig: SiteConfig | null;
}

export function Footer({ siteConfig }: FooterProps) {
  const year = new Date().getFullYear();
  const copyright =
    siteConfig?.footerCopyright ?? `© ${year}, HOBSON COLLECTIBLES`;

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Our Info */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Our Info
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href={ROUTES.HOME} className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SEARCH} className="hover:text-white">
                  Search
                </Link>
              </li>
              <li>
                <Link href={ROUTES.BLOG} className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PAGE("about")} className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PAGE("contact")}
                  className="hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Shop
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href={ROUTES.ACCOUNT} className="hover:text-white">
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ACCOUNT_WISHLIST}
                  className="hover:text-white"
                >
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ACCOUNT_ORDERS} className="hover:text-white">
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ACCOUNT_ADDRESSES}
                  className="hover:text-white"
                >
                  My Addresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Store Policies
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href={ROUTES.POLICY("terms-of-service")}
                  className="hover:text-white"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.POLICY("privacy-policy")}
                  className="hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.POLICY("shipping-policy")}
                  className="hover:text-white"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.POLICY("refund-policy")}
                  className="hover:text-white"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Contact
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {siteConfig?.contactEmail && (
                <li>
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="hover:text-white"
                  >
                    {siteConfig.contactEmail}
                  </a>
                </li>
              )}
              {siteConfig?.whatsappCustomerCare && (
                <li>
                  <a
                    href={`https://wa.me/${siteConfig.whatsappCustomerCare}`}
                    className="hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WA: +{siteConfig.whatsappCustomerCare}
                  </a>
                </li>
              )}
              {siteConfig?.supportHours && (
                <li className="text-xs text-gray-500">
                  {siteConfig.supportHours}
                </li>
              )}
              {siteConfig?.locations.map((loc) =>
                loc.active ? (
                  <li key={loc.city} className="text-xs text-gray-500">
                    {loc.city}: {loc.address}
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          {copyright}
        </div>
      </div>
    </footer>
  );
}
