"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
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
  UserPlus,
  BookOpen,
  HelpCircle,
  Star,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { NuvioApi, authErrorMessage, profileTargetIssue } from "@/lib/nuvio-api";
import { buildLumioUrl } from "@/lib/manifest-urls";
import { spotlightArtVersion, versionSpotlightArt } from "@/lib/spotlight-art";
import { checkAlldebridKey, type DebridKeyCheck } from "@/lib/debrid-key-test";
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
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sage-500/15 border border-sage-500/40 text-sage-300 hover:bg-sage-500/25 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sage-400/70 transition-colors"
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => onAnswer(false)}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gold-500/15 border border-gold-500/40 text-gold-300 hover:bg-gold-500/25 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
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
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold-300 hover:text-gold-200 rounded-lg px-1.5 py-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 shrink-0"
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
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sage-300 hover:text-sage-200 rounded-lg px-1.5 py-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sage-400/70 shrink-0"
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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-sage-300 bg-sage-500/10 border border-sage-500/30 hover:bg-sage-500/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sage-400/70 transition-colors"
        >
          <span>{guide.signupLabel}</span>
          <UserPlus className="w-3 h-3" />
        </a>
        <a
          href={guide.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
        >
          <span>{guide.keyLabel}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          type="button"
          onClick={onReady}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-mist-100 bg-gold-600 border border-gold-500 hover:bg-gold-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
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
          Choisissez un mot de passe de protection, puis cliquez sur « Créer ma
          configuration AIO Metadata » : elle est créée avec les clés saisies à
          l&apos;étape 2.
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
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm placeholder-mist-500 focus:border-gold-500 focus:outline-hidden"
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
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-mist-300 glass-panel border border-surface-border hover:bg-surface-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-mist-400/70 transition-colors"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-mist-100 bg-gold-600 border border-gold-500 hover:bg-gold-500 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
            >
              {status === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{status === "loading" ? "Création en cours…" : "Créer ma configuration AIO Metadata"}</span>
            </button>
            {!manual && (
              <button
                type="button"
                onClick={() => setManual(true)}
                className="text-[11px] font-semibold text-mist-400 hover:text-mist-200 underline decoration-dotted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-mist-400/70 rounded-lg px-1"
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
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm placeholder-mist-500 focus:border-gold-500 focus:outline-hidden"
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
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm placeholder-mist-500 focus:border-gold-500 focus:outline-hidden"
          />
          {children}
        </>
      )}
    </div>
  );
}

interface AddonToggleProps {
  name: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Clé manquante à l'étape 2 : l'addon ne peut pas être généré. */
  blockedReason?: string;
}

