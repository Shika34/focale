"use client";

import { useState, type ReactNode } from "react";
import {
  X,
  Aperture,
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
import { PROVIDER_GUIDES, type ProviderGuide } from "@/lib/provider-guides";

interface NuvioConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewState = "form" | "installing" | "success";
type WizardStep = 1 | 2 | 3 | 4;


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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-surface/70 border border-gold-500/25 px-3.5 py-3">
      <span className="text-xs font-bold text-mist-100 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-gold-400 shrink-0" />
        <span>{question}</span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onAnswer(true)}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sage-500/15 border border-sage-500/40 text-sage-300 hover:bg-sage-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400/70 transition-colors"
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => onAnswer(false)}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gold-500/15 border border-gold-500/40 text-gold-300 hover:bg-gold-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
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
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold-300 hover:text-gold-200 rounded-lg px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 shrink-0"
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
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sage-300 hover:text-sage-200 rounded-lg px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400/70 shrink-0"
    >
      <span>{guide.keyLabel}</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

/** Énumération française : « a », « a et b », « a, b et c ». */
function formatFrenchList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
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
    <div className="rounded-2xl bg-ink-900/80 border border-gold-500/25 p-4 space-y-3.5">
      <span className="flex items-center gap-2 text-xs font-bold text-gold-300">
        <BookOpen className="w-4 h-4" />
        <span>Tutoriel pas à pas</span>
      </span>

      <ol className="space-y-3">
        {guide.steps.map((item, index) => (
          <li key={item.title} className="flex gap-3">
            <span className="w-5 h-5 shrink-0 rounded-full bg-gold-500/15 border border-gold-500/30 text-[11px] font-bold text-gold-300 flex items-center justify-center">
              {index + 1}
            </span>
            <div className="text-xs leading-relaxed">
              <strong className="text-mist-100">{item.title}</strong>
              <p className="text-mist-400 mt-0.5">{item.detail}</p>
              {item.bullets && (
                <ul className="mt-1.5 space-y-1">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="text-mist-400 flex gap-1.5">
                      <span className="text-gold-400/80">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="text-[11px] text-mist-400 leading-relaxed border-t border-surface-border/60 pt-3">
        {guide.note}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={guide.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-sage-300 bg-sage-500/10 border border-sage-500/30 hover:bg-sage-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400/70 transition-colors"
        >
          <span>{guide.signupLabel}</span>
          <UserPlus className="w-3 h-3" />
        </a>
        <a
          href={guide.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
        >
          <span>{guide.keyLabel}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          type="button"
          onClick={onReady}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-mist-100 bg-gold-600 border border-gold-500 hover:bg-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
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
        <label className="text-sm font-bold text-mist-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-gold-400" />
          <span>AIO Metadata</span>
        </label>
        <p className="text-xs text-mist-400 mt-1 leading-relaxed">
          Catalogues, affiches et métadonnées FR, créés avec vos clés TMDB / TVDB / MDBList.
        </p>
      </div>

      <div className="space-y-2 p-4 rounded-2xl bg-gold-950/25 border border-gold-500/30">
        <label className="text-xs font-bold text-mist-100 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-gold-400" />
          <span>Mot de passe de protection AIO Metadata</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="6 caractères minimum"
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm placeholder-mist-500 focus:border-gold-500 focus:outline-none"
        />
        <p className="text-[11px] text-mist-400 leading-relaxed">
          Il protège votre configuration AIO Metadata et servira à la modifier plus
          tard : notez-le. C&apos;est un mot de passe différent de celui de votre
          compte Nuvio.
        </p>
      </div>

      {created ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-sage-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Configuration prête : elle sera installée avec le profil Nuvio.</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 min-w-0 break-all text-[11px] text-mist-300 bg-surface px-3 py-2 rounded-xl border border-surface-border">
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
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-mist-300 glass-panel border border-surface-border hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-400/70 transition-colors"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-mist-100 bg-gold-600 border border-gold-500 hover:bg-gold-500 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
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
                className="text-[11px] font-semibold text-mist-400 hover:text-mist-200 underline decoration-dotted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-400/70 rounded-lg px-1"
              >
                J&apos;ai déjà une configuration, saisir mon lien
              </button>
            )}
          </div>

          {passwordTooShort && (
            <p className="text-[11px] text-gold-300 leading-relaxed">
              Choisissez d&apos;abord un mot de passe de protection (6 caractères minimum) ci-dessus.
            </p>
          )}

          {manual && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://aiometadata.elfhosted.com/stremio/xxxxxxxx/manifest.json"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm placeholder-mist-500 focus:border-gold-500 focus:outline-none"
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
          <label className="text-sm font-bold text-mist-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-gold-400" />
            <span>{label}</span>
          </label>
          <p className="text-xs text-mist-400 mt-1 leading-relaxed">{description}</p>
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
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm placeholder-mist-500 focus:border-gold-500 focus:outline-none"
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
  /** Nom du profil Nuvio créé (et réutilisé s'il existe déjà) par l'assistant. */
  const [profileName, setProfileName] = useState("Nuvio France FR");
  const [targetProfileName, setTargetProfileName] = useState("Nuvio France FR");
  const [settingsNotice, setSettingsNotice] = useState("");
  /** Clés manquantes à l'étape 2, pour la demande de confirmation. */
  const [missingKeysWarning, setMissingKeysWarning] = useState<string[] | null>(null);
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

    if (step === 2) {
      const missing: string[] = [];
      if (!torboxKey.trim()) missing.push("TorBox");
      if (!tmdbKey.trim()) missing.push("TMDB");
      if (missing.length > 0) {
        setMissingKeysWarning(missing);
        return;
      }
    }

    setMissingKeysWarning(null);

    if (step < totalSteps) {
      setStep((currentStep) => (currentStep + 1) as WizardStep);
    }
  };

  const goToPreviousStep = () => {
    setErrorMessage("");
    setMissingKeysWarning(null);
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
        details: "Préparation du profil Nuvio de destination...",
      });

      const desiredName = profileName.trim() || "Nuvio France FR";
      const accountProfiles = await NuvioApi.getProfiles(authRes.token);
      let targetProfile = accountProfiles.find(
        (p) => p.name.trim().toLowerCase() === desiredName.toLowerCase(),
      );

      if (!targetProfile) {
        targetProfile = await NuvioApi.createProfile(authRes.token, desiredName);
      }

      setTargetProfileName(targetProfile.name);

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

      const noticeParts: string[] = [];

      // Nuvio Desktop n'utilise pas de clé TMDB intégrée : sans `tmdb_api_key`
      // propre au profil, ses catalogues TMDB (la majorité des collections)
      // restent vides, alors que les apps TV et mobile les affichent.
      try {
        const seededKeys = await NuvioApi.seedProviderCredentials(authRes.token, targetProfile.profile_index, {
          tmdbApiKey: tmdbKey,
          mdblistApiKey: mdblistKey,
          torboxApiKey: torboxKey,
        });
        if (seededKeys.pushed === 0) {
          noticeParts.push(
            "Aucune clé API n'était renseignée à l'étape 2 : sans clé TMDB dans le profil, Nuvio Desktop n'affichera pas les catalogues TMDB (l'application mobile et la TV utilisent une clé TMDB intégrée).",
          );
        } else if (seededKeys.verificationError) {
          noticeParts.push(
            `Clés envoyées dans le profil (${seededKeys.providers.join(", ")}), mais sans confirmation : la relecture a échoué (${seededKeys.verificationError}).`,
          );
        } else if (seededKeys.unverified.length > 0) {
          noticeParts.push(
            `Clés envoyées dans le profil (${seededKeys.providers.join(", ")}) mais non retrouvées après relecture : ${seededKeys.unverified.join(", ")}. Vérifiez « API keys and provider credentials » dans l'Account Manager.`,
          );
        }
      } catch (seedErr) {
        noticeParts.push(
          `Les clés de l'étape 2 n'ont pas pu être déposées dans le profil (${
            seedErr instanceof Error ? seedErr.message : "erreur inconnue"
          }). Nuvio Desktop en a besoin : saisissez-les dans Réglages → TMDB de l'application.`,
        );
      }

      setSettingsNotice(noticeParts.join(" "));

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

  /** Contenu réellement installé, pour un récapitulatif de fin exact. */
  const installedContents = [
    "la collection complète",
    "les addons essentiels",
    ...(aioMetadataUrl.trim() ? ["votre configuration AIO Metadata"] : []),
    ...(lumioManifestUrl.trim() ? ["votre profil Lumio"] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-card border border-line bg-ink-800 shadow-panel flex flex-col">
        <div className="p-5 sm:p-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Aperture className="h-6 w-6 text-gold-400" strokeWidth={1.6} />
            <div>
              <h3 className="display text-xl text-mist-100 sm:text-2xl">
                Configurer mon Nuvio
              </h3>
              <p className="text-xs text-mist-400">
                Assistant guidé · quatre étapes · tout en français
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-mist-400 hover:text-mist-100 hover:bg-surface-hover transition-colors"
            aria-label="Fermer le configurateur"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {viewState === "form" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-mist-400">
                  <span>
                    Étape {step} sur {totalSteps}
                  </span>
                  <span className="font-semibold text-gold-300">
                    {stepTitles[step]}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-elevated border border-surface-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold-400 transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-4">
                  {([1, 2, 3, 4] as WizardStep[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => (item < step ? setStep(item) : undefined)}
                      className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold border transition-colors sm:shrink sm:px-2 ${
                        item === step
                          ? "bg-gold-500/20 border-gold-400 text-mist-100"
                          : item < step
                            ? "bg-sage-500/10 border-sage-500/30 text-sage-300 hover:bg-sage-500/15"
                            : "bg-surface/60 border-surface-border text-mist-500"
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
                    <h4 className="display text-2xl text-mist-100">
                      1. Connectez ou créez votre compte Nuvio
                    </h4>
                    <p className="text-sm text-mist-400 mt-2 leading-relaxed">
                      Entrez l&apos;email et le mot de passe que vous voulez utiliser
                      sur Nuvio. Si le compte n&apos;existe pas encore, il sera créé
                      automatiquement au moment de l&apos;envoi.
                    </p>
                  </div>

                  <div className="bg-gold-950/25 border border-gold-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <Lock className="w-4 h-4 text-sage-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-mist-300 leading-relaxed">
                      <strong className="text-mist-100 block mb-0.5">
                        Vos identifiants restent côté Nuvio
                      </strong>
                      Ils sont utilisés uniquement pour appeler l&apos;API officielle{" "}
                      <code className="text-gold-300">api.nuvio.tv</code>.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-mist-100 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gold-400" />
                        <span>Email Nuvio</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="votre-email@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-mist-100 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-gold-400" />
                        <span>Mot de passe</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <label className="text-sm font-bold text-mist-100 flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-gold-400" />
                          <span>Nom du profil Nuvio à créer</span>
                        </label>
                        <p className="text-xs text-mist-400 mt-1 leading-relaxed">
                          L&apos;assistant crée ce profil sur votre compte Nuvio — ou le
                          réutilise s&apos;il porte déjà ce nom. Les clés de l&apos;étape 2 y
                          sont enregistrées.
                        </p>
                      </div>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        maxLength={30}
                        placeholder="Nuvio France FR"
                        aria-label="Nom du profil Nuvio à créer"
                        className="w-full sm:w-64 shrink-0 px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <p className="text-[11px] text-mist-500 leading-relaxed">
                      Ce nom est celui que vous retrouverez dans l&apos;application Nuvio,
                      une fois connecté.
                    </p>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-5">
                  <div>
                    <h4 className="display text-2xl text-mist-100">
                      2. Ajoutez vos clés API
                    </h4>
                    <p className="text-sm text-mist-400 mt-2 leading-relaxed">
                      La clé API TorBox est indispensable pour regarder les films
                      et les séries : elle débrite vos flux et sert aussi à
                      configurer Lumio, Torrentio et Comet. Les clés de
                      métadonnées (TMDB, TheTVDB et MDBList) enrichissent les
                      affiches, les fiches et les catalogues d&apos;AIO Metadata.
                      La clé TMDB est enregistrée dans votre profil : elle est
                      indispensable à l&apos;application Nuvio Desktop, qui
                      n&apos;en a pas d&apos;intégrée.
                    </p>
                  </div>

                  <GuideField
                    label="TorBox (obligatoire)"
                    description="Indispensable pour regarder les films et les séries : débrite vos flux via votre compte TorBox."
                    value={torboxKey}
                    placeholder="Collez votre clé API TorBox..."
                    guide={PROVIDER_GUIDES.torbox}
                    onChange={(value) => {
                      setTorboxKey(value);
                      setMissingKeysWarning(null);
                    }}
                  />
                  <GuideField
                    label="TMDB (fortement recommandé)"
                    description="Affiches, résumés, notes et métadonnées de films en français. Clé reprise dans le profil : indispensable à l'application Nuvio Desktop, qui n'a pas de clé TMDB intégrée."
                    value={tmdbKey}
                    placeholder="Collez votre clé API TMDB..."
                    guide={PROVIDER_GUIDES.tmdb}
                    onChange={(value) => {
                      setTmdbKey(value);
                      setMissingKeysWarning(null);
                    }}
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

                  <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-xs text-mist-300 leading-relaxed">
                    <p>
                      <strong className="text-mist-100">
                        Configuration automatique :
                      </strong>{" "}
                      votre clé TorBox personnalise Torrentio et Comet, et vos clés
                      TMDB, TheTVDB et MDBList sont injectées dans votre
                      configuration AIO Metadata lors de l&apos;envoi à Nuvio.
                    </p>
                  </div>

                  {missingKeysWarning && (
                    <div
                      role="alert"
                      className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/50 space-y-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-mist-200 leading-relaxed space-y-2">
                          <p className="font-bold text-mist-100">
                            Vous n&apos;avez pas renseigné{" "}
                            {missingKeysWarning.length > 1 ? "vos clés API" : "votre clé API"}{" "}
                            {formatFrenchList(missingKeysWarning)}. Voulez-vous
                            continuer ?
                          </p>
                          {missingKeysWarning.includes("TorBox") && (
                            <p>
                              Sans clé API TorBox, aucun flux vidéo ne se lancera :
                              c&apos;est elle qui débrite les liens trouvés par
                              Torrentio et Comet, et qui alimente votre profil
                              Lumio.
                            </p>
                          )}
                          {missingKeysWarning.includes("TMDB") && (
                            <p>
                              Sans clé API TMDB, les catalogues des collections
                              resteront vides dans l&apos;application Nuvio
                              Desktop, et les affiches comme les fiches seront
                              moins complètes sur mobile et TV.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setMissingKeysWarning(null)}
                          className="w-full sm:w-auto rounded-lg border border-surface-border bg-surface px-4 py-2 text-[11px] font-bold text-mist-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
                        >
                          Saisir ma clé
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMissingKeysWarning(null);
                            setStep((currentStep) => (currentStep + 1) as WizardStep);
                          }}
                          className="w-full sm:w-auto rounded-lg border border-gold-500/40 bg-gold-500/20 px-4 py-2 text-[11px] font-bold text-gold-200 hover:bg-gold-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
                        >
                          Continuer quand même
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {step === 3 && (
                <section className="space-y-5">
                  <div>
                    <h4 className="display text-2xl text-mist-100">
                      3. Vos addons personnalisés
                    </h4>
                    <p className="text-sm text-mist-400 mt-2 leading-relaxed">
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
                          className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-sage-300 bg-sage-500/10 border border-sage-500/30 hover:bg-sage-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400/70 transition-colors"
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
                            className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
                          >
                            {lumioUrlCopied ? "Copié !" : "Copier le lien"}
                          </button>
                        )}
                      </div>
                      {lumioVerificationStatus === "verified" && lumioManifestId && (
                        <p className="text-[11px] text-sage-300 break-all">
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
                    <h4 className="display text-2xl text-mist-100">
                      4. Vérifiez puis envoyez à Nuvio
                    </h4>
                    <p className="text-sm text-mist-400 mt-2 leading-relaxed">
                      Dernière vérification avant d&apos;ajouter les collections
                      françaises et les addons essentiels dans votre profil
                      Nuvio.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-ink-900/80 border border-surface-border/40 text-xs text-mist-400 space-y-2">
                    <strong className="text-mist-100 block font-semibold">
                      Ce qui sera envoyé :
                    </strong>
                    <div>
                      • <span className="text-mist-300">Profil créé</span> :{" "}
                      « {profileName.trim() || "Nuvio France FR"} » — réutilisé s&apos;il
                      existe déjà. Ses clés d&apos;API (TMDB, MDBList, TorBox) sont
                      reprises de l&apos;étape 2 : Nuvio Desktop en a besoin.
                    </div>
                    <div>
                      •{" "}
                      <span className="text-mist-300">
                        Collection complète
                      </span>{" "}
                      : 18 catégories et 756 dossiers francophones.
                    </div>
                    <div>
                      • <span className="text-mist-300">AIO Metadata</span> :{" "}
                      {aioMetadataUrl.trim()
                        ? "votre configuration (créée par l'assistant)"
                        : "instance publique, sans vos clés ni vos catalogues"}
                      .
                    </div>
                    <div>
                      • <span className="text-mist-300">Lumio</span> :{" "}
                      {lumioManifestUrl.trim()
                        ? "votre profil (lien fourni)"
                        : "non installé — aucun lien fourni"}
                      .
                    </div>
                    <div>
                      • <span className="text-mist-300">Addons</span> :
                      Cinemeta, OpenSubtitles v3, Torrentio (TorBox) et Comet
                      (TorBox).
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendToNuvio}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-mist-300 glass-panel hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed border border-surface-border transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Précédent</span>
                </button>
                {step < totalSteps && (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-mist-100 bg-gold-600 hover:bg-gold-500 shadow-glow transition-colors"
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
              <div className="w-16 h-16 rounded-2xl bg-gold-600/20 border border-gold-500/40 flex items-center justify-center mx-auto shadow-glow text-gold-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h4 className="display text-2xl text-mist-100">
                  {progressState.step}
                </h4>
                <p className="text-xs text-mist-400 mt-1.5">
                  {progressState.details}
                </p>
              </div>

              <div className="max-w-md mx-auto w-full bg-surface-elevated h-3 rounded-full overflow-hidden border border-surface-border p-[1px]">
                <div
                  className="h-full rounded-full bg-gold-400 transition-all duration-500"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>

              <div className="text-xs text-mist-500">
                Envoi sécurisé vers Nuvio. Merci de patienter quelques
                secondes...
              </div>
            </div>
          )}

          {viewState === "success" && (
            <div className="py-8 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-sage-500/20 border border-sage-500/40 flex items-center justify-center mx-auto text-sage-400 shadow-glow">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="display text-3xl text-mist-100">
                  {createdNewAccount
                    ? "Compte créé et configuré !"
                    : "Configuration envoyée !"}
                </h4>
                <p className="text-sm text-mist-300 mt-2 max-w-md mx-auto">
                  Votre profil Nuvio contient maintenant{" "}
                  {formatFrenchList(installedContents)}.
                </p>
                {settingsNotice && (
                  <p className="text-xs text-mist-400 mt-3 max-w-md mx-auto leading-relaxed">
                    {settingsNotice}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-surface-border text-xs text-mist-300 text-left space-y-2.5 max-w-md mx-auto">
                <span className="font-bold text-mist-100 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-gold-400" />
                  <span>Connexion sur votre téléviseur ou smartphone :</span>
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-mist-400">
                  <li>Téléchargez et ouvrez l&apos;application Nuvio.</li>
                  <li>
                    Connectez-vous avec :{" "}
                    <strong className="text-mist-100">{email}</strong>.
                  </li>
                  <li>
                    Sélectionnez le profil{" "}
                    <strong className="text-sage-400">{targetProfileName}</strong>.
                  </li>
                  <li>Tout est prêt, bon visionnage !</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-xl font-bold text-mist-100 bg-gold-600 hover:bg-gold-500 shadow-glow transition-all"
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
