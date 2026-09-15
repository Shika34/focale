import { ExternalLink, Gift, Info } from "lucide-react";

const SIGNUP_URL = "https://alldebrid.fr/register/";
const KEY_URL = "https://alldebrid.fr/apikeys/";

const PLANS = [
  { durée: "Essai gratuit 7 jours", prix: "0 €", note: "vérification SMS" },
  { durée: "30 jours, abonnement", prix: "2,99 €", note: "renouvelé chaque mois" },
  { durée: "30 jours, paiement unique", prix: "3,99 €" },
  { durée: "90 jours", prix: "8,99 €" },
  { durée: "180 jours", prix: "15,99 €" },
  { durée: "300 jours", prix: "24,99 €" },
];

export function AlldebridPromoBanner() {
  return (
    <div className="rounded-card border border-line bg-ink-800 p-6 sm:p-8">
      <div className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sage-500/25 bg-sage-500/10 px-3 py-1 text-xs font-medium text-sage-300">
            <Gift className="h-3.5 w-3.5" />
            <span>Débrideur français · paiement en euros</span>
          </div>
          <h3 className="display mt-3 text-2xl text-mist-100">AllDebrid</h3>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Lecture instantanée en 4K HDR, sans attente ni torrent local. Votre
            clé API AllDebrid débrite les flux trouvés par Torrentio et Comet, et
            alimente aussi votre profil Lumio.
          </p>
        </div>

        <a
          href={SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
        >
          <span>S&apos;inscrire sur AllDebrid</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-6 rounded-card border border-line bg-ink-700 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="eyebrow block">Votre clé API</span>
            <code className="mt-2 block break-all font-mono text-sm text-mist-100">
              alldebrid.fr/apikeys
            </code>
          </div>
          <a
            href={KEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-line bg-ink-600 px-3.5 py-2 text-xs font-medium text-mist-200 transition-colors hover:bg-ink-500"
          >
            <span>Ouvrir la page des clés</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-mist-400">
          Saisissez un nom pour reconnaître la clé (par exemple « Nuvio »), puis
          validez avec le bouton vert « Créer » : la clé s&apos;affiche en dessous.
          AllDebrid envoie généralement un email de sécurité pour autoriser cette
          nouvelle connexion — ouvrez-le si vous le recevez, puis collez la clé à
          l&apos;étape 2 du configurateur.
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <span className="eyebrow">Où votre clé est utilisée</span>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mist-400">
            <li className="flex gap-2">
              <span className="text-mist-600">—</span>
              <span>
                <strong className="font-medium text-mist-200">Torrentio</strong> :
                manifest personnalisé, filtre qualité, français prioritaire.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-mist-600">—</span>
              <span>
                <strong className="font-medium text-mist-200">Comet</strong> :
                manifest personnalisé, résultats en français.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-mist-600">—</span>
              <span>
                <strong className="font-medium text-mist-200">Lumio</strong> : la
                clé à coller dans votre profil Lumio, au moment de le configurer.
              </span>
            </li>
          </ul>
        </div>

        <div>
          <span className="eyebrow">Ordre de prix</span>
          <dl className="mt-3 divide-y divide-line">
            {PLANS.map((plan) => (
              <div
                key={plan.durée}
                className="flex items-baseline justify-between gap-3 py-2.5"
              >
                <dt className="text-sm text-mist-400">
                  {plan.durée}
                  {plan.note ? (
                    <span className="text-mist-500"> ({plan.note})</span>
                  ) : null}
                </dt>
                <dd className="font-mono text-sm text-mist-100">{plan.prix}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-mist-500">
            Tarifs affichés par AllDebrid sur sa page d&apos;offres.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-line bg-ink-700 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
        <p className="text-xs leading-relaxed text-mist-300">
          AllDebrid n&apos;est pas intégré nativement à Nuvio : les services
          connectés de l&apos;application ne connaissent que TorBox et Premiumize.
          Avec AllDebrid, ce sont Torrentio et Comet qui débrident — l&apos;assistant
          les configure pour vous, et le résultat est le même à l&apos;écran. Aucun
          lien d&apos;affiliation : cette section existe parce que l&apos;assistant
          accepte aussi AllDebrid.
        </p>
      </div>
    </div>
  );
}
