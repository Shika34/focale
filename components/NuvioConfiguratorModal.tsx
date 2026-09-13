"use client";

import { useState, type ReactNode } from "react";
import {
  X,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Loader2,
  Tv,
  Mail,
  ArrowLeft,
  ArrowRight,
  Link2,
  UserPlus,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { NuvioApi } from "@/lib/nuvio-api";
import { buildLumioUrl } from "@/lib/manifest-urls";

interface NuvioConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewState = "form" | "installing" | "success";
type WizardStep = 1 | 2 | 3 | 4;

interface GuideStep {
  title: string;
  detail: string;
  bullets?: string[];
}

interface ProviderGuide {
  question: string;
  steps: GuideStep[];
  signupUrl: string;
  signupLabel: string;
  keyUrl: string;
  keyLabel: string;
  note: string;
}

const TORBOX_REFERRAL_LINK = "https://torbox.app/subscription?referral=49a51e6d-dcf6-47ad-a98d-147f11c4268f";

/** Tutoriels affichés dès que l'utilisateur n'a pas encore de compte ou de clé. */
const PROVIDER_GUIDES: Record<
  "tmdb" | "tvdb" | "mdblist" | "torbox" | "lumio",
  ProviderGuide
> = {
  tmdb: {
    question: "Avez-vous déjà un compte TMDB ?",
    steps: [
      {
        title: "Créer un compte TMDB",
        detail: "Ouvrez themoviedb.org et cliquez sur « S'inscrire ». C'est gratuit, et l'inscription se fait bien plus facilement depuis un ordinateur.",
      },
      {
        title: "Ouvrir vos paramètres",
        detail: "Une fois connecté, cliquez sur votre avatar en haut à droite, puis sur « Paramètres ».",
      },
      {
        title: "Demander une clé API",
        detail: "Dans le menu de gauche, cliquez sur « API », puis sur « Créer » et choisissez « Développeur ».",
      },
      {
        title: "Remplir le formulaire",
        detail: "Indiquez un usage personnel (par exemple « Nuvio — usage personnel »), acceptez les conditions puis validez le formulaire.",
      },
      {
        title: "Copier la clé v3",
        detail: "Copiez la valeur affichée à côté de « Clé API (v3 auth) » et collez-la dans le champ ci-dessous.",
      },
    ],
    signupUrl: "https://www.themoviedb.org/signup",
    signupLabel: "Créer mon compte TMDB",
    keyUrl: "https://www.themoviedb.org/settings/api",
    keyLabel: "Ouvrir la page des clés",
    note: "Fortement recommandée : sans clé TMDB, les affiches et les fiches de films peuvent être incomplètes dans Nuvio. La clé est validée immédiatement après la demande.",
  },
  tvdb: {
    question: "Avez-vous déjà un compte TheTVDB ?",
    steps: [
      {
        title: "Créer un compte TheTVDB",
        detail: "Sur thetvdb.com, cliquez sur « Register » en haut à droite. L'inscription est gratuite.",
      },
      {
        title: "Ouvrir le Dashboard",
        detail: "Dans le menu de votre profil (en haut à droite), cliquez sur « Dashboard ».",
      },
      {
        title: "Aller dans API Keys",
        detail: "Dans le menu de gauche, section « Account », cliquez sur « API Keys ».",
      },
      {
        title: "Créer une clé v4",
        detail: "Dans l'encadré « Developers », cliquez sur « Create a v4 API Key », puis renseignez le nom du projet (par exemple « Nuvio perso »), une description et vos coordonnées.",
      },
      {
        title: "Copier la clé",
        detail: "La clé v4 s'affiche dans votre dashboard : copiez-la et collez-la dans le champ ci-dessous.",
      },
    ],
    signupUrl: "https://thetvdb.com/auth/register",
    signupLabel: "Créer mon compte TheTVDB",
    keyUrl: "https://thetvdb.com/dashboard/account/apikeys",
    keyLabel: "Ouvrir mes clés API",
    note: "Une clé TheTVDB fraîchement créée peut rester « inactive » quelques heures avant validation. Vous pouvez continuer : en attendant, AIO Metadata utilise les données publiques, puis basculera sur votre clé dès son activation.",
  },
  mdblist: {
    question: "Avez-vous déjà un compte MDBList ?",
    steps: [
      {
        title: "Créer un compte MDBList",
        detail: "Sur mdblist.com, créez un compte gratuit (email, Google, GitHub ou Apple).",
      },
      {
        title: "Ouvrir vos préférences",
        detail: "Passez par le menu du site puis « Preferences », ou ouvrez directement mdblist.com/preferences/.",
      },
      {
        title: "Trouver la clé API",
        detail: "Descendez en bas de la page, à la rubrique « API Access » : votre clé s'y trouve. Si le champ est vide, cliquez sur le bouton pour la générer.",
      },
      {
        title: "Copier la clé",
        detail: "Copiez la clé et collez-la dans le champ ci-dessous.",
      },
    ],
    signupUrl: "https://mdblist.com/",
    signupLabel: "Créer mon compte MDBList",
    keyUrl: "https://mdblist.com/preferences/#api_key_uid",
    keyLabel: "Ouvrir mes préférences",
    note: "Clé facultative : vous pouvez créer votre configuration AIO Metadata sans elle, les notes TMDB resteront disponibles.",
  },
  torbox: {
    question: "Avez-vous déjà un compte TorBox ?",
    steps: [
      {
        title: "Créer un compte TorBox",
        detail: "Inscrivez-vous sur torbox.app via le lien de parrainage ci-dessous pour bénéficier des bonus de parrainage. Une formule payante est nécessaire : c'est elle qui donne accès à la clé API.",
      },
      {
        title: "Confirmer votre email",
        detail: "Validez l'email de confirmation, puis connectez-vous à votre compte TorBox.",
      },
      {
        title: "Ouvrir les réglages",
        detail: "Dans votre compte, ouvrez la page « Settings », puis la section « API ».",
      },
      {
        title: "Créer la clé API",
        detail: "Générez ou copiez votre clé API, puis collez-la dans le champ ci-dessous. Gardez-la privée : elle donne accès à votre quota.",
      },
    ],
    signupUrl: TORBOX_REFERRAL_LINK,
    signupLabel: "Créer mon compte TorBox (jours offerts)",
    keyUrl: "https://torbox.app/settings",
    keyLabel: "Ouvrir mes réglages TorBox",
    note: "Votre clé TorBox sert à débriter vos flux : elle génère automatiquement vos manifests Torrentio et Comet, et alimente aussi votre profil Lumio.",
  },
  lumio: {
    question: "Avez-vous déjà un compte Lumio et son URL de manifest ?",
    steps: [
      {
        title: "Créer un profil",
        detail: "Sur l'écran « À qui le tour ? », saisissez le nom de votre profil (ou sélectionnez-en un parmi les suggestions), puis cliquez sur Continuer.",
      },
      {
        title: "Sélectionner TorBox",
        detail: "Dans la section « Connectez votre débrideur », cliquez sur le logo TorBox.",
      },
      {
        title: "Associer votre compte TorBox",
        detail: "Choisissez votre méthode de connexion :",
        bullets: [
          "« Se connecter à TorBox » : valide directement la connexion depuis votre navigateur.",
          "« Saisir la clé » : collez la clé API récupérée sur votre compte TorBox (torbox.app/settings), puis cliquez sur Vérifier.",
        ],
      },
      {
        title: "Définir votre style de visionnage",
        detail: "Dans la section « Votre style de visionnage », sélectionnez la formule qui vous convient :",
        bullets: [
          "L'Essentiel : une liste épurée des 10 meilleures versions.",
          "Zen : lancement automatique de la meilleure option (expérience type Netflix).",
          "Cinéphile : qualité maximale sans compromis (4K REMUX, BluRay, HDR).",
          "Nomade : fichiers légers pour une connexion limitée.",
          "Mode Expert : réglage fin de la taille et des formats de fichiers.",
        ],
      },
      {
        title: "Ajuster l'affichage (facultatif)",
        detail: "Dans le panneau de droite « Affichage », choisissez la présentation des liens : Direct, Netflix, Compact ou Détaillé.",
      },
      {
        title: "Copier le lien du manifest",
        detail: "Une fois la configuration terminée, cliquez sur le bouton d'icône de copie (en bas à droite, à côté de « Enregistrer les modifications »), puis collez le lien obtenu dans le champ ci-dessous.",
      },
    ],
    signupUrl: "https://mylumio.tv",
    signupLabel: "Ouvrir Lumio",
    keyUrl: "https://mylumio.tv",
    keyLabel: "Configurer mon profil Lumio",
    note: "Votre lien de manifest est personnel : c'est lui qui active votre débrideur TorBox et vos préférences de langues dans Nuvio.",
  },

};

interface GuideFieldProps {
  label: string;
  description: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  guide: ProviderGuide;
  /** Champ masqué (clés API). */
  secret?: boolean;
  /** Contenu additionnel affiché sous le champ une fois la question répondue. */
  children?: ReactNode;
}

/** Question « Avez-vous déjà un compte ? » posée avant chaque champ. */
function AccountQuestion({
  question,
  onAnswer,
}: {
  question: string;
  onAnswer: (hasAccount: boolean) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-surface/70 border border-indigo-500/25 px-3.5 py-3">
      <span className="text-xs font-bold text-white flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>{question}</span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onAnswer(true)}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 transition-colors"
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => onAnswer(false)}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 transition-colors"
        >
          Non
        </button>
      </span>
    </div>
  );
}

