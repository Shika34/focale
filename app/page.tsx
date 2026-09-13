import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { TorboxPromoBanner } from "@/components/TorboxPromoBanner";
import { ArrowUpRight } from "lucide-react";

const SECTIONS = [
  {
    href: "/tutoriel",
    label: "Tutoriels",
    title: "Comptes, clés API, Lumio",
    description:
      "Six tutoriels courts pour créer vos comptes et récupérer chaque clé, dans l'ordre où l'assistant vous les demande.",
    meta: "6 tutoriels",
  },
  {
    href: "/collections",
    label: "Collections",
    title: "18 collections, 756 dossiers",
    description:
      "Le catalogue francophone complet, parcourable dossier par dossier avant de l'envoyer dans votre profil Nuvio.",
    meta: "756 dossiers",
  },
];

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <section className="mx-auto mb-20 max-w-6xl px-5 sm:px-8">
        <TorboxPromoBanner />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <p className="eyebrow">Explorer</p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-2">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col justify-between gap-6 bg-ink-800 p-6 transition-colors hover:bg-ink-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{section.label}</span>
                  <span className="font-mono text-[11px] text-mist-600">
                    {section.meta}
                  </span>
                </div>
                <h2 className="display mt-4 text-xl text-mist-100">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">
                  {section.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-mist-500 transition-colors group-hover:text-gold-300">
                Ouvrir
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
