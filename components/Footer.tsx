import Link from "next/link";
import { Layers, Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-border/50 bg-[#080B10]/80 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-surface-border">
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="font-bold tracking-wider text-slate-200">NUVIO FRANCE</span>
            <p className="text-xs text-slate-500">Catalogue, Collections personnalisées & AIO Metadata</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <Link href="/collections" className="hover:text-indigo-400 transition-colors">
            Collections (756)
          </Link>
          <Link href="/aiometadata" className="hover:text-indigo-400 transition-colors">
            AIO Metadata
          </Link>
          <Link href="/addons" className="hover:text-indigo-400 transition-colors">
            Addons Recommandés
          </Link>
          <a
            href="https://imkaptain.github.io/Kaptain-Collection/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
          >
            <span>Inspiré de Kaptain</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right">
          <span>Configuré pour l&apos;écosystème Nuvio & Stremio en Français.</span>
        </div>
      </div>
    </footer>
  );
}
