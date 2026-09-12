"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Sparkles, Menu, X, BookOpen, Download } from "lucide-react";
import { useState } from "react";
import { NuvioConfiguratorModal } from "@/components/NuvioConfiguratorModal";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Tutoriel Nuvio", href: "/tutoriel" },
    { name: "Collections (756)", href: "/collections" },
    { name: "AIO Metadata", href: "/aiometadata" },
    { name: "Addons", href: "/addons" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-surface-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-glow group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-surface rounded-[11px] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  NUVIO
                </span>
                <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  FR
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-white bg-surface-elevated/90 border border-indigo-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-surface-hover/60"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Main Action Button */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setConfigModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-white shadow-glow hover:shadow-glow-lg transition-all duration-200 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assistant Nuvio</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover"
                aria-label="Ouvrir le menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-border/60 bg-surface/95 px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  pathname === link.href
                    ? "text-white bg-surface-elevated text-indigo-400"
                    : "text-slate-400 hover:text-white hover:bg-surface-hover"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setConfigModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 text-white shadow-glow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ouvrir l&apos;assistant Nuvio</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Configurator Modal */}
      <NuvioConfiguratorModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </>
  );
}
