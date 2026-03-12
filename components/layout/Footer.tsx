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
    color: "var(--color-yellow)",
  } as React.CSSProperties;

  const linkStyle = {
    color: "var(--dark-section-text)",
    transition: "color 0.12s",
  } as React.CSSProperties;

  return (
    <footer
      style={{
        background: "var(--dark-section-bg)",
        color: "var(--dark-section-text)",
        borderTop: "4px solid var(--color-yellow)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Brand tagline strip */}
        <div
          className="mb-10 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderBottom: "2px solid var(--dark-section-border)" }}
        >
          <div>
            <p
              className="text-3xl"
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                letterSpacing: "0.08em",
                color: "var(--color-yellow)",
              }}
            >
              HOBSON COLLECTIBLES
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--dark-section-muted)" }}>
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
                  border: "2px solid var(--color-yellow)",
                  color: "var(--color-yellow)",
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-yellow)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--dark-section-bg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-yellow)";
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
                  border: "2px solid var(--border-ink)",
                  color: "#fff",
                  boxShadow: "3px 3px 0px var(--border-ink)",
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
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-yellow)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dark-section-text)")}
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
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-yellow)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dark-section-text)")}
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
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-yellow)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dark-section-text)")}
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
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-yellow)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dark-section-text)")}
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
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dark-section-text)")}
                  >
                    💬 WhatsApp: +{siteConfig.whatsappCustomerCare}
                  </a>
                </li>
              )}
              {siteConfig?.supportHours && (
                <li style={{ color: "var(--dark-section-dim)", fontSize: "0.75rem" }}>
                  🕐 {siteConfig.supportHours}
                </li>
              )}
              {siteConfig?.locations?.map((loc) =>
                loc.active ? (
                  <li key={loc.city} style={{ color: "var(--dark-section-dim)", fontSize: "0.75rem" }}>
                    📍 {loc.city}: {loc.address}
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="relative mt-10 pt-6 flex items-center justify-center text-xs"
          style={{ borderTop: "2px solid var(--dark-section-border)", color: "var(--dark-section-dim)" }}
        >
          <span>{copyright}</span>
          <a
            href="https://github.com/mohasinac"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              fontSize: "0.55rem",
              color: "transparent",
              opacity: 0.08,
              userSelect: "none",
              pointerEvents: "auto",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--dark-section-dim)";
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.08";
            }}
          >
            dev @mohasinac
          </a>
        </div>
      </div>
    </footer>
  );
}

