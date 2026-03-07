"use client";

import type React from "react";
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

  const headingStyle = {
    fontFamily: "var(--font-bangers, Bangers, cursive)",
    letterSpacing: "0.1em",
    fontSize: "1rem",
    color: "#FFE500",
  } as React.CSSProperties;

  const linkStyle = {
    color: "#CBD5E1",
    transition: "color 0.12s",
  } as React.CSSProperties;

  return (
    <footer
      style={{
        background: "#0D0D0D",
        color: "#CBD5E1",
        borderTop: "4px solid #FFE500",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Brand tagline strip */}
        <div
          className="mb-10 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderBottom: "2px solid #2D2D2D" }}
        >
          <div>
            <p
              className="text-3xl"
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                letterSpacing: "0.08em",
                color: "#FFE500",
              }}
            >
              HOBSON COLLECTIBLES
            </p>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              {siteConfig?.siteTagline ?? "India's Premier Collectibles Destination"}
            </p>
          </div>
          {/* Social / contact quick links */}
          <div className="flex items-center gap-3">
            {siteConfig?.contactEmail && (
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded transition-colors"
                style={{
                  border: "2px solid #FFE500",
                  color: "#FFE500",
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#FFE500";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#0D0D0D";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#FFE500";
                }}
              >
                ✉ EMAIL US
              </a>
            )}
            {siteConfig?.whatsappCustomerCare && (
              <a
                href={`https://wa.me/${siteConfig.whatsappCustomerCare}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded transition-colors"
                style={{
                  background: "#25D366",
                  border: "2px solid #0D0D0D",
                  color: "#fff",
                  boxShadow: "3px 3px 0px #0D0D0D",
                  letterSpacing: "0.05em",
                }}
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Our Info */}
          <div>
            <h3 className="mb-4" style={headingStyle}>
              OUR INFO
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { label: "Home",       href: ROUTES.HOME },
                { label: "Shop All",   href: ROUTES.SEARCH },
                { label: "Blog",       href: ROUTES.BLOG },
                { label: "About Us",   href: ROUTES.PAGE("about") },
                { label: "Contact Us", href: ROUTES.PAGE("contact") },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={linkStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#FFE500")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#CBD5E1")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4" style={headingStyle}>
              MY ACCOUNT
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { label: "My Account",   href: ROUTES.ACCOUNT },
                { label: "My Wishlist",  href: ROUTES.ACCOUNT_WISHLIST },
                { label: "My Orders",    href: ROUTES.ACCOUNT_ORDERS },
                { label: "My Addresses", href: ROUTES.ACCOUNT_ADDRESSES },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={linkStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#FFE500")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#CBD5E1")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="mb-4" style={headingStyle}>
              STORE POLICIES
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { label: "Terms & Conditions", href: ROUTES.POLICY("terms-of-service") },
                { label: "Privacy Policy",     href: ROUTES.POLICY("privacy-policy") },
                { label: "Shipping Policy",    href: ROUTES.POLICY("shipping-policy") },
                { label: "Refund Policy",      href: ROUTES.POLICY("refund-policy") },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={linkStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#FFE500")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#CBD5E1")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4" style={headingStyle}>
              CONTACT
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              {siteConfig?.contactEmail && (
                <li>
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    style={linkStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#FFE500")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#CBD5E1")}
                  >
                    ✉ {siteConfig.contactEmail}
                  </a>
                </li>
              )}
              {siteConfig?.whatsappCustomerCare && (
                <li>
                  <a
                    href={`https://wa.me/${siteConfig.whatsappCustomerCare}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#25D366")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#CBD5E1")}
                  >
                    💬 WhatsApp: +{siteConfig.whatsappCustomerCare}
                  </a>
                </li>
              )}
              {siteConfig?.supportHours && (
                <li style={{ color: "#64748B", fontSize: "0.75rem" }}>
                  🕐 {siteConfig.supportHours}
                </li>
              )}
              {siteConfig?.locations?.map((loc) =>
                loc.active ? (
                  <li key={loc.city} style={{ color: "#64748B", fontSize: "0.75rem" }}>
                    📍 {loc.city}: {loc.address}
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ borderTop: "2px solid #2D2D2D", color: "#64748B" }}
        >
          <span>{copyright}</span>
          <span>Made with ❤️ for collectors</span>
        </div>
      </div>
    </footer>
  );
}