/** Addon du pack français configuré automatiquement par l'assistant. */
function AddonToggle({
  name,
  description,
  checked,
  onChange,
  blockedReason,
}: AddonToggleProps) {
  const disabled = Boolean(blockedReason);

  return (
    <label
      className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
        disabled
          ? "border-surface-border/40 bg-surface/40"
          : "border-surface-border/60 bg-surface/60 hover:border-gold-500/40 cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={!disabled && checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-gold-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70"
      />
      <span className="space-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={`text-sm font-bold ${disabled ? "text-mist-400" : "text-mist-100"}`}
          >
            {name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-sage-300 bg-sage-500/10 border border-sage-500/30 rounded-full px-2 py-0.5">
            Configuration automatique
          </span>
        </span>
        <span className="block text-[11px] leading-relaxed text-mist-400">
          {description}
        </span>
        {blockedReason && (
          <span className="block text-[11px] leading-relaxed text-gold-300">
            {blockedReason}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * Test d'une clé AllDebrid, affiché sous le champ de saisie.
 *
 * Le test part du navigateur de l'utilisateur (voir `checkAlldebridKey`) : il
 * valide la clé et, si AllDebrid refuse à cause de l'IP ou du pays, le dit en
 * français au lieu de laisser l'utilisateur découvrir le problème dans Nuvio.
 */
function AlldebridKeyTest({ apiKey }: { apiKey: string }) {
  const [tested, setTested] = useState<{ key: string; check: DebridKeyCheck } | null>(null);
  const [testing, setTesting] = useState(false);
  const key = apiKey.trim();

  // Un verdict ne vaut que pour la clé testée : la modifier le retire.
  const check = tested?.key === key ? tested.check : null;

  if (!key) {
    return null;
  }

  const run = async () => {
    setTesting(true);
    setTested({ key, check: await checkAlldebridKey(key) });
    setTesting(false);
  };

  const resultColor =
    check?.status === "valid"
      ? "text-sage-300"
      : check?.status === "invalid"
        ? "text-red-300"
        : "text-gold-300";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={testing}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-4 py-2 text-[11px] font-bold text-mist-200 hover:bg-surface-hover disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
      >
        {testing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
        )}
        {testing ? "Vérification…" : "Tester ma clé AllDebrid"}
      </button>
      <p className="text-[11px] text-mist-500 leading-relaxed">
        Le test part de votre navigateur : il vérifie la clé et que votre connexion
        n&apos;est pas bloquée par AllDebrid. Votre clé n&apos;est envoyée qu&apos;à
        AllDebrid.
      </p>
      {check && (
        <p
          role="status"
          className={`text-[11px] leading-relaxed flex items-start gap-1.5 ${resultColor}`}
        >
          {check.status === "valid" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          )}
          <span>{check.message}</span>
        </p>
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
  const [alldebridKey, setAlldebridKey] = useState("");
  const [protectionPassword, setProtectionPassword] = useState("");
  const [aioMetadataUrl, setAioMetadataUrl] = useState("");
  const [lumioManifestUrl, setLumioManifestUrl] = useState("");
  const [streamFusionManifestUrl, setStreamFusionManifestUrl] = useState("");
  /** Addons français configurés automatiquement, activés par défaut. */
  const [includeLoostream, setIncludeLoostream] = useState(true);
  const [includeFrenchio, setIncludeFrenchio] = useState(true);
  const [includeUwuFr, setIncludeUwuFr] = useState(false);
  const [includeVfTrailer, setIncludeVfTrailer] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [progressState, setProgressState] = useState<{
    step: string;
    percent: number;
    details: string;
  }>({
    step: "Initialisation",
    percent: 0,
    details: "Préparation des collections…",
  });

  const [createdNewAccount, setCreatedNewAccount] = useState(false);
  /** Vérification du compte Nuvio en cours (bouton « Suivant » de l'étape 1). */
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  /** Garde synchrone contre les doubles clics sur « Suivant ». */
  const verifyingAccountRef = useRef(false);
  /**
   * Session Nuvio validée à l'étape 1 : le mot de passe saisi a été accepté par
   * l'API. Conservée avec l'email et le mot de passe testés, afin d'être
   * réutilisée à l'envoi tant que l'utilisateur ne modifie pas ses identifiants.
   */
  const [verifiedAuth, setVerifiedAuth] = useState<{
    token: string;
    userId: string;
    isNewAccount: boolean;
    email: string;
    password: string;
  } | null>(null);
  /** Nom du profil Nuvio créé (et réutilisé s'il existe déjà) par l'assistant. */
  const [profileName, setProfileName] = useState("FOCALE");
  const [targetProfileName, setTargetProfileName] = useState("FOCALE");
  const [settingsNotice, setSettingsNotice] = useState("");
  /** Informations manquantes à l'étape 2, pour la demande de confirmation. */
  const [missingKeysWarning, setMissingKeysWarning] = useState<{
    debrid: boolean;
    tmdb: boolean;
  } | null>(null);
  const [lumioUrlCopied, setLumioUrlCopied] = useState(false);
  const [lumioManifestId, setLumioManifestId] = useState<string | null>(null);
  const [lumioVerificationStatus, setLumioVerificationStatus] = useState<'idle' | 'verified' | 'error'>('idle');
  const totalSteps = 4;

  // Fermeture au clavier (Échap) et blocage du défilement de la page derrière.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

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

  /**
   * Vérifie le compte Nuvio auprès de l'API officielle : connexion si le compte
   * existe, création avec le mot de passe saisi sinon (messages d'erreur en
   * français affichés dans le bandeau de l'assistant).
   *
   * La vérification porte aussi sur le profil de destination : Nuvio n'accepte
   * que six profils, donc un compte plein et un nom inconnu sont annoncés ici,
   * avant les étapes 2 à 4. Un tirage de profils en échec ne bloque pas la
   * suite : la garde de l'envoi (`profileTargetIssue` dans `createProfile`)
   * reste en place.
   */
  const verifyNuvioAccount = async (): Promise<boolean> => {
    // Garde synchrone : un double clic ne doit pas déclencher deux appels
    // d'authentification (l'état React n'est pas encore relu dans ce tour).
    if (verifyingAccountRef.current) return false;
    verifyingAccountRef.current = true;
    const cleanEmail = email.trim();
    setVerifyingAccount(true);
    try {
      const auth = await NuvioApi.autoAuth(cleanEmail, password);
      const profiles = await NuvioApi.getProfiles(auth.token).catch(() => null);
      const issue = profiles ? profileTargetIssue(profiles, profileName) : null;
      if (issue) {
        setVerifiedAuth(null);
        setErrorMessage(issue);
        return false;
      }
      setVerifiedAuth({ ...auth, email: cleanEmail, password });
      return true;
    } catch (err) {
      setVerifiedAuth(null);
      setErrorMessage(authErrorMessage(err));
      return false;
    } finally {
      verifyingAccountRef.current = false;
      setVerifyingAccount(false);
    }
  };

  /** Session Nuvio déjà validée pour les identifiants actuellement saisis. */
  const currentVerifiedAuth =
    verifiedAuth && verifiedAuth.email === email.trim() && verifiedAuth.password === password
      ? verifiedAuth
      : null;

  const goToNextStep = async () => {
    setErrorMessage("");

    if (step === 1 && (!email.trim() || !password.trim())) {
      setErrorMessage("Veuillez renseigner votre email et votre mot de passe Nuvio avant de continuer.");
      return;
    }

    if (step === 1 && !currentVerifiedAuth) {
      // Aucun passage à l'étape 2 sans mot de passe confirmé par Nuvio.
      if (!(await verifyNuvioAccount())) return;
    }

    if (step === 2) {
      // Un seul débrideur suffit : TorBox ou AllDebrid.
      const missing = {
        debrid: !torboxKey.trim() && !alldebridKey.trim(),
        tmdb: !tmdbKey.trim(),
      };
      if (missing.debrid || missing.tmdb) {
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
        details: "Vérification sécurisée auprès de l'API officielle de Nuvio…",
      });

      // Le compte a déjà été vérifié à l'étape 1 : sa session est réutilisée
      // tant que l'email et le mot de passe n'ont pas changé.
      const authRes = currentVerifiedAuth ?? (await NuvioApi.autoAuth(email, password));
      setCreatedNewAccount(authRes.isNewAccount);

      setProgressState({
        step: authRes.isNewAccount ? "Compte Nuvio créé" : "Connexion Nuvio réussie",
        percent: 40,
        details: "Préparation du profil Nuvio de destination…",
      });

      const desiredName = profileName.trim() || "FOCALE";
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
        details: "Préparation de votre configuration AIO Metadata et de vos addons…",
      });

      setProgressState({
        step: "Ajout des collections françaises",
        percent: 70,
        details: "Envoi des 18 collections et 756 dossiers francophones…",
      });

      const collRes = await fetch("/nuvio-collections-fr.json");
      const fullCollections = await collRes.json();
      // Les visuels « En vedette » de Kaptain sont remplacés sur place tous les
      // quatorze jours : une version par cycle évite que Nuvio resserve l'ancienne
      // affiche depuis son cache d'images.
      await NuvioApi.pushCollections(
        authRes.token,
        targetProfile.profile_index,
        versionSpotlightArt(fullCollections, spotlightArtVersion()),
      );

      setProgressState({
        step: "Installation des addons sélectionnés",
        percent: 82,
        details: "Installation de vos addons personnalisés, de Torrentio et Comet avec votre débrideur…",
      });

      const addons = NuvioApi.buildAddonsList(
        {
          tmdbApiKey: tmdbKey,
          tvdbApiKey: tvdbKey,
          mdblistApiKey: mdblistKey,
          torboxApiKey: torboxKey,
          alldebridApiKey: alldebridKey,
        },
        {
          aioMetadataUrl,
          lumioManifestUrl,
          streamFusionManifestUrl,
          profileName: profileName.trim() || "FOCALE",
          loostream: includeLoostream,
          frenchio: includeFrenchio,
          uwuFr: includeUwuFr,
          vfTrailer: includeVfTrailer,
        },
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
            "Aucune clé de métadonnées ni clé TorBox n'a été déposée dans ce profil : sans clé TMDB, Nuvio Desktop n'affichera pas les catalogues TMDB (l'application mobile et la TV utilisent une clé TMDB intégrée).",
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
        step: "Réglages du profil",
        percent: 92,
        details:
          "Français par défaut : métadonnées, sous-titres forcés et piste audio, notes MDBList activées (téléviseur, mobile, ordinateur)…",
      });

      // Les clients Nuvio démarrent en anglais, sans préférence de langue et sans
      // notes externes : on règle le profil pour les trois plateformes avant de
      // rendre la main.
      try {
        const profileDefaults = await NuvioApi.applyProfileDefaults(
          authRes.token,
          targetProfile.profile_index,
        );
        if (profileDefaults.errors.length > 0) {
          noticeParts.push(
            `Les réglages du profil n'ont pas pu être posés sur ${formatFrenchList(
              profileDefaults.errors,
            )}. Réglez-les dans l'application : Réglages → Intégrations → TMDB Enrichment → Language, Réglages → Lecture → Sous-titres, et Réglages → Intégrations → MDBList.`,
          );
        }
        if (profileDefaults.unverified.length > 0) {
          noticeParts.push(
            `Réglages envoyés mais non confirmés sur ${formatFrenchList(
              profileDefaults.unverified,
            )}. Vérifiez-les dans l'application : Réglages → Lecture (langue des sous-titres et mode forcé), TMDB Enrichment → Language, et MDBList Ratings.`,
          );
        }
        setSettingsNotice(noticeParts.join(" "));
      } catch (languageErr) {
        noticeParts.push(
          `Les réglages du profil n'ont pas pu être posés (${
            languageErr instanceof Error ? languageErr.message : "erreur inconnue"
          }). Réglez-les dans l'application : Réglages → Lecture pour les sous-titres, Intégrations → TMDB Enrichment → Language pour les métadonnées, Intégrations → MDBList pour les notes.`,
        );
        setSettingsNotice(noticeParts.join(" "));
      }

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

  /** Clés dont dépendent les addons générés automatiquement. */
  const hasDebridKey = Boolean(torboxKey.trim() || alldebridKey.trim());
  const hasTmdbKey = Boolean(tmdbKey.trim());

  /** Addons français retenus, pour un récapitulatif et un écran de fin exacts. */
  const frenchAddons = [
    ...(includeLoostream && hasTmdbKey ? ["Loostream"] : []),
    ...(includeVfTrailer && hasTmdbKey ? ["VF Trailer"] : []),
    ...(includeFrenchio && hasDebridKey && hasTmdbKey ? ["Frenchio"] : []),
    ...(includeUwuFr && hasDebridKey && hasTmdbKey ? ["UwU-FR"] : []),
    ...(streamFusionManifestUrl.trim() ? ["StreamFusion"] : []),
  ];

  /** Contenu réellement installé, pour un récapitulatif de fin exact. */
  const installedContents = [
    "la collection complète",
    "les addons essentiels",
    ...(aioMetadataUrl.trim() ? ["votre configuration AIO Metadata"] : []),
    ...(lumioManifestUrl.trim() ? ["votre profil Lumio"] : []),
    ...(frenchAddons.length > 0
      ? [`les addons français (${formatFrenchList(frenchAddons)})`]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="configurateur-nuvio-titre"
        className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-card border border-line bg-ink-800 shadow-panel flex flex-col"
      >
        <div className="p-5 sm:p-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Aperture className="h-6 w-6 text-gold-400" strokeWidth={1.6} />
            <div>
              <h3
                id="configurateur-nuvio-titre"
                className="display text-xl text-mist-100 sm:text-2xl"
              >
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
                      Entrez l&apos;email et le mot de passe que vous utilisez (ou voulez
                      utiliser) sur Nuvio. La vérification se fait dès « Suivant » :
                      si le compte existe, le mot de passe est contrôlé ; s&apos;il
                      n&apos;existe pas encore, il est créé avec ce mot de passe.
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {currentVerifiedAuth && (
                    <p className="flex items-start gap-2 text-xs text-sage-400 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        {currentVerifiedAuth.isNewAccount
                          ? "Compte Nuvio créé : ce mot de passe est désormais celui de votre compte."
                          : "Compte Nuvio vérifié : ce mot de passe correspond bien à ce compte."}
                      </span>
                    </p>
                  )}

                  <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <label className="text-sm font-bold text-mist-100 flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-gold-400" />
                          <span>Nom du profil Nuvio à créer</span>
                        </label>
                        <p className="text-xs text-mist-400 mt-1 leading-relaxed">
                          L&apos;assistant crée ce profil sur votre compte Nuvio, ou le
                          réutilise s&apos;il porte déjà ce nom. Les clés de l&apos;étape 2 y
                          sont enregistrées.
                        </p>
                      </div>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        maxLength={30}
                        placeholder="FOCALE"
                        aria-label="Nom du profil Nuvio à créer"
                        className="w-full sm:w-64 shrink-0 px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden"
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
                      Il vous faut au moins une clé de débrideur (TorBox ou
                      AllDebrid, les deux si vous avez les deux comptes) : elle
                      débrite vos flux et sert aussi à configurer Lumio,
                      Torrentio et Comet. Les clés de
                      métadonnées (TMDB, TheTVDB et MDBList) enrichissent les
                      affiches, les fiches et les catalogues d&apos;AIO Metadata.
                      La clé TMDB est enregistrée dans votre profil : elle est
                      indispensable à l&apos;application Nuvio Desktop, qui
                      n&apos;en a pas d&apos;intégrée.
                    </p>
                  </div>

                  <GuideField
                    label="TorBox"
                    description="Débrite vos flux via votre compte TorBox. Nuvio l'intègre nativement, et le parrainage offre jusqu'à 84 jours."
                    value={torboxKey}
                    placeholder="Collez votre clé API TorBox…"
                    guide={PROVIDER_GUIDES.torbox}
                    secret
                    onChange={(value) => {
                      setTorboxKey(value);
                      setMissingKeysWarning(null);
                    }}
                  />
                  <GuideField
                    label="AllDebrid"
                    description="Votre clé AllDebrid alimente Torrentio, Comet et votre profil Lumio, exactement comme celle de TorBox. Vous pouvez renseigner les deux débrideurs si vous avez les deux comptes."
                    value={alldebridKey}
                    placeholder="Collez votre clé API AllDebrid…"
                    guide={PROVIDER_GUIDES.alldebrid}
                    secret
                    onChange={(value) => {
                      setAlldebridKey(value);
                      setMissingKeysWarning(null);
                    }}
                  >
                    <AlldebridKeyTest apiKey={alldebridKey} />
                  </GuideField>
                  <GuideField
                    label="TMDB (fortement recommandé)"
                    description="Affiches, résumés, notes et métadonnées de films en français. Clé reprise dans le profil : indispensable à l'application Nuvio Desktop, qui n'a pas de clé TMDB intégrée."
                    value={tmdbKey}
                    placeholder="Collez votre clé API TMDB…"
                    guide={PROVIDER_GUIDES.tmdb}
                    secret
                    onChange={(value) => {
                      setTmdbKey(value);
                      setMissingKeysWarning(null);
                    }}
                  />
                  <GuideField
                    label="TVDB"
                    description="Métadonnées séries, saisons, épisodes et collections TV."
                    value={tvdbKey}
                    placeholder="Collez votre clé API TVDB…"
                    guide={PROVIDER_GUIDES.tvdb}
                    secret
                    onChange={setTvdbKey}
                  />
                  <GuideField
                    label="MDBList (optionnel)"
                    description="Croise les notes IMDb, Rotten Tomatoes (critiques et public), Metacritic, Letterboxd, Trakt et TMDB sur une seule fiche."
                    value={mdblistKey}
                    placeholder="Collez votre clé API MDBList…"
                    guide={PROVIDER_GUIDES.mdblist}
                    secret
                    onChange={setMdblistKey}
                  />

                  <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-xs text-mist-300 leading-relaxed">
                    <p>
                      <strong className="text-mist-100">
                        Configuration automatique :
                      </strong>{" "}
                      votre clé de débrideur personnalise Torrentio et Comet, et
                      vos clés TMDB, TheTVDB et MDBList sont injectées dans votre
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
                            {missingKeysWarning.debrid && missingKeysWarning.tmdb
                              ? "Vous n'avez renseigné ni clé de débrideur, ni clé TMDB. Voulez-vous continuer ?"
                              : missingKeysWarning.debrid
                                ? "Vous n'avez renseigné aucune clé de débrideur. Voulez-vous continuer ?"
                                : "Vous n'avez pas renseigné votre clé API TMDB. Voulez-vous continuer ?"}
                          </p>
                          {missingKeysWarning.debrid && (
                            <p>
                              Sans clé de débrideur (TorBox ou AllDebrid), aucun
                              flux vidéo ne se lancera : c&apos;est elle qui
                              débrite les liens trouvés par Torrentio et Comet,
                              et qui alimente votre profil Lumio.
                            </p>
                          )}
                          {missingKeysWarning.tmdb && (
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
                          className="w-full sm:w-auto rounded-lg border border-surface-border bg-surface px-4 py-2 text-[11px] font-bold text-mist-200 hover:bg-surface-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
                        >
                          Saisir ma clé
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMissingKeysWarning(null);
                            setStep((currentStep) => (currentStep + 1) as WizardStep);
                          }}
                          className="w-full sm:w-auto rounded-lg border border-gold-500/40 bg-gold-500/20 px-4 py-2 text-[11px] font-bold text-gold-200 hover:bg-gold-500/30 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
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
                      3. Vos addons
                    </h4>
                    <p className="text-sm text-mist-400 mt-2 leading-relaxed">
                      Votre configuration AIO Metadata se crée ici, en un clic,
                      avec les clés de l&apos;étape 2. Pour Lumio et StreamFusion,
                      la configuration se fait chez eux : vous copiez leur lien de
                      manifest et vous le collez ici. Les autres addons français
                      se configurent automatiquement, sans rien à coller.
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
                    description="Films et séries en français via votre profil Lumio, branché sur votre débrideur TorBox ou AllDebrid."
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
                          className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-sage-300 bg-sage-500/10 border border-sage-500/30 hover:bg-sage-500/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sage-400/70 transition-colors"
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
                            className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70 transition-colors"
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

                  <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border/50 space-y-3">
                    <div>
                      <label className="text-sm font-bold text-mist-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gold-400" />
                        <span>Addons français complémentaires</span>
                      </label>
                      <p className="text-xs text-mist-400 mt-1 leading-relaxed">
                        Les addons francophones de la communauté StremioFR, en
                        plus de Torrentio et Comet. Tous lisent les clés saisies
                        à l&apos;étape 2 : l&apos;assistant écrit leur lien de
                        manifest à votre place, vous n&apos;avez rien à ouvrir ni
                        à coller.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <AddonToggle
                        name="Loostream"
                        description="Sources francophones lues en direct (miroirs Netflix, Prime et Disney+, StreamFlix, Movix) en VF et VOSTFR, sans débrideur."
                        checked={includeLoostream}
                        onChange={setIncludeLoostream}
                        blockedReason={
                          hasTmdbKey ? undefined : "Clé TMDB requise : saisissez-la à l'étape 2."
                        }
                      />
                      <AddonToggle
                        name="VF Trailer"
                        description="Bandes-annonces officielles en français (Allociné, YouTube, TMDB) sur la fiche des films et séries."
                        checked={includeVfTrailer}
                        onChange={setIncludeVfTrailer}
                        blockedReason={
                          hasTmdbKey ? undefined : "Clé TMDB requise : saisissez-la à l'étape 2."
                        }
                      />
                      <AddonToggle
                        name="Frenchio"
                        description="Trackers francophones (YGG, C411, Tr4ker…) débridés par votre compte : les mêmes sources que Torrentio, orientées France."
                        checked={includeFrenchio}
                        onChange={setIncludeFrenchio}
                        blockedReason={
                          hasDebridKey && hasTmdbKey
                            ? undefined
                            : "Clé de débrideur et clé TMDB requises à l'étape 2."
                        }
                      />
                      <AddonToggle
                        name="UwU-FR"
                        description="Animés en VF et VOSTFR, depuis les trackers francophones et Nyaa. À activer si vous regardez des animés."
                        checked={includeUwuFr}
                        onChange={setIncludeUwuFr}
                        blockedReason={
                          hasDebridKey && hasTmdbKey
                            ? undefined
                            : "Clé de débrideur et clé TMDB requises à l'étape 2."
                        }
                      />
                    </div>

                    <p className="text-[11px] text-mist-500 leading-relaxed">
                      Loostream affiche « {profileName.trim() || "FOCALE"} » (le nom
                      de votre profil Nuvio) comme pseudo : changez ce nom à
                      l&apos;étape 1 pour le modifier. Torrentio est déjà installé
                      par l&apos;assistant, avec votre clé de débrideur.
                    </p>
                  </div>

                  <GuideField
                    label="StreamFusion (facultatif)"
                    description="Agrégateur de trackers français et de services de débridage. Sa configuration vit chez StreamFusion (compte et mot de passe) : l'assistant ne peut pas la créer, il recopie le lien de manifest que vous lui donnez."
                    value={streamFusionManifestUrl}
                    placeholder="https://streamfusion.stremio-epsilon.ca/xxxxxx/manifest.json"
                    guide={PROVIDER_GUIDES.streamfusion}
                    onChange={setStreamFusionManifestUrl}
                  />
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
                      « {profileName.trim() || "FOCALE"} », réutilisé s&apos;il
                      existe déjà. Vos clés TMDB et MDBList y sont reprises de
                      l&apos;étape 2, ainsi que votre clé TorBox si vous en avez
                      une : Nuvio Desktop en a besoin.
                    </div>
                    <div>
                      • <span className="text-mist-300">Réglages</span> : tout en
                      français par défaut, sur téléviseur, mobile et ordinateur :
                      métadonnées TMDB, sous-titres français (mode forcé), piste
                      audio française d&apos;abord et notes externes MDBList
                      activées. Les clients Nuvio arrivent en anglais, sans
                      préférence de langue et sans notes.
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
                        : "non installé (aucun lien fourni)"}
                      .
                    </div>
                    <div>
                      • <span className="text-mist-300">Addons français</span> :{" "}
                      {frenchAddons.length > 0
                        ? `${formatFrenchList(frenchAddons)} : configurés automatiquement${
                            streamFusionManifestUrl.trim()
                              ? ", sauf StreamFusion (votre lien)"
                              : ""
                          }`
                        : "aucun addon complémentaire sélectionné"}
                      .
                    </div>
                    <div>
                      • <span className="text-mist-300">Débrideur</span> :{" "}
                      {torboxKey.trim() && alldebridKey.trim()
                        ? "TorBox et AllDebrid : les deux clés placées dans Torrentio, Comet et Lumio"
                        : torboxKey.trim()
                          ? "TorBox : placé dans Torrentio, Comet et Lumio"
                          : alldebridKey.trim()
                            ? "AllDebrid : placé dans Torrentio, Comet et Lumio"
                            : "aucune clé fournie : Torrentio et Comet seront installés sans débrideur"}
                      .
                    </div>
                    <div>
                      • <span className="text-mist-300">Addons</span> : Cinemeta,
                      OpenSubtitles v3, AIO Metadata, Torrentio et Comet, réglés sur
                      votre débrideur
                      {frenchAddons.length > 0
                        ? `, plus ${formatFrenchList(frenchAddons)}.`
                        : "."}
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
                    disabled={step === 1 && verifyingAccount}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-mist-100 bg-gold-600 hover:bg-gold-500 shadow-glow transition-colors disabled:opacity-60 disabled:cursor-wait"
                  >
                    {step === 1 && verifyingAccount ? (
                      <>
                        <span>Vérification du compte…</span>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span>Suivant</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
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
                secondes…
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
                  <span>Connexion sur vos appareils :</span>
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

              <p className="text-[11px] leading-relaxed text-mist-500 max-w-md mx-auto">
                Suivi Trakt (facultatif) : Nuvio est déjà réglé pour s&apos;y
                appuyer, mais la connexion à votre compte Trakt se fait dans
                l&apos;application (Réglages → Intégrations → Trakt) et ne peut pas
                être préparée d&apos;ici.{" "}
                <Link
                  href="/tutoriel#trakt"
                  className="text-mist-300 underline decoration-line underline-offset-4 transition-colors hover:text-gold-300"
                >
                  Voir le tutoriel Trakt
                </Link>
                .
              </p>

              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-xl font-bold text-mist-100 bg-gold-600 hover:bg-gold-500 shadow-glow transition-all"
              >
                Fermer
              </button>

              <p className="text-xs leading-relaxed text-mist-400 max-w-md mx-auto">
                Focale est un projet bénévole, sans compte, sans suivi et sans
                publicité. Si le profil vous sert, une étoile sur le dépôt aide
                d&apos;autres francophones à le trouver :{" "}
                <a
                  href={SITE.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-mist-200 underline decoration-line underline-offset-4 transition-colors hover:text-gold-300"
                >
                  <Star className="h-3.5 w-3.5 text-gold-400" />
                  github.com/Shika34/focale
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
