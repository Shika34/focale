import { CollectionBrowser } from "@/components/CollectionBrowser";
import { getCollectionsSummary } from "@/lib/nuvio-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections Nuvio — 756 Dossiers en Français",
  description: "Explorez, filtrez et personnalisez votre pack de collections Nuvio avec 756 dossiers organisés.",
};

export default function CollectionsPage() {
  const collections = getCollectionsSummary();

  return (
    <div className="pt-6">
      <CollectionBrowser collections={collections} />
    </div>
  );
}
