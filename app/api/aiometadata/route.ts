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
 * mot de passe, et on évite toute question de CORS.
 */

const AIO_METADATA_SAVE_URL = "https://aiometadata.elfhosted.com/api/config/save";

interface SaveRequest {
  tmdbApiKey?: string;
  tvdbApiKey?: string;
  mdblistApiKey?: string;
  password?: string;
}

export async function POST(request: Request) {
  let body: SaveRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const password = body.password?.trim() ?? "";
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Choisis un mot de passe d'au moins 6 caractères pour protéger ta configuration." },
      { status: 400 },
    );
  }

  // Le modèle exporté est enveloppé : seule sa clé `config` est attendue par l'API.
  const config = structuredClone(configTemplate.config) as {
    apiKeys?: Record<string, string>;
  };

  if (config.apiKeys) {
    if (body.tmdbApiKey?.trim()) config.apiKeys.tmdb = body.tmdbApiKey.trim();
    if (body.tvdbApiKey?.trim()) config.apiKeys.tvdb = body.tvdbApiKey.trim();
    if (body.mdblistApiKey?.trim()) config.apiKeys.mdblist = body.mdblistApiKey.trim();
  }

  try {
    const res = await fetch(AIO_METADATA_SAVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detail = data?.error || `HTTP ${res.status}`;
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
    console.error("Création AIO Metadata impossible :", error);
    return NextResponse.json(
      { error: "Impossible de joindre AIO Metadata pour le moment." },
      { status: 502 },
    );
  }
}
