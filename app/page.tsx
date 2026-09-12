import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { TorboxPromoBanner } from "@/components/TorboxPromoBanner";
import { BookOpen, Database, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section with guided configurator trigger */}
      <HeroSection />

      {/* Torbox Featured Partner Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-16">
        <TorboxPromoBanner />
      </section>

      {/* Feature Navigation Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Tutoriel */}
          <Link
            href="/tutoriel"
            className="glass-card p-6 rounded-2xl group border border-surface-border hover:border-emerald-500/40 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-medium">
                Guide Pas-à-Pas
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              Tutoriel Nuvio & Débrideur
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Le guide complet inspiré de Valentin Boch adapté à Nuvio : clés API, offre Torbox et astuces TV.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Consulter le guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2: AIO Metadata */}
          <Link
            href="/aiometadata"
            className="glass-card p-6 rounded-2xl group border border-surface-border hover:border-cyan-500/40 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-medium">
                107 Catalogues
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              Configuration AIO Metadata
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Visualisez et exportez la configuration complète en français avec synchronisation Gemini Flash.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Voir la configuration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
