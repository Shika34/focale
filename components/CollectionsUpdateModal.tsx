"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { getStats } from "@/lib/nuvio-data";
import { NuvioApi, type NuvioAddonInstall } from "@/lib/nuvio-api";
import { debridUsableBy } from "@/lib/manifest-urls";
import {
  attachBingecatRows,
  bingecatRows,
  normaliseBingecatManifestUrl,
  type BingecatManifest,
} from "@/lib/bingecat";
import {
  AIO_BASE_URL,
  aioConfigUuid,
  aioLoadErrorMessage,
  mergeFrenchCatalogs,
  type AioCatalog,
  type AioConfig,
} from "@/lib/aio-update";
import { spotlightArtVersion, versionSpotlightArt } from "@/lib/spotlight-art";
import { preflightManifests } from "@/lib/manifest-preflight";
import {
  COLLECTIONS_UPDATE_SOURCE,
  findProfileByName,
  profileNotFoundMessage,
  signInErrorMessage,
} from "@/lib/collections-update";
import {
  addonsNeedingManifestUrl,
  ASSISTANT_ONLY_ADDONS,
  type FocaleAddon,
  neededKeys,
  splitFocaleAddons,
  storedDebridKey,
  storedTmdbKey,
} from "@/lib/focale-addons";

interface CollectionsUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UpdateView = "form" | "addons" | "updating" | "success";

/** Débrideurs dont la clé sert à générer les manifests du pack. */
const DEBRID_PROVIDERS = [
  { id: "torbox", label: "TorBox" },
  { id: "alldebrid", label: "AllDebrid" },
  { id: "realdebrid", label: "Real-Debrid" },
  { id: "premiumize", label: "Premiumize" },
] as const;

type DebridProviderId = (typeof DEBRID_PROVIDERS)[number]["id"];

interface UpdateTarget {
  token: string;
  profileIndex: number;
  profileName: string;
}

/**
 * Fenêtre de mise à jour d'un profil Nuvio déjà configuré : les collections du
 * profil sont remplacées par celles du site, puis les addons du pack qui
 * manquent sont proposés à l'installation, aucun n'étant coché d'avance. Les
 * clés déjà enregistrées dans le profil sont réutilisées telles quelles, jamais
 * redemandées, et une seule clé de chaque type sert à tous les addons cochés.
 */
