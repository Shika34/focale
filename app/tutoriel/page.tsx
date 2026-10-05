import { TutorialGuide } from "@/components/TutorialGuide";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";

const DESCRIPTION =
  "Dix tutoriels courts : compte Nuvio, débrideurs TorBox et AllDebrid, clés TMDB, TheTVDB, MDBList, profil Lumio, réglage VF + VOSTFR, StreamFusion (facultatif) et le suivi Trakt (facultatif), dans l'ordre où l'assistant vous les demande.";

export const metadata: Metadata = {
  alternates: { canonical: "/tutoriel" },
  title: `Tutoriels : comptes, clés API et Lumio | ${SITE.name}`,
  description: DESCRIPTION,
  openGraph: {
    title: `Tutoriels : comptes, clés API et Lumio | ${SITE.name}`,
    description: DESCRIPTION,
  },
};

export default function TutorielPage() {
  return <TutorialGuide />;
}
