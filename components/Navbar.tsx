"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Aperture, Menu, X } from "lucide-react";
import { useState } from "react";
import { NuvioConfiguratorModal } from "@/components/NuvioConfiguratorModal";
import { SITE } from "@/lib/site";

const NAV_LINKS = [
  { name: "Accueil", href: "/" },
  { name: "Collections", href: "/collections", hint: "756" },
  { name: "Tutoriels", href: "/tutoriel" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              <Aperture
                className="h-5 w-5 text-gold-400 transition-transform duration-500 group-hover:rotate-45"
                strokeWidth={1.6}
              />
              <span className="display text-[22px] leading-none tracking-wide text-mist-100">
                {SITE.wordmark}
              </span>
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 text-sm transition-colors ${
                    isActive(link.href)
                      ? "text-mist-100"
                      : "text-mist-400 hover:text-mist-100"
                  }`}
                >
                  {link.name}
                  {link.hint ? (
                    <span className="ml-1.5 font-mono text-[11px] text-mist-500">
                      {link.hint}
                    </span>
                  ) : null}
                  {isActive(link.href) ? (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-px bg-gold-400" />
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex">
              <button
                onClick={() => setConfigModalOpen(true)}
                className="rounded-lg bg-gold-400 px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-gold-300"
              >
                Configurer mon Nuvio
              </button>
            </div>

            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-mist-300 hover:text-mist-100"
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-line bg-ink px-5 pb-5 pt-3 md:hidden">
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`border-b border-line/60 py-3 text-sm ${
                    isActive(link.href) ? "text-gold-300" : "text-mist-300"
                  }`}
                >
                  {link.name}
                  {link.hint ? (
                    <span className="ml-1.5 font-mono text-[11px] text-mist-500">{link.hint}</span>
                  ) : null}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setConfigModalOpen(true);
              }}
              className="mt-4 w-full rounded-lg bg-gold-400 px-4 py-3 text-sm font-semibold text-ink"
            >
              Configurer mon Nuvio
            </button>
          </div>
        )}
      </header>

      <NuvioConfiguratorModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </>
  );
}
