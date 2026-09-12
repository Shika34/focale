import { AddonsList } from "@/components/AddonsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Addons Nuvio & Stremio — Sélection Francophone",
  description: "Catalogue d'addons incontournables pour Nuvio et Stremio : debrid, sous-titres FR et métadonnées.",
};

export default function AddonsPage() {
  return (
    <div className="pt-6">
      <AddonsList />
    </div>
  );
}
