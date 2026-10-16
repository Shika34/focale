import { describe, expect, it } from "vitest";

import {
  findProfileByName,
  profileNotFoundMessage,
  signInErrorMessage,
  UPDATE_SIGN_IN_HINT,
} from "@/lib/collections-update";

const profiles = [
  { profile_index: 1, name: "FOCALE" },
  { profile_index: 2, name: "Profil 2" },
  { profile_index: 6, name: "Salon" },
];

describe("findProfileByName", () => {
  it("retrouve un profil quel que soit la casse et les espaces saisis", () => {
    expect(findProfileByName(profiles, "focale")?.profile_index).toBe(1);
    expect(findProfileByName(profiles, "  Focale  ")?.profile_index).toBe(1);
    expect(findProfileByName(profiles, "SALON")?.profile_index).toBe(6);
  });

  it("ne rend rien quand le nom ne correspond à aucun profil", () => {
    expect(findProfileByName(profiles, "Cinéma")).toBeNull();
  });

  it("ne rend rien pour un nom vide ou fait d'espaces", () => {
    expect(findProfileByName(profiles, "")).toBeNull();
    expect(findProfileByName(profiles, "   ")).toBeNull();
  });

  it("accepte une liste vide", () => {
    expect(findProfileByName([], "Focale")).toBeNull();
  });
});

describe("profileNotFoundMessage", () => {
  it("nomme les profils existants pour que l'utilisateur corrige sa saisie", () => {
    const message = profileNotFoundMessage("Cinéma", profiles);

    expect(message).toContain("Cinéma");
    expect(message).toContain("FOCALE");
    expect(message).toContain("Profil 2");
    expect(message).toContain("Salon");
  });

  it("annonce un compte sans profil plutôt qu'une liste vide", () => {
    const message = profileNotFoundMessage("Focale", []);

    expect(message).toContain("Focale");
    expect(message).toContain("aucun profil");
  });

  it("renvoie vers l'assistant quand le nom n'existe pas encore", () => {
    expect(profileNotFoundMessage("Focale", profiles)).toContain("Configurer mon Nuvio");
  });
});

describe("signInErrorMessage", () => {
  it("ajoute la marche à suivre à un refus d'identifiants", () => {
    const message = signInErrorMessage(new Error("Invalid login credentials"));

    expect(message).toContain("refusé");
    expect(message).toContain(UPDATE_SIGN_IN_HINT);
    expect(message).toContain("Configurer mon Nuvio");
  });

  it("ne parle pas de première installation quand Nuvio est injoignable", () => {
    const message = signInErrorMessage(new Error("Failed to fetch"));

    expect(message).toContain("connexion");
    expect(message).not.toContain(UPDATE_SIGN_IN_HINT);
  });
});
