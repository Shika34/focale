import { AioMetadataViewer } from "@/components/AioMetadataViewer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuration AIO Metadata FR — Nuvio",
  description: "Configuration complète AIO Metadata en français avec 107 catalogues et intégration Gemini AI.",
};

export default function AioMetadataPage() {
  return (
    <div className="pt-6">
      <AioMetadataViewer />
    </div>
  );
}
