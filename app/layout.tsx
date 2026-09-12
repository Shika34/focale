import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0E14",
};

export const metadata: Metadata = {
  title: "NUVIO France — Collections, AIO Metadata & Addons",
  description: "Plateforme francophone pour configurer vos collections Nuvio personnalisées, votre configuration AIO Metadata et vos addons essentiels.",
  keywords: ["Nuvio", "Stremio", "Collections Nuvio FR", "AIO Metadata", "Torrentio", "Debrid", "Kaptain Collection"],
  authors: [{ name: "Mitch / Nuvio FR" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        {/* Cinematic Backdrop glow layers */}
        <div className="cinematic-backdrop" />
        
        {/* Header navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 relative z-10">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  );
}
