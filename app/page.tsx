import Link from "next/link";
import Image from "next/image";
import { HeroSection } from "@/components/HeroSection";
import { TorboxPromoBanner } from "@/components/TorboxPromoBanner";
import { ArrowUpRight } from "lucide-react";

const SHOTS = [
  {
    src: "/images/Nuvio-capture1.webp",
    width: 1267,
    height: 671,
    title: "L'accueil de Nuvio",
    description:
      "Services de streaming, En vedette, Découvrir, Genres : les rangées créées par les collections de votre profil.",
    alt: "Accueil de Nuvio : barre latérale, rangées Services de streaming, En vedette, Découvrir et Genres.",
  },
  {
    src: "/images/Nuvio-capture2.webp",
    width: 1211,
    height: 579,
    title: "Vos collections",
    description:
      "Humeurs et ambiances, Basé sur, Collections de films : 18 collections et 756 dossiers, dossier par dossier.",
    alt: "Collections Nuvio : rangées Humeurs et ambiances, Basé sur et Collections de films.",
  },
];

const NUVIO_POINTS = [
  {
    title: "Un lecteur libre, pas un catalogue",
    body: "Nuvio est un lecteur multimédia gratuit et open source, développé par l'équipe NuvioMedia. Il ne diffuse rien lui-même : il affiche ce que vous lui branchez. Il s'installe sur votre télévision (Android TV, webOS, Tizen), sur votre téléphone (Android, iOS) et sur votre ordinateur, avec le même profil partout.",
  },
  {
    title: "Ce à quoi il sert",
    body: "Vous parcourez films et séries dans une interface habillée par TMDB — affiches, notes, bandes-annonces, sous-titres — puis vous lancez la lecture sans quitter l'application. Votre progression et votre liste de suivi vous suivent d'un écran à l'autre, comme le reste de vos réglages.",
  },
  {
    title: "Pourquoi ce choix",
    body: "Parce qu'il est ouvert et multi-plateformes, et parce qu'il accepte les addons Stremio, TorBox, Torrentio ou Comet sans rien imposer. Mais rien n'est préinstallé : sans addons configurés, Nuvio n'est qu'un catalogue vide. C'est précisément ce que Focale vient remplir, en français.",
  },
];

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

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Aperçu</p>
            <h2 className="display mt-3 text-2xl text-mist-100 sm:text-[32px]">
              Nuvio une fois configuré
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-mist-400">
            Deux captures d&apos;un profil configuré par l&apos;assistant :
            l&apos;accueil, puis les collections telles qu&apos;elles
            s&apos;empilent dans Nuvio.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {SHOTS.map((shot, index) => (
            <figure
              key={shot.src}
              className="overflow-hidden rounded-card border border-line bg-ink-800"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                sizes="(min-width: 1024px) 592px, 100vw"
                className="h-auto w-full border-b border-line"
              />
              <figcaption className="px-5 py-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-mist-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display text-lg text-mist-100">
                    {shot.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">
                  {shot.description}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-6xl px-5 sm:px-8">
        <TorboxPromoBanner />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Focale sur Nuvio</p>
            <h2 className="display mt-3 text-2xl text-mist-100 sm:text-[32px]">
              Nuvio, en deux minutes
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-mist-400">
            L&apos;assistant de Focale configure Nuvio. Voici ce
            que cette application est, et ce qu&apos;elle devient une fois vos
            addons en place.
          </p>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-3">
          {NUVIO_POINTS.map((point, index) => (
            <article key={point.title} className="bg-ink-800 p-6">
              <span className="font-mono text-[11px] text-mist-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="display mt-3 text-lg text-mist-100">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-400">
                {point.body}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-mist-500">
          Nuvio s&apos;installe gratuitement depuis nuvio.tv, sur téléviseur,
          box, smartphone ou navigateur ; le compte, lui, est créé par
          l&apos;assistant au moment de l&apos;envoi. Le{" "}
          <Link
            href="/tutoriel"
            className="text-mist-300 underline decoration-line underline-offset-4 transition-colors hover:text-gold-300"
          >
            premier tutoriel
          </Link>{" "}
          détaille l&apos;installation et la connexion écran par écran.
        </p>
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
