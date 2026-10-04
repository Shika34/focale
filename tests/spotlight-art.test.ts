import { describe, expect, it } from "vitest";

import { spotlightArtVersion, versionSpotlightArt } from "@/lib/spotlight-art";

const COVER =
  "https://raw.githubusercontent.com/ImKaptain/nuvio-art/main/art/spotlights/spotlight-the-headliner/v2/spotlight-the-headliner-cover.png";
const LOGO =
  "https://raw.githubusercontent.com/ImKaptain/nuvio-art/main/art/spotlights/spotlight-the-visionary/v2/spotlight-the-visionary-logo.png";
const UNRELATED = "https://raw.githubusercontent.com/ImKaptain/nuvio-art/main/art/genres/action-cover.png";

function spotlightCollection() {
  return [
    { id: "collection-4R2MRZSB", title: "Genres", folders: [{ coverImageUrl: UNRELATED }] },
    {
      id: "collection-SPOTLIGHTS",
      title: "En vedette",
      folders: [
        { id: "folder-SPOTHEAD", coverImageUrl: COVER, titleLogoUrl: LOGO, heroVideoUrl: "" },
        { id: "folder-SPOTVISI", coverImageUrl: LOGO, heroBackdropUrl: COVER },
      ],
    },
  ];
}

describe("spotlightArtVersion", () => {
  it("garde la même version pendant les quatorze jours d'un cycle", () => {
    expect(spotlightArtVersion(new Date("2026-10-02T00:00:00Z"))).toBe(
      spotlightArtVersion(new Date("2026-10-15T23:59:00Z")),
    );
  });

  it("change de version au cycle suivant", () => {
    expect(spotlightArtVersion(new Date("2026-10-02T00:00:00Z"))).not.toBe(
      spotlightArtVersion(new Date("2026-10-16T00:00:00Z")),
    );
  });
});

describe("versionSpotlightArt", () => {
  it("ajoute la version aux visuels des dossiers En vedette", () => {
    const out = versionSpotlightArt(spotlightCollection(), "12");
    const [head, visi] = (out as { folders: Record<string, string>[] }[])[1].folders;

    expect(head.coverImageUrl).toBe(`${COVER}?v=12`);
    expect(head.titleLogoUrl).toBe(`${LOGO}?v=12`);
    expect(visi.heroBackdropUrl).toBe(`${COVER}?v=12`);
  });

  it("laisse les autres collections et les champs non visuels intacts", () => {
    const out = versionSpotlightArt(spotlightCollection(), "12") as {
      folders: Record<string, string>[];
    }[];

    expect(out[0].folders[0].coverImageUrl).toBe(UNRELATED);
    expect(out[1].folders[0].heroVideoUrl).toBe("");
  });

  it("remplace une version déjà posée au lieu de l'empiler", () => {
    const withVersion = versionSpotlightArt(spotlightCollection(), "12");
    const updated = versionSpotlightArt(withVersion, "13") as { folders: Record<string, string>[] }[];

    expect(updated[1].folders[0].coverImageUrl).toBe(`${COVER}?v=13`);
  });

  it("ne modifie pas la structure reçue", () => {
    const source = spotlightCollection();
    versionSpotlightArt(source, "12");

    expect(source[1].folders[0].coverImageUrl).toBe(COVER);
  });

  it("retourne l'entrée telle quelle si aucune collection En vedette n'est présente", () => {
    const source = [{ id: "collection-4R2MRZSB", folders: [] }];
    expect(versionSpotlightArt(source, "12")).toBe(source);
  });
});
