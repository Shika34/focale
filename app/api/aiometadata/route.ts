import { NextResponse } from "next/server";
import configTemplate from "@/public/aiometadata-config-mitch.json";

/**
 * Crée une configuration AIO Metadata sur l'instance publique à partir de la
 * configuration FR du site, en y injectant les clés de l'utilisateur.
 *
 * Contrat vérifié de l'API : POST /api/config/save
 *   corps  : { config: <config complète>, password: "<6 caractères min.>" }
 *   réponse: { success, userUUID, installUrl, message }
 * `installUrl` est directement l'URL de manifest Stremio à installer.
 *
 * Appel fait côté serveur : le navigateur n'a pas à connaître l'instance ni le
 * mot de passe, et on évite toute question de CORS. Les clés ne font que
 * transiter par cette route : elles ne sont ni écrites sur le disque ni
 * journalisées.
 */

const AIO_METADATA_SAVE_URL = "https://aiometadata.elfhosted.com/api/config/save";
const MAX_BODY_BYTES = 8 * 1024;
const MAX_KEY_LENGTH = 128;
const UPSTREAM_TIMEOUT_MS = 15_000;

interface SaveRequest {
  tmdbApiKey?: string;
  tvdbApiKey?: string;
  mdblistApiKey?: string;
  password?: string;
}

/** Clé nettoyée, ou `null` si le type ou la longueur ne conviennent pas. */
function readKey(value: unknown): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length > MAX_KEY_LENGTH ? null : clean;
}

export async function POST(request: Request) {
  // L'instance AIO Metadata est publique et sans authentification : on refuse
  // les appels déclenchés depuis un autre site (le navigateur envoie toujours
  // `Origin` sur une requête POST), pour que la route ne serve pas de relais.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
  }

  let body: SaveRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (password.length < 6 || password.length > MAX_KEY_LENGTH) {
    return NextResponse.json(
      {
        error:
          "Choisissez un mot de passe d'au moins 6 caractères pour protéger votre configuration.",
      },
      { status: 400 },
    );
  }

  const tmdbApiKey = readKey(body.tmdbApiKey);
  const tvdbApiKey = readKey(body.tvdbApiKey);
  const mdblistApiKey = readKey(body.mdblistApiKey);
  if (tmdbApiKey === null || tvdbApiKey === null || mdblistApiKey === null) {
    return NextResponse.json({ error: "Clé API invalide." }, { status: 400 });
  }

  // Le modèle exporté est enveloppé : seule sa clé `config` est attendue par l'API.
  const config = structuredClone(configTemplate.config) as {
    apiKeys?: Record<string, string>;
  };

  if (config.apiKeys) {
    if (tmdbApiKey) config.apiKeys.tmdb = tmdbApiKey;
    if (tvdbApiKey) config.apiKeys.tvdb = tvdbApiKey;
    if (mdblistApiKey) config.apiKeys.mdblist = mdblistApiKey;
  }

  try {
    const res = await fetch(AIO_METADATA_SAVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, password }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detail = String(data?.error || `HTTP ${res.status}`).slice(0, 200);
      return NextResponse.json(
        { error: `AIO Metadata a refusé la configuration : ${detail}` },
        { status: 502 },
      );
    }

    if (!data?.installUrl) {
      return NextResponse.json(
        { error: "Réponse inattendue d'AIO Metadata : pas d'URL de manifest." },
        { status: 502 },
      );
    }

    return NextResponse.json({ manifestUrl: data.installUrl, userUUID: data.userUUID });
  } catch (error) {
    // Seul le message est journalisé : aucune clé ni configuration n'y figure.
    console.error(
      "Création AIO Metadata impossible :",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Impossible de joindre AIO Metadata pour le moment." },
      { status: 502 },
    );
  }
}
