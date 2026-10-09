/**
 * Vérification d'une clé AllDebrid depuis le navigateur.
 *
 * Le test part du navigateur de l'utilisateur et non du serveur, pour deux
 * raisons : AllDebrid refuse les connexions par IP (`AUTH_BLOCKED`,
 * « geo-blocked or ip-blocked »), c'est donc bien la connexion de l'utilisateur
 * qu'il faut interroger ; et sa clé ne transite alors par aucun intermédiaire.
 * L'API renvoie cette origine dans `access-control-allow-origin` (vérifié), et
 * `https://api.alldebrid.fr` est déclaré dans la `connect-src` de la CSP
 * (`next.config.mjs`).
 *
 * Contrat vérifié sur l'API v4 (docs.alldebrid.com) : `GET /v4/user` avec la clé
 * en paramètre `apikey`, réponse toujours en HTTP 200, soit
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
 */

const ALLDEBRID_USER_URL = "https://api.alldebrid.fr/v4/user";

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
