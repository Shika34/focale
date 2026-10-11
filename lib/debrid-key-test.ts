/**
 * Vérification d'une clé de débrideur depuis le navigateur.
 *
 * Le test part du navigateur de l'utilisateur et non du serveur, pour deux
 * raisons : AllDebrid refuse les connexions par IP (`AUTH_BLOCKED`,
 * « geo-blocked or ip-blocked »), c'est donc bien la connexion de l'utilisateur
 * qu'il faut interroger ; et sa clé ne transite alors par aucun intermédiaire.
 * L'API renvoie cette origine dans `access-control-allow-origin` (vérifié), et
 * `https://api.alldebrid.fr` est déclaré dans la `connect-src` de la CSP
 * (`next.config.mjs`).
 *
 * Contrat AllDebrid vérifié sur l'API v4 (docs.alldebrid.com) : `GET /v4/user`
 * avec la clé en paramètre `apikey`, réponse toujours en HTTP 200, soit
 * `{ status: "success", data: { user } }`, soit
 * `{ status: "error", error: { code, message } }`.
 *
 * `premiumUntil` arrive en **nombre** depuis l'API réelle
 * (`{"isPremium":true,"premiumUntil":1792448800}`) alors que l'exemple de la
 * documentation le montre entre guillemets : les deux formes sont acceptées.
 * Un compte premium sans date de fin connue (champ absent, `null` ou zéro)
 * reste un compte actif — c'est la seule chose que vérifient les autres
 * clients (Torrentio, Comet, JDownloader) ; exiger une date faisait passer des
 * comptes actifs pour des comptes sans abonnement.
 *
 * Contrat Premiumize vérifié sur l'API réelle : `GET /api/account/info` avec la
 * clé en paramètre `apikey` (jamais dans l'en-tête `Authorization` : Premiumize
 * répond bien `access-control-allow-origin: *`, mais n'autorise pas cet
 * en-tête en pré-vol, donc le navigateur bloquerait la requête). Réponse en
 * HTTP 200 également, soit
 * `{ status: "success", customer_id, premium_until, limit_used, booster_points }`,
 * soit `{ status: "error", message, code }` (`premium_until` vaut `null` sur un
 * compte gratuit). `https://www.premiumize.me` est déclaré dans la `connect-src`
 * de la CSP.
 *
 * Real-Debrid n'est pas testable ici : son API ne renvoie aucun en-tête CORS
 * (`access-control-allow-origin` absent, vérifié en pré-vol comme en GET), donc
 * le navigateur bloque la réponse quelle que soit la forme de la requête. Sa
 * clé n'est validée qu'à l'installation des manifests Torrentio et Comet, qui
 * l'exploitent.
 */

const ALLDEBRID_USER_URL = "https://api.alldebrid.fr/v4/user";
const PREMIUMIZE_ACCOUNT_URL = "https://www.premiumize.me/api/account/info";


/** Codes d'erreur AllDebrid dont le message est écrit pour l'utilisateur. */
const KEY_REFUSED_MESSAGE =
  "AllDebrid refuse cette clé : elle est invalide. Recopiez la clé API depuis alldebrid.fr → « Clés API », sans espace avant ni après.";
const IP_BLOCKED_MESSAGE =
  "AllDebrid bloque votre connexion : la clé est géo-bloquée ou votre adresse IP est bloquée (VPN, proxy, connexion d'hébergeur). Réessayez depuis votre connexion habituelle et confirmez l'e-mail de sécurité envoyé par AllDebrid.";
const UNREACHABLE_MESSAGE =
  "AllDebrid n'a pas répondu. Vérifiez votre connexion, puis réessayez.";

export type DebridKeyCheck =
  | { status: "valid"; message: string }
  | { status: "notice"; message: string }
  | { status: "invalid"; message: string }
  | { status: "blocked"; message: string }
  | { status: "unreachable"; message: string };

