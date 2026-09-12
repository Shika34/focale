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
} from "lucide-react";
import { NuvioApi } from "@/lib/nuvio-api";

interface NuvioConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewState = "form" | "installing" | "success";

export function NuvioConfiguratorModal({ isOpen, onClose }: NuvioConfiguratorModalProps) {
  const [viewState, setViewState] = useState<ViewState>("form");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [torboxKey, setTorboxKey] = useState("");

  // Errors & Progress
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

  if (!isOpen) return null;

  // Single Click Action
  const handleLaunchConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Veuillez renseigner votre email et mot de passe Nuvio.");
      return;
    }

    setErrorMessage("");
    setViewState("installing");

    try {
      // 1. Auto-Auth (Login or Create Account)
      setProgressState({
        step: "Connexion ou Création du compte Nuvio",
        percent: 20,
        details: "Vérification sécurisée auprès de l'API Nuvio...",
      });

      const authRes = await NuvioApi.autoAuth(email, password);
      setCreatedNewAccount(authRes.isNewAccount);

      // 2. Profile Setup (Create or select "Nuvio France FR")
      setProgressState({
        step: authRes.isNewAccount ? "Compte Nuvio créé ! Préparation du profil" : "Connexion réussie ! Configuration du profil",
        percent: 45,
        details: "Mise en place du profil dédié 'Nuvio France FR'...",
      });

      const profiles = await NuvioApi.getProfiles(authRes.token);
      let targetProfile = profiles.find((p) => p.name.toLowerCase().includes("nuvio france"));

      if (!targetProfile) {
        targetProfile = await NuvioApi.createProfile(authRes.token, "Nuvio France FR");
      }

      // 3. Push Full Collection
      setProgressState({
        step: "Injection de votre Collection Complète",
        percent: 55,
        details: "Envoi des 18 collections et 756 dossiers francophones...",
      });

      const collRes = await fetch("/nuvio-collections-mitch.json");
      const fullCollections = await collRes.json();
      await NuvioApi.pushCollections(authRes.token, targetProfile.profile_index, fullCollections);

      // 4. TMDB + Lumio + BingeCat (aucune clé, manifests publics)
      setProgressState({
        step: "Intégration TMDB, Lumio et BingeCat",
        percent: 75,
        details: "Attribution automatique des profils publics — aucune clé ni inscription requise.",
      });
      await NuvioApi.provisionTmdbLumioBingeCat(authRes.token, targetProfile.profile_index);

      // 5. Remaining pack (Cinemeta, AIO, Torbox, etc.)
      setProgressState({
        step: "Installation automatique des Addons",
        percent: 90,
        details: "Synchronisation de Torbox, Cinemeta, AIO Metadata, OpenSubtitles...",
      });

      const addons = NuvioApi.buildAddonsList({
        torboxApiKey: torboxKey,
      });
      await NuvioApi.installAddons(authRes.token, targetProfile.profile_index, addons);

      // 5. Complete
      setProgressState({
        step: "Configuration terminée !",
        percent: 100,
        details: "Votre compte Nuvio est entièrement configuré et prêt à l'emploi.",
      });

      setTimeout(() => {
        setViewState("success");
      }, 900);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Une erreur est survenue lors de la configuration.");
      setViewState("form");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel bg-[#0e121d] max-w-xl w-full rounded-3xl border border-indigo-500/40 shadow-glow-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Configurateur Automatique Nuvio
              </h3>
              <p className="text-xs text-slate-400">Simple, rapide & 100% automatisé</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* VIEW: FORM */}
          {viewState === "form" && (
            <form onSubmit={handleLaunchConfig} className="space-y-5 animate-in fade-in">
              {/* Security info box */}
              <div className="bg-indigo-950/25 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">Connexion ou Création Automatique</strong>
                  Entrez votre email et mot de passe ci-dessous.{" "}
                  <span className="text-emerald-300 font-semibold">
                    Si vous n&apos;avez pas encore de compte Nuvio, il sera créé automatiquement !
                  </span>{" "}
                  Vos données transitent directement et uniquement vers l&apos;API officielle de Nuvio (
                  <code className="text-cyan-300">api.nuvio.tv</code>).
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email & Password */}
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

              {/* Torbox API Key */}
              <div className="space-y-2 pt-2 border-t border-surface-border/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clé API TorBox (Recommandé pour la 4K)</span>
                  </label>
                  <a
                    href="https://torbox.app/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Récupérer ma clé Torbox</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="Collez votre clé API Torbox ici..."
                  value={torboxKey}
                  onChange={(e) => setTorboxKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Pas encore de compte Torbox ?</span>
                  <a
                    href="https://torbox.app/subscription?referral=49a51e6d-dcf6-47ad-a98d-147f11c4268f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    Parrainage jusqu&apos;à +84j offerts (Coupon: SIGMA30 en crypto)
                  </a>
                </div>
              </div>


              {/* What will be installed banner */}
              <div className="p-3.5 rounded-2xl bg-[#080B10]/80 border border-surface-border/40 text-[11px] text-slate-400 space-y-1.5">
                <strong className="text-white block font-semibold">Ce qui sera installé automatiquement :</strong>
                <div>• <span className="text-slate-300">Collection complète</span> : 18 catégories et 756 dossiers francophones.</div>
                <div>• <span className="text-slate-300">Addons</span> : Cinemeta, TMDB Addon, OpenSubtitles v3, AIO Metadata FR, Lumio, AIO STREAM, BingeCat, Torrentio (Torbox), Comet, MediaFusion.</div>
                <div className="text-emerald-400/80 font-medium pt-0.5">✓ TMDB, Lumio et BingeCat — aucune démarche requise, tout est automatique.</div>
              </div>


              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-400 hover:to-purple-500 shadow-glow hover:shadow-glow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Lancer la Configuration Automatique en 1 Clic</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: INSTALLING PROGRESS */}
          {viewState === "installing" && (
            <div className="py-12 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-glow text-indigo-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-white">{progressState.step}</h4>
                <p className="text-xs text-slate-400 mt-1.5">{progressState.details}</p>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto w-full bg-surface-elevated h-3 rounded-full overflow-hidden border border-surface-border p-[1px]">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>

              <div className="text-xs text-slate-500">
                Traitement sécurisé en cours. Merci de patienter quelques secondes...
              </div>
            </div>
          )}

          {/* VIEW: SUCCESS */}
          {viewState === "success" && (
            <div className="py-8 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-glow">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-white">
                  {createdNewAccount ? "Compte créé & Configuré !" : "Configuration réussie !"}
                </h4>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  Votre profil Nuvio a été configuré avec la collection complète (
                  <strong className="text-white">756 dossiers</strong>), TMDB, Lumio, BingeCat et les addons de streaming.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-surface-border text-xs text-slate-300 text-left space-y-2.5 max-w-md mx-auto">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>Connexion sur votre Téléviseur ou Smartphone :</span>
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Téléchargez et ouvrez l&apos;application Nuvio.</li>
                  <li>
                    Connectez-vous avec : <strong className="text-white">{email}</strong>.
                  </li>
                  <li>
                    Sélectionnez le profil <strong className="text-emerald-400">Nuvio France FR</strong>.
                  </li>
                  <li>Tout est déjà en place, bon visionnage !</li>
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
