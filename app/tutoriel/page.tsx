import { TutorialGuide } from "@/components/TutorialGuide";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutoriel Nuvio France — Guide Complet, Addons & Débrideur",
  description: "Guide étape par étape pour configurer votre Nuvio en France : Torbox, clés API, collection 756 dossiers et les 10 addons indispensables.",
};

export default function TutorielPage() {
  return (
    <div className="pt-4">
      <TutorialGuide />
    </div>
  );
}
