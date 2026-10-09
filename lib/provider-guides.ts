import { TORBOX_REFERRAL_LINK } from "./site";

/**
 * Tutoriels pas à pas affichés dans le configurateur et sur la page Tutoriels.
 * Source unique : toute correction de libellé se fait ici.
 */

interface GuideStep {
  title: string;
  detail: string;
  bullets?: string[];
}

export interface ProviderGuide {
  question: string;
  steps: GuideStep[];
  signupUrl: string;
  signupLabel: string;
  keyUrl: string;
  keyLabel: string;
  note: string;
}


/** Tutoriels affichés dès que l'utilisateur n'a pas encore de compte ou de clé. */
export const PROVIDER_GUIDES: Record<
  "tmdb" | "tvdb" | "mdblist" | "torbox" | "alldebrid" | "lumio" | "streamfusion",
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
        detail: "Indiquez un usage personnel (par exemple « Nuvio, usage personnel »), acceptez les conditions puis validez le formulaire.",
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
    note: "Nuvio l'intègre nativement (Services connectés), et le parrainage offre jusqu'à 84 jours. Votre clé TorBox débrite vos flux : elle génère automatiquement vos manifests Torrentio et Comet, et alimente aussi votre profil Lumio.",
  },
  alldebrid: {
    question: "Avez-vous déjà un compte AllDebrid ?",
    steps: [
      {
        title: "Créer un compte AllDebrid",
        detail: "Inscrivez-vous sur alldebrid.fr : le débrideur est français, les tarifs sont en euros, et un essai gratuit de 7 jours est proposé sur vérification SMS (gratuite). Ensuite, comptez 2,99 € par tranche de 30 jours, ou un achat unique de 300 jours à 24,99 €.",
      },
      {
        title: "Ouvrir la page des clés API",
        detail: "Une fois connecté, ouvrez alldebrid.fr/apikeys : c'est la page des clés qui donnent accès à votre compte.",
      },
      {
        title: "Créer la clé",
        detail: "Saisissez le nom que vous voulez pour reconnaître la clé (par exemple « Nuvio »), puis validez avec le bouton vert « Créer ». La clé s'affiche juste en dessous.",
      },
      {
        title: "Copier la clé",
        detail: "AllDebrid envoie généralement un email de sécurité pour autoriser cette nouvelle connexion : ouvrez-le si vous le recevez, puis collez la clé dans le champ ci-dessous. Gardez-la privée : comme un mot de passe, elle donne accès à votre compte.",
      },
    ],
    signupUrl: "https://alldebrid.fr/register/",
    signupLabel: "Créer mon compte AllDebrid",
    keyUrl: "https://alldebrid.fr/apikeys/",
    keyLabel: "Ouvrir mes clés API",
    note: "AllDebrid n'est pas intégré nativement à Nuvio : les services connectés de l'application ne connaissent que TorBox et Premiumize. Ici, c'est Torrentio et Comet qui débrident, avec votre clé : l'assistant les configure pour vous, et le résultat est le même à l'écran.",
  },
  lumio: {
    question: "Avez-vous déjà un compte Lumio et son URL de manifest ?",
    steps: [
      {
        title: "Créer un profil",
        detail: "Sur l'écran « À qui le tour ? », saisissez le nom de votre profil (ou sélectionnez-en un parmi les suggestions), puis cliquez sur Continuer.",
      },
      {
        title: "Sélectionner votre débrideur",
        detail: "Dans la section « Connectez votre débrideur », cliquez sur le logo AllDebrid ou TorBox : Lumio gère les deux, et vous pourrez ajouter l'autre plus tard.",
      },
      {
        title: "Associer votre compte",
        detail: "Choisissez votre méthode de connexion :",
        bullets: [
          "« Se connecter à TorBox » / « Se connecter à AllDebrid » : valide directement la connexion depuis votre navigateur.",
          "« Saisir la clé » : collez la clé API récupérée sur votre compte (torbox.app/settings pour TorBox, alldebrid.fr/apikeys pour AllDebrid) puis cliquez sur Vérifier.",
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
    note: "Votre lien de manifest est personnel : c'est lui qui active votre débrideur et vos préférences de langues dans Nuvio.",
  },
  streamfusion: {
    question: "Avez-vous déjà un lien de manifest StreamFusion ?",
    steps: [
      {
        title: "Ouvrir la configuration StreamFusion",
        detail: "Rendez-vous sur streamfusion.stremio-epsilon.ca/configure : la configuration se fait en sept petites étapes, toutes en français.",
      },
      {
        title: "Choisir votre service de débridage",
        detail: "À l'étape « Service de Débridage », activez TorBox, AllDebrid ou l'un des autres services proposés, puis collez la clé API correspondante et validez avec « Vérifier ». C'est ce service qui transforme les torrents trouvés en lecture instantanée.",
      },
      {
        title: "Choisir vos sources (facultatif)",
        detail: "À l'étape « Sources », les trackers publics et le cache StreamFusion sont déjà actifs. Les indexeurs privés (C411, YggReborn, Tr4ker, Generation Free, ABN, G3MINI, TheOldSchool, Nostradamus) demandent une clé ou une passkey propre à chacun : laissez-les désactivés si vous n'en avez pas.",
      },
      {
        title: "Régler les langues et les filtres",
        detail: "Aux étapes « Services & contenu » et « Filtres & scoring », cochez « Français » (et « MULTi » si vous le souhaitez) pour faire remonter les versions françaises en premier, puis ajustez les limites de taille et le nombre de résultats par résolution.",
      },
      {
        title: "Créer votre compte StreamFusion",
        detail: "À l'étape « Configuration », choisissez un pseudo et un mot de passe : votre configuration est enregistrée sur leur serveur, et c'est ce couple qui permet de la retrouver ou de la modifier plus tard. Notez l'identifiant (UUID) et le mot de passe affichés à la création.",
      },
      {
        title: "Générer puis copier le lien de manifest",
        detail: "Cliquez sur « Générer le manifest » : le lien apparaît dans l'encadré vert, avec un bouton « Copier ». Il ressemble à https://streamfusion.stremio-epsilon.ca/xxxxxx/manifest.json.",
      },
      {
        title: "Coller le lien dans l'assistant",
        detail: "Revenez ici et collez ce lien dans le champ StreamFusion : l'assistant l'ajoute à votre profil Nuvio en même temps que les autres addons.",
      },
    ],
    signupUrl: "https://streamfusion.stremio-epsilon.ca/configure",
    signupLabel: "Ouvrir la configuration StreamFusion",
    keyUrl: "https://streamfusion.stremio-epsilon.ca/configure",
    keyLabel: "Ouvrir la configuration StreamFusion",
    note: "Facultatif : StreamFusion couvre les mêmes familles de sources que Torrentio, Comet, Frenchio et Loostream, déjà installés par l'assistant. Contrairement à eux, sa configuration vit chez StreamFusion (compte + mot de passe) : l'assistant ne peut pas la créer à votre place, il recopie le lien que vous lui donnez. Sans ce lien, StreamFusion n'est pas installé ; les autres addons, si.",
  },

};
