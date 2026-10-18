import { CollectionBrowser } from "@/components/CollectionBrowser";
import collectionCounts from "@/lib/collection-counts.json";
import { getCollectionsSummary } from "@/lib/nuvio-data";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";

const COUNT_LABEL = `${collectionCounts.folders} dossiers`;

export const metadata: Metadata = {
  alternates: { canonical: "/collections" },
  title: `Collections : ${COUNT_LABEL} en français | ${SITE.name}`,
  description: `Parcourez les ${collectionCounts.collections} collections francophones (${COUNT_LABEL}) installées dans votre profil Nuvio par l'assistant.`,
  openGraph: {
    title: `Collections : ${COUNT_LABEL} en français | ${SITE.name}`,
    description: `Parcourez les ${collectionCounts.collections} collections francophones (${COUNT_LABEL}) installées dans votre profil Nuvio par l'assistant.`,
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