/** Champs de `/user` utilisés par le test. */
interface AlldebridUser {
  username: string;
  isPremium: boolean;
  /** Horodatage en secondes ; 0 quand AllDebrid n'en donne pas. */
  premiumUntil: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

/** `premiumUntil` accepté en nombre (API réelle) ou en chaîne (doc), 0 sinon. */
function readPremiumUntil(value: unknown): number {
  const seconds = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
}

function readUser(data: unknown): AlldebridUser | null {
  const user = asRecord(asRecord(data)?.user);
  if (!user) {
    return null;
  }
  return {
    username: typeof user.username === "string" ? user.username : "",
    isPremium: user.isPremium === true || user.isPremium === "true",
    premiumUntil: readPremiumUntil(user.premiumUntil),
  };
}

function messageForErrorCode(code: string): DebridKeyCheck {
  switch (code) {
    case "AUTH_BAD_APIKEY":
    case "AUTH_MISSING_APIKEY":
      return { status: "invalid", message: KEY_REFUSED_MESSAGE };
    case "AUTH_BLOCKED":
      return { status: "blocked", message: IP_BLOCKED_MESSAGE };
    case "AUTH_USER_BANNED":
      return {
        status: "invalid",
        message:
          "Le compte AllDebrid associé à cette clé est banni. Contactez AllDebrid, ou utilisez la clé d'un autre compte.",
      };
    case "MAINTENANCE":
      return {
        status: "unreachable",
        message: "AllDebrid est en maintenance. Réessayez dans quelques minutes.",
      };
    default:
      return {
        status: "invalid",
        message: `AllDebrid refuse cette clé (code ${code}). Vérifiez la clé, puis réessayez.`,
      };
  }
}

/** Vérifie la clé auprès d'AllDebrid et rend un message prêt à afficher. */
export async function checkAlldebridKey(apiKey: string): Promise<DebridKeyCheck> {
  const key = apiKey.trim();
  if (!key) {
    return { status: "invalid", message: "Saisissez d'abord votre clé AllDebrid." };
  }

  let payload: unknown;
  try {
    const response = await fetch(
      `${ALLDEBRID_USER_URL}?agent=focale&apikey=${encodeURIComponent(key)}`,
      { headers: { Accept: "application/json" } },
    );
    if (response.status === 429) {
      return {
        status: "unreachable",
        message: "Trop de tests en peu de temps : attendez une minute, puis réessayez.",
      };
    }
    payload = await response.json();
  } catch {
    return { status: "unreachable", message: UNREACHABLE_MESSAGE };
  }

  const body = asRecord(payload);
  if (!body) {
    return { status: "unreachable", message: UNREACHABLE_MESSAGE };
  }

  if (body.status !== "success") {
    const code = asRecord(body.error)?.code;
    return messageForErrorCode(typeof code === "string" ? code : "GENERIC");
  }

  const user = readUser(body.data);
  const who = user?.username ? ` (compte ${user.username})` : "";

  if (!user || !user.isPremium) {
    return {
      status: "notice",
      message: `Clé AllDebrid valide${who}, mais aucun abonnement actif : Torrentio, Comet et Lumio ne pourront rien débriter. Activez une offre sur alldebrid.fr, puis relancez ce test.`,
    };
  }

  if (user.premiumUntil === 0) {
    return { status: "valid", message: `Clé AllDebrid valide${who}. Abonnement actif.` };
  }

  const until = new Date(user.premiumUntil * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    status: "valid",
    message: `Clé AllDebrid valide${who}. Abonnement actif jusqu'au ${until}.`,
  };
}

/** Messages Premiumize écrits pour l'utilisateur. */
const PREMIUMIZE_KEY_REFUSED_MESSAGE =
  "Premiumize refuse cette clé : elle est invalide. Recopiez la clé API depuis premiumize.me → « Account » → « API », sans espace avant ni après.";
const PREMIUMIZE_UNREACHABLE_MESSAGE =
  "Premiumize n'a pas répondu. Vérifiez votre connexion, puis réessayez.";

/**
 * Vérifie la clé auprès de Premiumize et rend un message prêt à afficher.
 *
 * La clé passe en paramètre `apikey` et non dans l'en-tête `Authorization`
 * (voir l'en-tête du fichier) : c'est la seule forme que le navigateur peut
 * envoyer sans pré-vol, donc la seule qui fonctionne ici.
 */
export async function checkPremiumizeKey(apiKey: string): Promise<DebridKeyCheck> {
  const key = apiKey.trim();
  if (!key) {
    return { status: "invalid", message: "Saisissez d'abord votre clé Premiumize." };
  }

  let payload: unknown;
  try {
    const response = await fetch(
      `${PREMIUMIZE_ACCOUNT_URL}?apikey=${encodeURIComponent(key)}`,
      { headers: { Accept: "application/json" } },
    );
    if (response.status === 429) {
      return {
        status: "unreachable",
        message: "Trop de tests en peu de temps : attendez une minute, puis réessayez.",
      };
    }
    payload = await response.json();
  } catch {
    return { status: "unreachable", message: PREMIUMIZE_UNREACHABLE_MESSAGE };
  }

  const body = asRecord(payload);
  if (!body) {
    return { status: "unreachable", message: PREMIUMIZE_UNREACHABLE_MESSAGE };
  }

  if (body.status !== "success") {
    const code = typeof body.code === "string" ? body.code : "";
    if (code === "authentication_failed" || code === "invalid_apikey") {
      return { status: "invalid", message: PREMIUMIZE_KEY_REFUSED_MESSAGE };
    }
    return {
      status: "invalid",
      message: `Premiumize refuse cette clé${code ? ` (code ${code})` : ""}. Vérifiez la clé, puis réessayez.`,
    };
  }

  const who = typeof body.customer_id === "string" && body.customer_id ? ` (compte ${body.customer_id})` : "";
  const premiumUntil = readPremiumUntil(body.premium_until);

  // `premium_until` vaut `null` sur un compte gratuit : même distinction que
  // pour AllDebrid, un compte sans abonnement ne peut rien débriter.
  if (premiumUntil === 0) {
    return {
      status: "notice",
      message: `Clé Premiumize valide${who}, mais aucun abonnement actif : Torrentio et Comet ne pourront rien débriter. Activez une offre sur premiumize.me, puis relancez ce test.`,
    };
  }

  const until = new Date(premiumUntil * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    status: "valid",
    message: `Clé Premiumize valide${who}. Abonnement actif jusqu'au ${until}.`,
  };
}