export function CollectionsUpdateModal({ isOpen, onClose }: CollectionsUpdateModalProps) {
  const stats = getStats();

  const [viewState, setViewState] = useState<UpdateView>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileName, setProfileName] = useState("FOCALE");
  const [errorMessage, setErrorMessage] = useState("");
  const [progressState, setProgressState] = useState({
    step: "Initialisation",
    percent: 0,
    details: "Préparation des collections…",
  });

  /** Profil visé, une fois les identifiants vérifiés. */
  const [target, setTarget] = useState<UpdateTarget | null>(null);
  const [installedAddons, setInstalledAddons] = useState<FocaleAddon[]>([]);
  const [missingAddons, setMissingAddons] = useState<FocaleAddon[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  /** Liens de manifest saisis pour Lumio et StreamFusion. */
  const [manifestUrls, setManifestUrls] = useState<Record<string, string>>({});
  /** Clé TMDB lue dans le profil : le formulaire ne la redemande pas. */
  const [storedTmdb, setStoredTmdb] = useState("");
  /** Clé de débrideur lue dans le profil, avec le fournisseur qui l'a déposée. */
  const [storedDebrid, setStoredDebrid] = useState<{
    provider: string;
    label: string;
    key: string;
  } | null>(null);
  const [debridProvider, setDebridProvider] = useState<DebridProviderId>("torbox");
  const [debridKey, setDebridKey] = useState("");
  const [tmdbKey, setTmdbKey] = useState("");
  const [installedNames, setInstalledNames] = useState<string[]>([]);
  /** Addons cochés dont le manifest n'a pas répondu : installés nulle part. */
  const [skippedNames, setSkippedNames] = useState<string[]>([]);
  /** Identifiant de la configuration AIO Metadata installée, s'il y en a une. */
  const [aioUuid, setAioUuid] = useState<string | null>(null);
  const [aioPassword, setAioPassword] = useState("");
  const [aioBusy, setAioBusy] = useState(false);
  const [aioNotice, setAioNotice] = useState<{ ok: boolean; text: string } | null>(null);
  /** Garde synchrone : un double clic ne doit pas lancer deux envois. */
  const sendingRef = useRef(false);

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

  if (!isOpen) return null;

  const selectedIds = missingAddons
    .filter((addon) => selected[addon.id])
    .map((addon) => addon.id);
  const needs = neededKeys(selectedIds);
  /** Addons cochés dont le lien de manifest reste à saisir. */
  const manifestFields = addonsNeedingManifestUrl(selectedIds);
  const effectiveDebridKey = storedDebrid?.key ?? debridKey.trim();
  const effectiveTmdbKey = storedTmdb || tmdbKey.trim();

  /** Clés au format attendu par les générateurs de manifest. */
  const keysForBuild = {
    torboxApiKey: debridProvider === "torbox" ? effectiveDebridKey : "",
    alldebridApiKey: debridProvider === "alldebrid" ? effectiveDebridKey : "",
    realdebridApiKey: debridProvider === "realdebrid" ? effectiveDebridKey : "",
    premiumizeApiKey: debridProvider === "premiumize" ? effectiveDebridKey : "",
    tmdbApiKey: effectiveTmdbKey,
  };

  const toggleAddon = (id: string, checked: boolean) => {
    setSelected((current) => ({ ...current, [id]: checked }));
    setErrorMessage("");
  };

  /** Étape 1 : identifiants vérifiés, profil trouvé, addons déjà en place lus. */
  const handleCheck = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Veuillez renseigner votre email et votre mot de passe Nuvio.");
      return;
    }

    const wantedName = profileName.trim() || "FOCALE";

    if (sendingRef.current) return;
    sendingRef.current = true;

    setErrorMessage("");
    setViewState("updating");

    try {
      setProgressState({
        step: "Connexion à votre compte Nuvio",
        percent: 25,
        details: "Vérification de vos identifiants auprès de l'API officielle…",
      });

      // `login` plutôt que `autoAuth` : cette fenêtre ne doit jamais créer de
      // compte par erreur quand l'email est mal saisi.
      let token = "";
      try {
        token = (await NuvioApi.login(email.trim(), password)).token;
      } catch (authErr) {
        throw new Error(signInErrorMessage(authErr));
      }

      setProgressState({
        step: "Recherche de votre profil",
        percent: 50,
        details: `Profil visé : « ${wantedName} ».`,
      });

      const profiles = await NuvioApi.getProfiles(token);
      const targetProfile = findProfileByName(profiles, wantedName);
      if (!targetProfile) {
        throw new Error(profileNotFoundMessage(wantedName, profiles));
      }

      setProgressState({
        step: "Lecture des addons et des clés du profil",
        percent: 75,
        details: `Contenu actuel du profil « ${targetProfile.name} »…`,
      });

      const addons = await NuvioApi.getAddons(token, targetProfile.profile_index).catch(() => []);
      const credentials = await NuvioApi.getProviderCredentials(
        token,
        targetProfile.profile_index,
      ).catch(() => ({}));
      const { installed, missing } = splitFocaleAddons(addons);

      setTarget({
        token,
        profileIndex: targetProfile.profile_index,
        profileName: targetProfile.name,
      });
      setInstalledAddons(installed);
      setMissingAddons(missing);
      setAioUuid(aioConfigUuid(addons));
      setAioPassword("");
      setAioNotice(null);
      // Aucun addon coché d'avance : l'utilisateur choisit ce qu'il ajoute.
      setSelected(Object.fromEntries(missing.map((addon) => [addon.id, false])));
      setManifestUrls({});
      setStoredTmdb(storedTmdbKey(credentials));
      setStoredDebrid(storedDebridKey(credentials));

      setProgressState({
        step: "Profil lu",
        percent: 100,
        details: "Choisissez les addons à ajouter.",
      });
      setViewState("addons");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "La vérification a échoué. Réessayez dans un instant.",
      );
      setViewState("form");
    } finally {
      sendingRef.current = false;
    }
  };

  /**
   * Recharge la configuration AIO Metadata installée, y ajoute les catalogues
   * « Top 10 France » manquants, puis la réenregistre à l'identique : mêmes
   * clés, même UUID, donc même manifest déjà installé dans Nuvio.
   */
  const handleAioUpdate = async () => {
    if (!aioUuid) return;
    const secret = aioPassword.trim();
    if (secret.length < 6) {
      setAioNotice({
        ok: false,
        text: "Saisissez le mot de passe choisi à la création de votre configuration AIO Metadata (6 caractères minimum).",
      });
      return;
    }
    if (aioBusy) return;

    setAioBusy(true);
    setAioNotice(null);
    try {
      const loadRes = await fetch(`${AIO_BASE_URL}/api/config/load/${aioUuid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: secret }),
      });
      if (!loadRes.ok) {
        setAioNotice({ ok: false, text: aioLoadErrorMessage(loadRes.status) });
        return;
      }
      const loaded = (await loadRes.json()) as { config?: AioConfig };
      if (!loaded.config) {
        setAioNotice({ ok: false, text: aioLoadErrorMessage(500) });
        return;
      }

      const templateRes = await fetch("/aiometadata-config-fr.json");
      const template = (await templateRes.json()) as { config?: { catalogs?: AioCatalog[] } };
      const templateCatalogs = template.config?.catalogs ?? [];
      const { config: merged, added } = mergeFrenchCatalogs(loaded.config, templateCatalogs);

      if (added.length === 0) {
        setAioNotice({
          ok: true,
          text: "Votre configuration expose déjà les classements France : rien à changer.",
        });
        return;
      }

      const saveRes = await fetch(`${AIO_BASE_URL}/api/config/update/${aioUuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: merged, password: secret }),
      });
      if (!saveRes.ok) {
        setAioNotice({ ok: false, text: aioLoadErrorMessage(saveRes.status) });
        return;
      }

      setAioNotice({
        ok: true,
        text: `${added.length} catalogue${added.length > 1 ? "s" : ""} France ajouté${added.length > 1 ? "s" : ""}. Relancez Nuvio si les nouvelles rangées n'apparaissent pas tout de suite.`,
      });
      setAioPassword("");
    } catch {
      setAioNotice({
        ok: false,
        text: "Impossible de joindre AIO Metadata. Vérifiez votre connexion, puis réessayez.",
      });
    } finally {
      setAioBusy(false);
    }
  };

  /** Étape 2 : collections réécrites, puis addons cochés installés. */
  const handleUpdate = async () => {
    if (!target) {
      setViewState("form");
      return;
    }

    if (needs.debrid && !effectiveDebridKey) {
      setErrorMessage(
        "Renseignez la clé API de votre débrideur : elle sert à générer les addons cochés (Torrentio, Comet, Frenchio, UwU-FR).",
      );
      return;
    }
    if (needs.tmdb && !effectiveTmdbKey) {
      setErrorMessage(
        "Renseignez votre clé TMDB : Loostream, VF Trailer, Frenchio et UwU-FR en ont besoin pour leurs catalogues français.",
      );
      return;
    }
    const addonWithoutUrl = manifestFields.find(
      (addon) => !/^https?:\/\//i.test(manifestUrls[addon.id]?.trim() ?? ""),
    );
    if (addonWithoutUrl) {
      setErrorMessage(
        `Collez le lien de manifest ${addonWithoutUrl.name} : il commence par https:// et se trouve dans votre compte ${addonWithoutUrl.name}.`,
      );
      return;
    }
    if (selectedIds.includes("frenchio") && !debridUsableBy(keysForBuild, "frenchio")) {
      setErrorMessage(
        "Frenchio n'accepte ni Premiumize ni Real-Debrid : choisissez TorBox ou AllDebrid.",
      );
      return;
    }
    if (selectedIds.includes("uwu-fr") && !debridUsableBy(keysForBuild, "uwu-fr")) {
      setErrorMessage(
        "UwU-FR n'accepte que TorBox ou AllDebrid : changez de débrideur ou décochez cet addon.",
      );
      return;
    }

    if (sendingRef.current) return;
    sendingRef.current = true;

    setErrorMessage("");
    setViewState("updating");
    setSkippedNames([]);

    try {
      setProgressState({
        step: "Lecture des collections à jour",
        percent: 30,
        details: `Envoi de ${stats.totalCollections} collections et ${stats.totalFolders} dossiers francophones…`,
      });
      const collRes = await fetch(COLLECTIONS_UPDATE_SOURCE);
      if (!collRes.ok) {
        throw new Error(
          "La liste des collections n'a pas pu être téléchargée depuis ce site. Rechargez la page, puis réessayez.",
        );
      }
      const collections = await collRes.json();

      setProgressState({
        step: "Remplacement des collections du profil",
        percent: 55,
        details: `Le profil « ${target.profileName} » reçoit la version à jour…`,
      });
      // Les visuels « En vedette » changent tous les quinze jours : la version
      // posée sur les affiches évite que Nuvio resserve l'ancienne depuis son
      // cache d'images.
      //
      // Les rangées personnelles de « Pour vous » viennent de Bingecat quand son
      // manifest est fourni : leur identifiant d'addon est propre au compte, donc
      // elles ne peuvent pas être écrites dans le fichier du site.
      let collectionsToPush = versionSpotlightArt(collections, spotlightArtVersion());
      const bingecatUrl = normaliseBingecatManifestUrl(manifestUrls.bingecat ?? "");
      if (bingecatUrl) {
        try {
          const manifestRes = await fetch(bingecatUrl);
          if (manifestRes.ok) {
            const manifest = (await manifestRes.json()) as BingecatManifest;
            collectionsToPush = attachBingecatRows(collectionsToPush, bingecatRows(manifest));
          }
        } catch {
          // Manifest injoignable : les collections partent sans ces rangées.
        }
      }
      await NuvioApi.pushCollections(target.token, target.profileIndex, collectionsToPush);

      let installedNow: string[] = [];
      if (selectedIds.length > 0) {
        setProgressState({
          step: "Installation des addons cochés",
          percent: 80,
          details: `${selectedIds.length} addon${selectedIds.length > 1 ? "s" : ""} en cours d'installation…`,
        });

        // `buildAddonsList` produit tout le pack : on ne garde que les addons
        // cochés qui manquaient. `installAddons` fusionne et conserve les addons
        // déjà présents dans le profil, y compris ceux de l'utilisateur.
        const addons = NuvioApi.buildAddonsList(keysForBuild, {
          profileName: target.profileName,
          loostream: selectedIds.includes("loostream"),
          frenchio: selectedIds.includes("frenchio"),
          uwuFr: selectedIds.includes("uwu-fr"),
          vfTrailer: selectedIds.includes("vf-trailer"),
          lumioManifestUrl: manifestUrls.lumio,
          streamFusionManifestUrl: manifestUrls.streamfusion,
          bingecatManifestUrl: manifestUrls.bingecat,
        }).filter((addon: NuvioAddonInstall) =>
          missingAddons.some(
            (catalogueAddon) => selectedIds.includes(catalogueAddon.id) && catalogueAddon.name === addon.name,
          ),
        );

        // Un manifest muet n'est pas installé : dans le profil il ne donnerait
        // ni source ni rangée, et l'accueil garderait une entrée morte.
        const preflight = await preflightManifests(addons);
        if (preflight.ready.length > 0) {
          await NuvioApi.installAddons(target.token, target.profileIndex, preflight.ready);
        }
        installedNow = preflight.ready.map((addon: NuvioAddonInstall) => addon.name);
        setSkippedNames(preflight.failed.map((addon) => `${addon.name} (${addon.reason})`));
      }

      setInstalledNames(installedNow);
      setProgressState({
        step: "Profil à jour",
        percent: 100,
        details: "Collections et addons sont à jour.",
      });

      setTimeout(() => setViewState("success"), 700);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "La mise à jour a échoué. Réessayez dans un instant.",
      );
      setViewState("addons");
    } finally {
      sendingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mise-a-jour-collections-titre"
        className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-card border border-line bg-ink-800 shadow-panel flex flex-col"
      >
        <div className="p-5 sm:p-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-gold-400" strokeWidth={1.6} />
            <div>
              <h3
                id="mise-a-jour-collections-titre"
                className="display text-xl text-mist-100 sm:text-2xl"
              >
                Mettre à jour mes collections et addons
              </h3>
              <p className="text-xs text-mist-400">
                Profil déjà configuré · collections et addons du pack
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-mist-400 hover:text-mist-100 hover:bg-surface-hover transition-colors"
            aria-label="Fermer la mise à jour des collections et addons"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {viewState === "form" && (
            <div className="space-y-6 animate-in fade-in">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <p className="text-sm leading-relaxed text-mist-300">
                Vous avez déjà configuré votre profil avec Focale ? Saisissez vos
                identifiants Nuvio et le nom du profil : ses{" "}
                {stats.totalCollections} collections francophones sont remplacées
                par celles du site, et vous choisissez ensuite les addons du pack
                qu&apos;il lui manque.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-mist-100 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-400" />
                    <span>Email Nuvio</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="focale-nuvio-email"
                    autoComplete="username"
                    spellCheck={false}
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
                    name="focale-nuvio-password"
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-mist-100 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-gold-400" />
                  <span>Nom du profil à mettre à jour</span>
                </label>
                <input
                  type="text"
                  required
                  name="focale-nuvio-profile"
                  autoComplete="off"
                  spellCheck={false}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden"
                />
                <p className="text-xs text-mist-400 leading-relaxed">
                  Le nom du profil dans Nuvio, tel qu&apos;il s&apos;affiche dans
                  l&apos;application : « FOCALE » si vous ne l&apos;avez pas changé.
                  Un nom inconnu est refusé, aucun profil n&apos;est créé ici.
                </p>
              </div>

              <div className="bg-gold-950/25 border border-gold-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-4 h-4 text-sage-400 shrink-0 mt-0.5" />
                <div className="text-xs text-mist-300 leading-relaxed">
                  <strong className="text-mist-100 block mb-0.5">
                    Rien à réinstaller dans Nuvio
                  </strong>
                  Votre lien de manifest est lié au profil, pas à son contenu : la
                  nouvelle version des collections apparaît à la prochaine
                  synchronisation de l&apos;application. Vos identifiants partent
                  uniquement vers l&apos;API officielle{" "}
                  <code className="text-gold-300">api.nuvio.tv</code> et ne sont pas
                  conservés ici.
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheck}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
              >
                <Sparkles className="w-4 h-4" />
                <span>Vérifier mon profil</span>
              </button>
            </div>
          )}

          {viewState === "addons" && (
            <div className="space-y-6 animate-in fade-in">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <h4 className="display text-2xl text-mist-100">
                  Addons du profil « {target?.profileName} »
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-mist-400">
                  Les collections sont remplacées par celles du site. Aucun addon
                  n&apos;est coché d&apos;avance : cochez ceux que vous voulez
                  ajouter, les addons déjà présents ne sont ni réinstallés ni
                  modifiés.
                </p>
              </div>

              {installedAddons.length > 0 && (
                <div className="rounded-2xl border border-surface-border/50 bg-surface-elevated/60 p-4 space-y-2">
                  <span className="text-xs font-bold text-mist-100">
                    Déjà installés sur ce profil
                  </span>
                  <ul className="space-y-1">
                    {installedAddons.map((addon) => (
                      <li
                        key={addon.id}
                        className="flex items-center gap-2 text-xs text-mist-400"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-sage-400" />
                        <span className="text-mist-300">{addon.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aioUuid && (
                <div className="rounded-2xl border border-gold-500/30 bg-surface-elevated/60 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-gold-400" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-mist-100">
                        Classements France des services de streaming
                      </span>
                      <p className="text-[11px] leading-relaxed text-mist-400">
                        Les rangées « Top 10 France » passent par votre configuration
                        AIO Metadata. Celle d&apos;un profil configuré avant le
                        18 octobre 2026 ne contient pas ces catalogues : saisissez son
                        mot de passe pour les y ajouter. Vos clés, votre UUID et le
                        manifest installé dans Nuvio ne changent pas.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="password"
                      name="focale-aio-password"
                      autoComplete="off"
                      value={aioPassword}
                      onChange={(event) => {
                        setAioPassword(event.target.value);
                        setAioNotice(null);
                      }}
                      placeholder="Mot de passe AIO Metadata"
                      aria-label="Mot de passe de votre configuration AIO Metadata"
                      disabled={aioBusy}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={handleAioUpdate}
                      disabled={aioBusy}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gold-500/40 px-3.5 py-2.5 text-xs font-semibold text-gold-300 transition-colors hover:bg-gold-500/10 disabled:opacity-60"
                    >
                      {aioBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>{aioBusy ? "Mise à jour…" : "Mettre à jour ma configuration"}</span>
                    </button>
                  </div>
                  {aioNotice && (
                    <p
                      role={aioNotice.ok ? "status" : "alert"}
                      className={`text-[11px] leading-relaxed ${aioNotice.ok ? "text-sage-300" : "text-red-300"}`}
                    >
                      {aioNotice.text}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <span className="text-xs font-bold text-mist-100">
                  {missingAddons.length > 0
                    ? `À ajouter (${missingAddons.length} disponible${missingAddons.length > 1 ? "s" : ""})`
                    : "Aucun addon à ajouter"}
                </span>

                {missingAddons.length === 0 ? (
                  <p className="rounded-xl border border-surface-border/50 bg-surface/50 px-3.5 py-3 text-[11px] leading-relaxed text-mist-400">
                    Tous les addons du pack sont déjà installés sur ce profil. La
                    mise à jour se limitera aux collections.
                  </p>
                ) : (
                  missingAddons.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-start gap-3 rounded-xl border border-surface-border/60 bg-surface/60 px-3.5 py-3 transition-colors hover:border-gold-500/40 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(selected[addon.id])}
                        onChange={(event) => toggleAddon(addon.id, event.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-gold-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400/70"
                      />
                      <span className="space-y-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-mist-100">{addon.name}</span>
                          {addon.needs.debrid && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-gold-300 bg-gold-500/10 border border-gold-500/30 rounded-full px-2 py-0.5">
                              Clé débrideur
                            </span>
                          )}
                          {addon.needs.tmdb && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-gold-300 bg-gold-500/10 border border-gold-500/30 rounded-full px-2 py-0.5">
                              Clé TMDB
                            </span>
                          )}
                          {addon.needs.manifestUrl && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-gold-300 bg-gold-500/10 border border-gold-500/30 rounded-full px-2 py-0.5">
                              Votre lien
                            </span>
                          )}
                        </span>
                        <span className="block text-[11px] leading-relaxed text-mist-400">
                          {addon.description}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>

              {manifestFields.map((addon) => (
                <div
                  key={addon.id}
                  className="rounded-2xl border border-surface-border/50 bg-surface-elevated/60 p-4 space-y-3"
                >
                  <span className="text-xs font-bold text-mist-100">{addon.manifestLabel}</span>
                  <input
                    type="text"
                    name={`focale-manifest-${addon.id}`}
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="url"
                    value={manifestUrls[addon.id] ?? ""}
                    onChange={(e) =>
                      setManifestUrls((current) => ({ ...current, [addon.id]: e.target.value }))
                    }
                    placeholder="https://…/manifest.json"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] leading-relaxed text-mist-400">{addon.manifestHint}</p>
                  {addon.manifestLink && (
                    <a
                      href={addon.manifestLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sage-300 hover:text-sage-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sage-400/70"
                    >
                      <span>{addon.manifestLink.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}

              {needs.debrid && (
                <div className="rounded-2xl border border-surface-border/50 bg-surface-elevated/60 p-4 space-y-3">
                  <span className="text-xs font-bold text-mist-100">Clé du débrideur</span>
                  {storedDebrid ? (
                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-sage-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Clé {storedDebrid.label} déjà enregistrée dans ce profil :
                        elle est réutilisée pour tous les addons cochés, rien à
                        ressaisir.
                      </span>
                    </p>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-mist-100">Débrideur</label>
                        <select
                          value={debridProvider}
                          onChange={(e) => setDebridProvider(e.target.value as DebridProviderId)}
                          className="w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-mist-100 focus:border-gold-500 focus:outline-hidden"
                        >
                          {DEBRID_PROVIDERS.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-mist-100">
                          Clé API du débrideur
                        </label>
                        <input
                          type="password"
                          name="focale-debrid-key"
                          autoComplete="new-password"
                          spellCheck={false}
                          value={debridKey}
                          onChange={(e) => setDebridKey(e.target.value)}
                          placeholder="Collez votre clé API…"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden"
                        />
                        <p className="text-[11px] leading-relaxed text-mist-400">
                          Une seule clé suffit, quel que soit le nombre d&apos;addons
                          cochés : la même valeur alimente Torrentio, Comet,
                          Frenchio et UwU-FR.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {needs.tmdb && (
                <div className="rounded-2xl border border-surface-border/50 bg-surface-elevated/60 p-4 space-y-3">
                  <span className="text-xs font-bold text-mist-100">Clé TMDB</span>
                  {storedTmdb ? (
                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-sage-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Clé TMDB déjà enregistrée dans ce profil : elle est
                        réutilisée pour tous les addons cochés, rien à ressaisir.
                      </span>
                    </p>
                  ) : (
                    <>
                      <input
                        type="password"
                        name="focale-tmdb-key"
                        autoComplete="new-password"
                        spellCheck={false}
                        value={tmdbKey}
                        onChange={(e) => setTmdbKey(e.target.value)}
                        placeholder="Collez votre clé API TMDB…"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-mist-100 text-sm focus:border-gold-500 focus:outline-hidden"
                      />
                      <p className="text-[11px] leading-relaxed text-mist-400">
                        Elle sert à Loostream, VF Trailer, Frenchio et UwU-FR : une
                        seule fois pour les quatre.
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-surface-border/50 bg-surface/50 p-4 flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 text-mist-400 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-mist-400">
                  <strong className="text-mist-300 block mb-0.5">
                    Un addon ne se réinstalle pas d&apos;ici
                  </strong>
                  {ASSISTANT_ONLY_ADDONS.map((addon) => (
                    <span key={addon.name} className="block">
                      {addon.name} : {addon.reason}
                    </span>
                  ))}{" "}
                  Passez par « Configurer mon Nuvio » s&apos;il lui manque.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-surface-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setViewState("form");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-mist-300 border border-surface-border glass-panel hover:bg-surface-hover transition-colors"
                >
                  <span>Identifiants</span>
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-400 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Mettre à jour les collections
                    {selectedIds.length > 0
                      ? ` et installer ${selectedIds.length} addon${selectedIds.length > 1 ? "s" : ""}`
                      : ""}
                  </span>
                </button>
              </div>
            </div>
          )}

          {viewState === "updating" && (
            <div className="py-12 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gold-600/20 border border-gold-500/40 flex items-center justify-center mx-auto shadow-glow text-gold-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h4 className="display text-2xl text-mist-100">{progressState.step}</h4>
                <p className="text-xs text-mist-400 mt-1.5">{progressState.details}</p>
              </div>

              <div className="max-w-md mx-auto w-full bg-surface-elevated h-3 rounded-full overflow-hidden border border-surface-border p-[1px]">
                <div
                  className="h-full rounded-full bg-gold-400 transition-all duration-500"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>

              <div className="text-xs text-mist-500">
                Échange avec Nuvio en cours. Laissez cette fenêtre ouverte quelques
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
                <h4 className="display text-3xl text-mist-100">Profil mis à jour</h4>
                <p className="text-sm text-mist-300 mt-2 max-w-md mx-auto leading-relaxed">
                  Le profil{" "}
                  <strong className="text-sage-400">{target?.profileName}</strong>{" "}
                  contient la version à jour des {stats.totalCollections} collections
                  francophones et de leurs {stats.totalFolders} dossiers
                  {installedNames.length > 0
                    ? `, plus ${installedNames.length} addon${installedNames.length > 1 ? "s" : ""} : ${installedNames.join(", ")}.`
                    : ", sans nouvel addon : le pack était déjà complet."}
                </p>
                {skippedNames.length > 0 && (
                  <p className="text-xs text-mist-400 mt-2 max-w-md mx-auto leading-relaxed">
                    Non installé, manifest indisponible :{" "}
                    {skippedNames.join(", ")}. Recochez l&apos;addon et relancez
                    la mise à jour quand il sera de nouveau en ligne.
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-surface-border text-xs text-mist-300 text-left space-y-2.5 max-w-md mx-auto">
                <span className="font-bold text-mist-100 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-gold-400" />
                  <span>Ce qui change dans Nuvio :</span>
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-mist-400">
                  <li>
                    Les collections du profil affichent la nouvelle version à sa
                    prochaine synchronisation. Rien à réinstaller, votre lien de
                    manifest reste le même.
                  </li>
                  <li>
                    Les réglages du profil et les addons déjà installés n&apos;ont
                    pas été touchés. Un addon ajouté ici apparaît dans Nuvio à sa
                    prochaine synchronisation.
                  </li>
                  <li>
                    Cette fenêtre reste ouverte depuis la page d&apos;accueil : vous
                    pouvez la relancer à tout moment.
                  </li>
                </ul>
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
