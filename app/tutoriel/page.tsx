import { TutorialGuide } from "@/components/TutorialGuide";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Tutoriels — comptes, clés API et Lumio | ${SITE.name}`,
  description:
    "Huit tutoriels courts : compte Nuvio, débrideurs TorBox et AllDebrid, clés TMDB, TheTVDB, MDBList, profil Lumio, et le suivi Trakt (facultatif), dans l'ordre où l'assistant vous les demande.",
};

export default function TutorielPage() {
  return <TutorialGuide />;
}
