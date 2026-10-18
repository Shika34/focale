import { TutorialGuide } from "@/components/TutorialGuide";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";

const DESCRIPTION =
  "Treize tutoriels courts : compte Nuvio, débrideurs TorBox, AllDebrid, Real-Debrid et Premiumize, clés TMDB, TheTVDB, MDBList, profil Lumio, réglage VF + VOSTFR, StreamFusion (facultatif), suivi Trakt (facultatif) et recommandations Bingecat (facultatif), dans l'ordre où l'assistant vous les demande.";

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
