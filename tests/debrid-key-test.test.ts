import { afterEach, describe, expect, it, vi } from "vitest";

import { checkAlldebridKey } from "@/lib/debrid-key-test";

/**
 * Test d'une clé AllDebrid (étape 2 du configurateur).
 *
 * La forme des réponses vient de l'API réelle : `api.alldebrid.fr/v4/user`
 * renvoie `premiumUntil` en **nombre** (`1792448800`), alors que l'exemple de
 * la documentation le montre entre guillemets. Les deux formes doivent être
 * acceptées, et un compte premium sans date de fin ne doit pas être pris pour
 * un compte sans abonnement — c'est ce que les autres clients (Torrentio,
 * Comet, JDownloader) vérifient : `isPremium` seul.
 */

function stubUserResponse(payload: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    })),
  );
}

/** Compte premium, tel que renvoyé par l'API réelle (premiumUntil numérique). */
const PREMIUM_NUMERIC = {
  status: "success",
  data: {
    user: {
      username: "Mitch",
      isPremium: true,
      isTrial: false,
      isSubscribed: true,
      premiumUntil: 1792448800,
      lang: "fr",
    },
  },
};

describe("checkAlldebridKey", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("accepte un compte premium dont premiumUntil est un nombre", async () => {
    stubUserResponse(PREMIUM_NUMERIC);
    const check = await checkAlldebridKey("cle");
    expect(check.status).toBe("valid");
    expect(check.message).toContain("Mitch");
    expect(check.message).toMatch(/abonnement actif/i);
  });

  it("accepte un compte premium dont premiumUntil est une chaîne", async () => {
    stubUserResponse({
      status: "success",
      data: { user: { username: "Mitch", isPremium: true, premiumUntil: "1545757200" } },
    });
    expect((await checkAlldebridKey("cle")).status).toBe("valid");
  });

  it("accepte un compte premium sans date de fin connue", async () => {
    stubUserResponse({
      status: "success",
      data: { user: { username: "Mitch", isPremium: true, premiumUntil: null } },
    });
    expect((await checkAlldebridKey("cle")).status).toBe("valid");
  });

  it("signale un compte sans abonnement actif", async () => {
    stubUserResponse({
      status: "success",
      data: { user: { username: "Mitch", isPremium: false, premiumUntil: 0 } },
    });
    const check = await checkAlldebridKey("cle");
    expect(check.status).toBe("notice");
    expect(check.message).toMatch(/aucun abonnement actif/i);
  });

  it("refuse une clé invalide et signale une connexion bloquée", async () => {
    stubUserResponse({ status: "error", error: { code: "AUTH_BAD_APIKEY" } });
    expect((await checkAlldebridKey("cle")).status).toBe("invalid");

    stubUserResponse({ status: "error", error: { code: "AUTH_BLOCKED" } });
    expect((await checkAlldebridKey("cle")).status).toBe("blocked");
  });

  it("signale une limitation de débit et une API injoignable", async () => {
    stubUserResponse({ status: "error", error: { code: "RATE_LIMIT" } }, 429);
    expect((await checkAlldebridKey("cle")).status).toBe("unreachable");

    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }));
    expect((await checkAlldebridKey("cle")).status).toBe("unreachable");
  });
});
