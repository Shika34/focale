import { afterEach, describe, expect, it, vi } from "vitest";

import { NuvioApi, authErrorMessage } from "@/lib/nuvio-api";

/**
 * `autoAuth` est la vérification du compte déclenchée par « Suivant » à
 * l'étape 1 du configurateur : connexion si le compte existe, création sinon,
 * et message explicite quand le mot de passe ne correspond pas.
 */

interface FakeAuth {
  /** Mot de passe accepté par `/auth/v1/token` (compte existant). */
  password: string | null;
  /** Email accepté par `/auth/v1/signup` (compte déjà pris) ou `null`. */
  registered: string | null;
  calls: string[];
}

function stubAuth(state: FakeAuth, options: { network?: boolean } = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL, init: RequestInit = {}) => {
      if (options.network) throw new TypeError("Failed to fetch");

      const path = String(url);
      const body = JSON.parse(String(init.body ?? "{}")) as { email: string; password: string };
      state.calls.push(path);

      if (path.includes("grant_type=password")) {
        if (state.password !== null && body.password === state.password) {
          return new Response(JSON.stringify({ access_token: "jeton", user: { id: "u-1" } }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ msg: "Invalid login credentials" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path.includes("/auth/v1/signup")) {
        if (state.registered !== null && body.email === state.registered) {
          return new Response(JSON.stringify({ msg: "User already registered" }), {
            status: 422,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ access_token: "jeton-neuf", user: { id: "u-2" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("unknown", { status: 404 });
    }),
  );
}

function newState(overrides: Partial<FakeAuth> = {}): FakeAuth {
  return { password: null, registered: null, calls: [], ...overrides };
}

describe("NuvioApi.autoAuth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("accepte un compte existant dont le mot de passe est correct", async () => {
    const state = newState({ password: "secret-nuvio" });
    stubAuth(state);

    const result = await NuvioApi.autoAuth("  utilisateur@exemple.com  ", "secret-nuvio");

    expect(result).toEqual({ token: "jeton", userId: "u-1", isNewAccount: false });
    // Email rogné avant l'envoi, et aucune inscription tentée.
    expect(state.calls).toHaveLength(1);
    expect(state.calls[0]).toContain("grant_type=password");
  });

  it("crée le compte quand l'email est inconnu", async () => {
    const state = newState();
    stubAuth(state);

    const result = await NuvioApi.autoAuth("nouveau@exemple.com", "secret-nuvio");

    expect(result).toEqual({ token: "jeton-neuf", userId: "u-2", isNewAccount: true });
    expect(state.calls[1]).toContain("/auth/v1/signup");
  });

  it("refuse une connexion quand le compte existe déjà avec un autre mot de passe", async () => {
    const state = newState({ registered: "utilisateur@exemple.com" });
    stubAuth(state);

    await expect(NuvioApi.autoAuth("utilisateur@exemple.com", "mauvais")).rejects.toThrow(
      /existe déjà.*mot de passe/i,
    );
  });

  it("remonte une erreur réseau sans la confondre avec un mot de passe erroné", async () => {
    stubAuth(newState(), { network: true });

    await expect(NuvioApi.autoAuth("utilisateur@exemple.com", "secret-nuvio")).rejects.toThrow(
      /connexion/i,
    );
  });
});

describe("authErrorMessage", () => {
  it("traduit une panne réseau en message utilisable à l'écran", () => {
    expect(authErrorMessage(new TypeError("Failed to fetch"))).toMatch(/connexion/i);
  });

  it("traduit un mot de passe refusé", () => {
    expect(authErrorMessage(new Error("Invalid login credentials"))).toMatch(/mot de passe/i);
  });

  it("laisse tel quel un message déjà explicite", () => {
    const message = "Ce compte Nuvio existe déjà, mais le mot de passe est erroné.";
    expect(authErrorMessage(new Error(message))).toBe(message);
  });
});
