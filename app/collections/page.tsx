import { CollectionBrowser } from "@/components/CollectionBrowser";
import { getCollectionsSummary } from "@/lib/nuvio-data";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/collections" },
  title: `Collections : 756 dossiers en français | ${SITE.name}`,
  description:
    "Parcourez les 18 collections francophones (756 dossiers) installées dans votre profil Nuvio par l'assistant.",
  openGraph: {
    title: `Collections : 756 dossiers en français | ${SITE.name}`,
    description:
      "Parcourez les 18 collections francophones (756 dossiers) installées dans votre profil Nuvio par l'assistant.",
  },
};

export default function CollectionsPage() {
  const collections = getCollectionsSummary();

  return (
    <div>
      <CollectionBrowser collections={collections} />
    </div>
  );
}
