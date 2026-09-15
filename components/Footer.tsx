import Link from "next/link";
import { Aperture } from "lucide-react";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Aperture className="h-5 w-5 text-gold-400" strokeWidth={1.6} />
              <span className="display text-[20px] leading-none text-mist-100">
                {SITE.wordmark}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mist-400">
              {SITE.tagline} — collections francophones, métadonnées en français
              et débridage TorBox, configurés depuis un seul assistant.
            </p>
          </div>

          <div className="flex gap-14">
            <div>
              <p className="eyebrow">Parcourir</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/" className="text-mist-300 transition-colors hover:text-gold-300">
                  Accueil
                </Link>
                <Link
                  href="/collections"
                  className="text-mist-300 transition-colors hover:text-gold-300"
                >
                  Collections
                </Link>
                <Link
                  href="/tutoriel"
                  className="text-mist-300 transition-colors hover:text-gold-300"
                >
                  Tutoriels
                </Link>
              </div>
            </div>

            <div>
              <p className="eyebrow">Services</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <a
                  href="https://torbox.app/subscription?referral=49a51e6d-dcf6-47ad-a98d-147f11c4268f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist-300 transition-colors hover:text-gold-300"
                >
                  TorBox
                </a>
                <a
                  href="https://alldebrid.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist-300 transition-colors hover:text-gold-300"
                >
                  AllDebrid
                </a>
                <a
                  href="https://mylumio.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist-300 transition-colors hover:text-gold-300"
                >
                  Lumio
                </a>
                <a
                  href="https://imkaptain.github.io/Kaptain-Collection/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist-300 transition-colors hover:text-gold-300"
                >
                  Inspiré de Kaptain
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-mist-500">
          {SITE.name} n&apos;héberge ni ne diffuse aucun contenu : la
          configuration s&apos;appuie sur vos propres comptes et services
          (Nuvio, TorBox ou AllDebrid, Lumio, AIO Metadata). Vos clés
          d&apos;API sont saisies dans votre navigateur, transmises aux seuls
          services concernés et conservées nulle part sur ce site.
        </p>
      </div>
    </footer>
  );
}