/** Lien discret pour rouvrir un tutoriel même après avoir répondu « Oui ». */
function GuideToggle({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 rounded-lg px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 shrink-0"
    >
      <BookOpen className="w-3 h-3" />
      <span>{open ? "Masquer le tutoriel" : "Voir le tutoriel"}</span>
    </button>
  );
}

/** Lien direct vers la page de la clé API, sans passer par le tutoriel. */
function DirectKeyLink({ guide }: { guide: ProviderGuide }) {
  return (
    <a
      href={guide.keyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 rounded-lg px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 shrink-0"
    >
      <span>{guide.keyLabel}</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

/** Tutoriel pas à pas : création du compte puis récupération de la clé. */
function GuidePanel({
  guide,
  readyLabel,
  onReady,
}: {
  guide: ProviderGuide;
  readyLabel: string;
  onReady: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[#080B10]/80 border border-cyan-500/25 p-4 space-y-3.5">
      <span className="flex items-center gap-2 text-xs font-bold text-cyan-300">
        <BookOpen className="w-4 h-4" />
        <span>Tutoriel pas à pas</span>
      </span>

      <ol className="space-y-3">
        {guide.steps.map((item, index) => (
          <li key={item.title} className="flex gap-3">
            <span className="w-5 h-5 shrink-0 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 flex items-center justify-center">
              {index + 1}
            </span>
            <div className="text-xs leading-relaxed">
              <strong className="text-white">{item.title}</strong>
              <p className="text-slate-400 mt-0.5">{item.detail}</p>
              {item.bullets && (
                <ul className="mt-1.5 space-y-1">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="text-slate-400 flex gap-1.5">
                      <span className="text-cyan-400/80">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="text-[11px] text-slate-400 leading-relaxed border-t border-surface-border/60 pt-3">
        {guide.note}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={guide.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 transition-colors"
        >
          <span>{guide.signupLabel}</span>
          <UserPlus className="w-3 h-3" />
        </a>
        <a
          href={guide.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 transition-colors"
        >
          <span>{guide.keyLabel}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          type="button"
          onClick={onReady}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-white bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 transition-colors"
        >
          <span>{readyLabel}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

interface AioMetadataFieldProps {
  value: string;
  onChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onGenerate: () => Promise<string>;
}

/** Carte unique de configuration AIO Metadata : mot de passe, création, résultat. */
function AioMetadataField({
  value,
  onChange,
  password,
  onPasswordChange,
  onGenerate,
}: AioMetadataFieldProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [manual, setManual] = useState(false);
  const [copied, setCopied] = useState(false);
  const created = value.trim().length > 0;
  const passwordTooShort = password.trim().length < 6;

  const handleGenerate = async () => {
    setStatus("loading");
    setErrorMessage("");
    try {
      onChange(await onGenerate());
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "La création a échoué.");
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border/50 space-y-3">
      <div>
        <label className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <span>AIO Metadata</span>
        </label>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Catalogues, affiches et métadonnées FR, créés avec vos clés TMDB / TVDB / MDBList.
        </p>
      </div>

      <div className="space-y-2 p-4 rounded-2xl bg-indigo-950/25 border border-indigo-500/30">
        <label className="text-xs font-bold text-white flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Mot de passe de protection AIO Metadata</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="6 caractères minimum"
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Il protège votre configuration AIO Metadata et servira à la modifier plus
          tard : notez-le. C&apos;est un mot de passe différent de celui de votre
          compte Nuvio.
        </p>
      </div>

      {created ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Configuration prête : elle sera installée avec le profil Nuvio.</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 min-w-0 break-all text-[11px] text-slate-300 bg-surface px-3 py-2 rounded-xl border border-surface-border">
              {value}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(value).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 transition-colors"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-300 glass-panel border border-surface-border hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 transition-colors"
            >
              Recommencer
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={status === "loading" || passwordTooShort}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-white bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 transition-colors"
            >
              {status === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{status === "loading" ? "Création en cours..." : "Créer ma configuration AIO Metadata"}</span>
            </button>
            {!manual && (
              <button
                type="button"
                onClick={() => setManual(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 underline decoration-dotted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 rounded-lg px-1"
              >
                J&apos;ai déjà une configuration, saisir mon lien
              </button>
            )}
          </div>

          {passwordTooShort && (
            <p className="text-[11px] text-amber-300 leading-relaxed">
              Choisissez d&apos;abord un mot de passe de protection (6 caractères minimum) ci-dessus.
            </p>
          )}

          {manual && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://aiometadata.elfhosted.com/stremio/xxxxxxxx/manifest.json"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          )}
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="text-[11px] text-red-300 flex items-start gap-1.5 leading-relaxed">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
}

function GuideField({
  label,
  description,
  value,
  placeholder,
  onChange,
  guide,
  secret = false,
  children,
}: GuideFieldProps) {
  const [answer, setAnswer] = useState<"unset" | "yes" | "no">("unset");
  const [guideOpen, setGuideOpen] = useState(false);
  const showGuide = guideOpen || answer === "no";

  return (
    <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border/50 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>{label}</span>
          </label>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
        </div>
        {answer !== "unset" && (
          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            <GuideToggle open={guideOpen} onClick={() => setGuideOpen((current) => !current)} />
            {!showGuide && <DirectKeyLink guide={guide} />}
          </div>
        )}
      </div>

      {answer === "unset" && (
        <AccountQuestion
          question={guide.question}
          onAnswer={(hasAccount) => {
            setAnswer(hasAccount ? "yes" : "no");
            setGuideOpen(!hasAccount);
          }}
        />
      )}

      {showGuide && (
        <GuidePanel
          guide={guide}
          readyLabel={secret ? "J'ai ma clé, je la colle" : "J'ai mon lien, je le colle"}
          onReady={() => {
            setAnswer("yes");
            setGuideOpen(false);
          }}
        />
      )}

      {answer === "yes" && (
        <>
          <input
            type={secret ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          {children}
        </>
      )}
    </div>
  );
}

export function NuvioConfiguratorModal({ isOpen, onClose }: NuvioConfiguratorModalProps) {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [step, setStep] = useState<WizardStep>(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tmdbKey, setTmdbKey] = useState("");
  const [tvdbKey, setTvdbKey] = useState("");
  const [mdblistKey, setMdblistKey] = useState("");
  const [torboxKey, setTorboxKey] = useState("");
  const [protectionPassword, setProtectionPassword] = useState("");
  const [aioMetadataUrl, setAioMetadataUrl] = useState("");
  const [lumioManifestUrl, setLumioManifestUrl] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [progressState, setProgressState] = useState<{
    step: string;
    percent: number;
    details: string;
  }>({
    step: "Initialisation",
    percent: 0,
    details: "Préparation des collections...",
  });

  const [createdNewAccount, setCreatedNewAccount] = useState(false);
  const [lumioUrlCopied, setLumioUrlCopied] = useState(false);
  const [lumioManifestId, setLumioManifestId] = useState<string | null>(null);
  const [lumioVerificationStatus, setLumioVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const totalSteps = 4;

  /** Crée la configuration AIO Metadata côté serveur, avec les clés de l'étape 2. */
  const createAioMetadataConfig = async (): Promise<string> => {
    const res = await fetch("/api/aiometadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbApiKey: tmdbKey,
        tvdbApiKey: tvdbKey,
        mdblistApiKey: mdblistKey,
        password: protectionPassword,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.manifestUrl) {
      throw new Error(data?.error || "La création de la configuration AIO Metadata a échoué.");
    }
    return data.manifestUrl as string;
  };

  const registerLumioManifest = (customUrl: string): string => {
    // ✅ Pas de fetch ! Retourne l'URL Lumio directement après validation
    return buildLumioUrl(customUrl);
  };

  if (!isOpen) return null;

  const goToNextStep = () => {
    setErrorMessage("");

    if (step === 1 && (!email.trim() || !password.trim())) {
      setErrorMessage("Veuillez renseigner votre email et votre mot de passe Nuvio avant de continuer.");
      return;
    }

    if (step < totalSteps) {
      setStep((currentStep) => (currentStep + 1) as WizardStep);
    }
  };

  const goToPreviousStep = () => {
    setErrorMessage("");
    if (step > 1) {
      setStep((currentStep) => (currentStep - 1) as WizardStep);
    }
  };

  
  const handleSendToNuvio = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Veuillez renseigner votre email et votre mot de passe Nuvio.");
      setStep(1);
      return;
    }

    setErrorMessage("");
    setViewState("installing");

    try {
      setProgressState({
        step: "Connexion ou création du compte Nuvio",
        percent: 20,
        details: "Vérification sécurisée auprès de l'API officielle de Nuvio...",
      });

      const authRes = await NuvioApi.autoAuth(email, password);
      setCreatedNewAccount(authRes.isNewAccount);

      setProgressState({
        step: authRes.isNewAccount ? "Compte Nuvio créé" : "Connexion Nuvio réussie",
        percent: 40,
        details: "Préparation du profil dédié « Nuvio France FR »...",
      });

      const profiles = await NuvioApi.getProfiles(authRes.token);
      let targetProfile = profiles.find((p) => p.name.toLowerCase().includes("nuvio france"));

      if (!targetProfile) {
        targetProfile = await NuvioApi.createProfile(authRes.token, "Nuvio France FR");
      }

      setProgressState({
        step: "Préparation des addons personnalisés",
        percent: 60,
        details: "Préparation de votre configuration AIO Metadata et de vos addons...",
      });

      setProgressState({
        step: "Ajout des collections françaises",
        percent: 70,
        details: "Envoi des 18 collections et 756 dossiers francophones...",
      });

      const collRes = await fetch("/nuvio-collections-mitch.json");
      const fullCollections = await collRes.json();
      await NuvioApi.pushCollections(authRes.token, targetProfile.profile_index, fullCollections);

      setProgressState({
        step: "Installation des addons sélectionnés",
        percent: 82,
        details: "Installation de vos addons personnalisés, de Torrentio et Comet avec votre débrideur TorBox...",
      });

      const addons = NuvioApi.buildAddonsList(
        {
          tmdbApiKey: tmdbKey,
          tvdbApiKey: tvdbKey,
          mdblistApiKey: mdblistKey,
          torboxApiKey: torboxKey,
        },
        { aioMetadataUrl, lumioManifestUrl },
      );
      await NuvioApi.installAddons(authRes.token, targetProfile.profile_index, addons);

      setProgressState({
        step: "Configuration terminée",
        percent: 100,
        details: "Votre profil Nuvio est configuré et prêt à l'emploi.",
      });

      setTimeout(() => {
        setViewState("success");
      }, 900);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Une erreur est survenue lors de la configuration.");
      setViewState("form");
    }
  };

  const stepTitles: Record<WizardStep, string> = {
    1: "Compte Nuvio",
    2: "Clés API",
    3: "Addons",
    4: "Récapitulatif",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel bg-[#0e121d] max-w-2xl w-full rounded-3xl border border-indigo-500/40 shadow-glow-lg overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-5 sm:p-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Set Up & Send to Nuvio
              </h3>
              <p className="text-xs text-slate-400">
                Assistant guidé, clair et 100% en français
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
            aria-label="Fermer le configurateur"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {viewState === "form" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Étape {step} sur {totalSteps}
                  </span>
                  <span className="font-semibold text-indigo-300">
                    {stepTitles[step]}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-elevated border border-surface-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {([1, 2, 3, 4] as WizardStep[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => (item < step ? setStep(item) : undefined)}
                      className={`rounded-xl px-2 py-2 text-[11px] font-bold border transition-colors ${
                        item === step
                          ? "bg-indigo-500/20 border-indigo-400 text-white"
                          : item < step
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15"
                            : "bg-surface/60 border-surface-border text-slate-500"
                      }`}
                    >
                      {item}. {stepTitles[item]}
                    </button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {step === 1 && (
                <section className="space-y-5">
                  <div>
                    <h4 className="text-xl font-black text-white">
                      1. Connectez ou créez votre compte Nuvio
                    </h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      Entrez l&apos;email et le mot de passe que vous voulez utiliser
                      sur Nuvio. Si le compte n&apos;existe pas encore, il sera créé
                      automatiquement au moment de l&apos;envoi.
                    </p>
                  </div>

                  <div className="bg-indigo-950/25 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white block mb-0.5">
                        Vos identifiants restent côté Nuvio
                      </strong>
                      Ils sont utilisés uniquement pour appeler l&apos;API officielle{" "}
                      <code className="text-cyan-300">api.nuvio.tv</code>.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Email Nuvio</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="votre-email@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Mot de passe</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-5">
                  <div>
                    <h4 className="text-xl font-black text-white">
                      2. Ajoutez vos clés API
                    </h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      La clé API TorBox est indispensable pour regarder les films
                      et les séries : elle débrite vos flux et sert aussi à
                      configurer Lumio, Torrentio et Comet. Les clés de
                      métadonnées (TMDB, TheTVDB et MDBList) sont optionnelles :
                      elles enrichissent les affiches, les fiches et les
                      catalogues d&apos;AIO Metadata.
                    </p>
                  </div>

                  <GuideField
                    label="TorBox (obligatoire)"
                    description="Indispensable pour regarder les films et les séries : débrite vos flux via votre compte TorBox."
                    value={torboxKey}
                    placeholder="Collez votre clé API TorBox..."
                    guide={PROVIDER_GUIDES.torbox}
                    onChange={setTorboxKey}
                  />
                  <GuideField
                    label="TMDB (fortement recommandé)"
                    description="Affiches, résumés, notes et métadonnées de films en français."
                    value={tmdbKey}
                    placeholder="Collez votre clé API TMDB..."
                    guide={PROVIDER_GUIDES.tmdb}
                    onChange={setTmdbKey}
                  />
                  <GuideField
                    label="TVDB"
                    description="Métadonnées séries, saisons, épisodes et collections TV."
                    value={tvdbKey}
                    placeholder="Collez votre clé API TVDB..."
                    guide={PROVIDER_GUIDES.tvdb}
                    onChange={setTvdbKey}
                  />
                  <GuideField
                    label="MDBList (optionnel)"
                    description="Croise les notes IMDb, Rotten Tomatoes (critiques et public), Metacritic, Letterboxd, Trakt et TMDB sur une seule fiche."
                    value={mdblistKey}
                    placeholder="Collez votre clé API MDBList..."
                    guide={PROVIDER_GUIDES.mdblist}
                    onChange={setMdblistKey}
                  />

                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
                    <p>
                      <strong className="text-white">
                        Configuration automatique :
                      </strong>{" "}
                      votre clé TorBox personnalise Torrentio et Comet, et vos clés
                      TMDB, TheTVDB et MDBList sont injectées dans votre
                      configuration AIO Metadata lors de l&apos;envoi à Nuvio.
                    </p>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-5">
                  <div>
                    <h4 className="text-xl font-black text-white">
                      3. Vos addons personnalisés
                    </h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      L&apos;assistant crée votre configuration AIO Metadata à
                      votre place. Pour Lumio, la configuration se fait sur
                      mylumio.tv : vous copiez le lien de manifest de votre profil
                      et vous le collez ici.
                    </p>
                  </div>

                  <AioMetadataField
                    value={aioMetadataUrl}
                    onChange={setAioMetadataUrl}
                    password={protectionPassword}
                    onPasswordChange={setProtectionPassword}
                    onGenerate={createAioMetadataConfig}
                  />

                  <GuideField
                    label="Lumio"
                    description="Films et séries en français via votre profil Lumio (débrideur TorBox)."
                    value={lumioManifestUrl}
                    placeholder="https://mylumio.tv/xxxxxx/manifest.json"
                    guide={PROVIDER_GUIDES.lumio}
                    onChange={setLumioManifestUrl}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const resolvedUrl = registerLumioManifest(lumioManifestUrl);
                            setLumioManifestId(resolvedUrl || null);
                            setLumioVerificationStatus(resolvedUrl ? "verified" : "error");
                          }}
                          className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 transition-colors"
                        >
                          Vérifier mon lien Lumio
                        </button>
                        {lumioVerificationStatus === "verified" && lumioManifestId && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(lumioManifestId).then(() => {
                                setLumioUrlCopied(true);
                                setTimeout(() => setLumioUrlCopied(false), 2000);
                              });
                            }}
                            className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 transition-colors"
                          >
                            {lumioUrlCopied ? "Copié !" : "Copier le lien"}
                          </button>
                        )}
                      </div>
                      {lumioVerificationStatus === "verified" && lumioManifestId && (
                        <p className="text-[11px] text-emerald-300 break-all">
                          Lien Lumio validé : {lumioManifestId}
                        </p>
                      )}
                      {lumioVerificationStatus === "error" && (
                        <p className="text-[11px] text-red-300">
                          Lien invalide : collez l&apos;URL complète de votre profil Lumio (elle commence par https://).
                        </p>
                      )}
                    </div>
                  </GuideField>
                </section>
              )}

              {step === 4 && (
                <section className="space-y-5">
                  <div>
                    <h4 className="text-xl font-black text-white">
                      4. Vérifiez puis envoyez à Nuvio
                    </h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      Dernière vérification avant d&apos;ajouter les collections
                      françaises et les addons essentiels dans votre profil
                      Nuvio.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#080B10]/80 border border-surface-border/40 text-xs text-slate-400 space-y-2">
                    <strong className="text-white block font-semibold">
                      Ce qui sera envoyé :
                    </strong>
                    <div>
                      •{" "}
                      <span className="text-slate-300">
                        Collection complète
                      </span>{" "}
                      : 18 catégories et 756 dossiers francophones.
                    </div>
                    <div>
                      • <span className="text-slate-300">AIO Metadata</span> :{" "}
                      {aioMetadataUrl.trim()
                        ? "votre configuration (créée par l'assistant)"
                        : "instance publique, sans vos clés ni vos catalogues"}
                      .
                    </div>
                    <div>
                      • <span className="text-slate-300">Lumio</span> :{" "}
                      {lumioManifestUrl.trim()
                        ? "votre profil (lien fourni)"
                        : "non installé — aucun lien fourni"}
                      .
                    </div>
                    <div>
                      • <span className="text-slate-300">Addons</span> :
                      Cinemeta, OpenSubtitles v3, Torrentio (TorBox) et Comet
                      (TorBox).
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendToNuvio}
                    className="w-full py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-400 hover:to-purple-500 shadow-glow hover:shadow-glow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Envoyer à Nuvio</span>
                  </button>
                </section>
              )}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-surface-border/60">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={step === 1}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 glass-panel hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed border border-surface-border transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Précédent</span>
                </button>
                {step < totalSteps && (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition-colors"
                  >
                    <span>Suivant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {viewState === "installing" && (
            <div className="py-12 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-glow text-indigo-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-white">
                  {progressState.step}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5">
                  {progressState.details}
                </p>
              </div>

              <div className="max-w-md mx-auto w-full bg-surface-elevated h-3 rounded-full overflow-hidden border border-surface-border p-[1px]">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>

              <div className="text-xs text-slate-500">
                Envoi sécurisé vers Nuvio. Merci de patienter quelques
                secondes...
              </div>
            </div>
          )}

          {viewState === "success" && (
            <div className="py-8 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-glow">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-white">
                  {createdNewAccount
                    ? "Compte créé et configuré !"
                    : "Configuration envoyée !"}
                </h4>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  Votre profil Nuvio contient maintenant la collection complète,
                  les addons essentiels et votre configuration Lumio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-surface-border text-xs text-slate-300 text-left space-y-2.5 max-w-md mx-auto">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>Connexion sur votre téléviseur ou smartphone :</span>
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Téléchargez et ouvrez l&apos;application Nuvio.</li>
                  <li>
                    Connectez-vous avec :{" "}
                    <strong className="text-white">{email}</strong>.
                  </li>
                  <li>
                    Sélectionnez le profil{" "}
                    <strong className="text-emerald-400">
                      Nuvio France FR
                    </strong>
                    .
                  </li>
                  <li>Tout est prêt, bon visionnage !</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition-all"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
