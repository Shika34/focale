import { afterEach, describe, expect, it, vi } from "vitest";

import { checkAlldebridKey, checkPremiumizeKey } from "@/lib/debrid-key-test";

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

/**
 * Test d'une clé Premiumize (étape 2 du configurateur).
 *
 * La forme des réponses vient de l'API réelle : `premiumize.me/api/account/info`
 * renvoie `{ status, customer_id, premium_until }`, avec `premium_until` à
 * `null` sur un compte gratuit, et
 * `{ status: "error", message, code }` (`authentication_failed`) sur une clé
 * refusée — le tout en HTTP 200. La clé part en paramètre `apikey` : l'API
 * n'autorise pas l'en-tête `Authorization` en pré-vol, donc un test dans le
 * navigateur doit éviter cet en-tête.
 */
describe("checkPremiumizeKey", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("accepte un abonnement actif", async () => {
    stubUserResponse({
      status: "success",
      customer_id: "1234567",
      premium_until: 1799999999,
      limit_used: 0.42,
      booster_points: 0,
    });
    const check = await checkPremiumizeKey("cle");
    expect(check.status).toBe("valid");
    expect(check.message).toContain("1234567");
    expect(check.message).toMatch(/abonnement actif/i);
  });

  it("signale un compte sans abonnement (premium_until null)", async () => {
    stubUserResponse({ status: "success", customer_id: "1234567", premium_until: null });
    const check = await checkPremiumizeKey("cle");
    expect(check.status).toBe("notice");
    expect(check.message).toMatch(/aucun abonnement actif/i);
  });

  it("refuse une clé refusée par l'API", async () => {
    stubUserResponse({ status: "error", message: "Not logged in.", code: "authentication_failed" });
    expect((await checkPremiumizeKey("cle")).status).toBe("invalid");
  });

  it("ne demande rien sans clé saisie", async () => {
    expect((await checkPremiumizeKey("   ")).status).toBe("invalid");
  });

  it("signale une limitation de débit et une API injoignable", async () => {
    stubUserResponse({ status: "error", code: "rate_limit" }, 429);
    expect((await checkPremiumizeKey("cle")).status).toBe("unreachable");

    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }));
    expect((await checkPremiumizeKey("cle")).status).toBe("unreachable");
  });

  it("interroge Premiumize avec la clé en paramètre apikey, sans en-tête Authorization", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({ status: "success", customer_id: "1", premium_until: 1799999999 }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await checkPremiumizeKey("  ma clé  ");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      `https://www.premiumize.me/api/account/info?apikey=${encodeURIComponent("ma clé")}`,
    );
    expect(init.headers).toEqual({ Accept: "application/json" });
  });
});
