import { TutorialGuide } from "@/components/TutorialGuide";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Tutoriels — comptes, clés API et Lumio | ${SITE.name}`,
  description:
    "Sept tutoriels courts : compte Nuvio, débrideurs TorBox et AllDebrid, clés TMDB, TheTVDB, MDBList et profil Lumio, dans l'ordre où l'assistant vous les demande.",
};

export default function TutorielPage() {
  return <TutorialGuide />;
}
