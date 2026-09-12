"use client";

import { useState } from "react";
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
  Download,
  Link2,
  UserPlus,
} from "lucide-react";
import { NuvioApi } from "@/lib/nuvio-api";

interface NuvioConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewState = "form" | "installing" | "success";
type WizardStep = 1 | 2 | 3 | 4;

interface ApiKeyFieldProps {
  label: string;
  description: string;
  value: string;
  placeholder: string;
  getKeyUrl: string;
  signupUrl: string;
  onChange: (value: string) => void;
}

const TORBOX_REFERRAL_LINK = "https://torbox.app/subscription?referral=49a51e6d-dcf6-47ad-a98d-147f11c4268f";

function ApiKeyField({
  label,
  description,
  value,
  placeholder,
  getKeyUrl,
  signupUrl,
  onChange,
}: ApiKeyFieldProps) {
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
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={getKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
          >
            <span>Récupérer la clé</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
          >
            <span>Créer un compte</span>
            <UserPlus className="w-3 h-3" />
          </a>
        </div>
      </div>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
      />
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
  const totalSteps = 4;

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

  const downloadAioMetadataConfig = async () => {
    try {
      const json = await NuvioApi.buildAioMetadataConfig({
        tmdbApiKey: tmdbKey,
        tvdbApiKey: tvdbKey,
        mdblistApiKey: mdblistKey,
      });
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "aiometadata-config-nuvio-personnalise.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage("Impossible de générer la configuration AIO Metadata personnalisée.");
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
        step: "Ajout des collections françaises",
        percent: 58,
        details: "Envoi des 18 collections et 756 dossiers francophones...",
      });

      const collRes = await fetch("/nuvio-collections-mitch.json");
      const fullCollections = await collRes.json();
      await NuvioApi.pushCollections(authRes.token, targetProfile.profile_index, fullCollections);

      setProgressState({
        step: "Installation des addons sélectionnés",
        percent: 82,
        details: lumioManifestUrl.trim()
          ? "Installation de Lumio personnalisé, AIO Metadata, Torrentio, Comet et les autres addons essentiels..."
          : "Installation de Lumio public, AIO Metadata, Torrentio, Comet et les autres addons essentiels...",
      });

      const addons = NuvioApi.buildAddonsList({
        tmdbApiKey: tmdbKey,
        tvdbApiKey: tvdbKey,
        mdblistApiKey: mdblistKey,
        lumioManifestUrl,
      });
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
    3: "TorBox / Lumio",
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
              <p className="text-xs text-slate-400">Assistant guidé, clair et 100% en français</p>
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
                  <span>Étape {step} sur {totalSteps}</span>
                  <span className="font-semibold text-indigo-300">{stepTitles[step]}</span>
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
                    <h4 className="text-xl font-black text-white">1. Connectez ou créez votre compte Nuvio</h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      Entrez l'email et le mot de passe que vous voulez utiliser sur Nuvio. Si le compte n'existe pas encore,
                      il sera créé automatiquement au moment de l'envoi.
                    </p>
                  </div>

                  <div className="bg-indigo-950/25 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white block mb-0.5">Vos identifiants restent côté Nuvio</strong>
                      Ils sont utilisés uniquement pour appeler l'API officielle <code className="text-cyan-300">api.nuvio.tv</code>.
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
                    <h4 className="text-xl font-black text-white">2. Ajoutez vos clés de métadonnées</h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      Ces clés servent à personnaliser la configuration AIO Metadata. Elles sont optionnelles, mais recommandées
                      pour améliorer les affiches, les fiches séries et les catalogues avancés.
                    </p>
                  </div>

                  <ApiKeyField
                    label="TMDB"
                    description="Affiches, résumés, notes et métadonnées de films en français."
                    value={tmdbKey}
                    placeholder="Collez votre clé API TMDB..."
                    getKeyUrl="https://www.themoviedb.org/settings/api"
                    signupUrl="https://www.themoviedb.org/signup"
                    onChange={setTmdbKey}
                  />
                  <ApiKeyField
                    label="TVDB"
                    description="Métadonnées séries, saisons, épisodes et collections TV."
                    value={tvdbKey}
                    placeholder="Collez votre clé API TVDB..."
                    getKeyUrl="https://thetvdb.com/api-information"
                    signupUrl="https://thetvdb.com/"
                    onChange={setTvdbKey}
                  />
                  <ApiKeyField
                    label="MDBList"
                    description="Listes et catalogues avancés pour enrichir AIO Metadata."
                    value={mdblistKey}
                    placeholder="Collez votre clé API MDBList..."
                    getKeyUrl="https://mdblist.com/preferences/"
                    signupUrl="https://mdblist.com/"
                    onChange={setMdblistKey}
                  />

                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed space-y-3">
                    <p>
                      <strong className="text-white">Astuce :</strong> après avoir saisi vos clés, téléchargez votre configuration AIO Metadata personnalisée
                      pour l'importer dans votre instance AIO Metadata.
                    </p>
                    <button
                      type="button"
                      onClick={downloadAioMetadataConfig}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger ma config AIO Metadata</span>
                    </button>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-5">
                  <div>
                    <h4 className="text-xl font-black text-white">3. Préparez TorBox avec Lumio</h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      TorBox sert au streaming rapide et stable. Pour l'ajouter proprement dans Nuvio, générez d'abord votre manifest Lumio,
                      puis collez son lien ci-dessous.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Link2 className="w-4 h-4 text-emerald-400" />
                      <span>Comment récupérer votre manifest Lumio ?</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                      <li>Créez ou connectez-vous à votre compte TorBox.</li>
                      <li>Récupérez votre clé API TorBox dans les paramètres.</li>
                      <li>Ouvrez le configurateur Lumio et renseignez votre clé TorBox.</li>
                      <li>Copiez le lien du manifest généré, puis collez-le ici.</li>
                    </ol>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="https://mylumio.tv/configure"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                      >
                        <span>Générer mon manifest Lumio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://torbox.app/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-emerald-200 glass-panel hover:bg-surface-hover border border-emerald-500/30"
                      >
                        <span>Récupérer ma clé TorBox</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={TORBOX_REFERRAL_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-indigo-200 glass-panel hover:bg-surface-hover border border-indigo-500/30"
                      >
                        <span>Créer un compte TorBox</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Lien du manifest Lumio personnalisé</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://mylumio.tv/.../manifest.json"
                      value={lumioManifestUrl}
                      onChange={(e) => setLumioManifestUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Si vous ne collez rien, Nuvio installera le manifest Lumio public. Pour profiter de TorBox dans Lumio, collez votre manifest personnalisé.
                    </p>
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className="space-y-5">
                  <div>
                    <h4 className="text-xl font-black text-white">4. Vérifiez puis envoyez à Nuvio</h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      Dernière vérification avant d'ajouter les collections françaises et les addons essentiels dans votre profil Nuvio.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#080B10]/80 border border-surface-border/40 text-xs text-slate-400 space-y-2">
                    <strong className="text-white block font-semibold">Ce qui sera envoyé :</strong>
                    <div>• <span className="text-slate-300">Collection complète</span> : 18 catégories et 756 dossiers francophones.</div>
                    <div>• <span className="text-slate-300">AIO Metadata</span> : config personnalisable avec vos clés TMDB / TVDB / MDBList.</div>
                    <div>• <span className="text-slate-300">Lumio</span> : {lumioManifestUrl.trim() ? "manifest personnalisé collé" : "manifest public (sans TorBox personnalisé)"}.</div>
                    <div>• <span className="text-slate-300">Addons</span> : Cinemeta, OpenSubtitles v3, AIO STREAM, BingeCat, Torrentio, Comet, MediaFusion.</div>
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
                <h4 className="text-xl font-extrabold text-white">{progressState.step}</h4>
                <p className="text-xs text-slate-400 mt-1.5">{progressState.details}</p>
              </div>

              <div className="max-w-md mx-auto w-full bg-surface-elevated h-3 rounded-full overflow-hidden border border-surface-border p-[1px]">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>

              <div className="text-xs text-slate-500">
                Envoi sécurisé vers Nuvio. Merci de patienter quelques secondes...
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
                  {createdNewAccount ? "Compte créé et configuré !" : "Configuration envoyée !"}
                </h4>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  Votre profil Nuvio contient maintenant la collection complète, les addons essentiels et votre configuration Lumio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-surface-border text-xs text-slate-300 text-left space-y-2.5 max-w-md mx-auto">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>Connexion sur votre téléviseur ou smartphone :</span>
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Téléchargez et ouvrez l'application Nuvio.</li>
                  <li>
                    Connectez-vous avec : <strong className="text-white">{email}</strong>.
                  </li>
                  <li>
                    Sélectionnez le profil <strong className="text-emerald-400">Nuvio France FR</strong>.
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
