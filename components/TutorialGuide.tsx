"use client";

import { useState } from "react";
import { TorboxPromoBanner } from "@/components/TorboxPromoBanner";
import { NuvioConfiguratorModal } from "@/components/NuvioConfiguratorModal";
import {
  Sparkles,
  Tv,
  Zap,
  Key,
  Layers,
  Box,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Film,
  Globe,
  Radio,
  UserCheck,
} from "lucide-react";

export function TutorialGuide() {
  const [configModalOpen, setConfigModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Guide Ultime Nuvio France</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Configuration Automatique &{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            100% en Français
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          L&apos;assistant vous guide étape par étape : compte Nuvio, clés API, manifest Lumio avec TorBox,
          puis envoi final vers votre profil Nuvio.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setConfigModalOpen(true)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-400 hover:to-purple-500 shadow-glow hover:shadow-glow-lg transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ouvrir l&apos;assistant de configuration</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* STEP 1: COMPTE NUVIO (Création Automatique) */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400">
            1
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Votre compte Nuvio en toute simplicité</h2>
            <span className="text-xs text-slate-400">Création automatique ou connexion instantanée</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong className="text-white block mb-0.5">Aucune inscription préalable nécessaire !</strong>
            Si vous n&apos;avez pas encore de compte Nuvio, le configurateur automatique va le créer pour vous en
            arrière-plan dès que vous indiquez votre email et votre mot de passe. Vous pourrez ensuite vous connecter
            directement sur l&apos;application Nuvio de votre téléviseur avec ces identifiants.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <a
            href="https://nuvio.tv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold glass-panel hover:bg-surface-hover text-white border border-surface-border"
          >
            <span>Découvrir l&apos;application Nuvio TV</span>
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          </a>
        </div>
      </section>

      {/* STEP 2: DEBRIDEUR TORBOX */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400">
            2
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">S&apos;inscrire chez le débrideur : TorBox</h2>
            <span className="text-xs text-slate-400">Flux 4K instantanés, sans attente et sans risque</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Pour streamer des vidéos en très haute définition (4K HDR, Dolby Atmos) avec des pistes audio en
          français (VFF / Multi) sans aucun ralentissement, un compte débrideur est indispensable. TorBox est
          le partenaire recommandé et s&apos;intègre nativement à Nuvio.
        </p>

        {/* Torbox banner component */}
        <TorboxPromoBanner />
      </section>

      {/* STEP 3: CONFIGURATEUR AUTOMATIQUE */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-glow space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400">
            3
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Set Up &amp; Send to Nuvio : étape par étape
            </h2>
            <span className="text-xs text-slate-400">
              Collection complète 756 dossiers + Addons streaming indispensables
            </span>
          </div>
        </div>

        {/* Auto-installed services info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: "AIO Metadata",
              desc: "Configuration personnalisable avec vos clés TMDB, TVDB et MDBList.",
              color: "text-cyan-400",
              border: "border-cyan-500/20",
              bg: "bg-cyan-500/5",
            },
            {
              name: "Lumio + TorBox",
              desc: "Ajout de votre manifest Lumio personnalisé généré avec TorBox.",
              color: "text-indigo-400",
              border: "border-indigo-500/20",
              bg: "bg-indigo-500/5",
            },
            {
              name: "BingeCat",
              desc: "Recommandations intelligentes via l'instance publique.",
              color: "text-emerald-400",
              border: "border-emerald-500/20",
              bg: "bg-emerald-500/5",
            },
          ].map(({ name, desc, color, border, bg }) => (
            <div key={name} className={`p-4 rounded-2xl ${bg} border ${border} flex flex-col gap-2`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${color} shrink-0`} />
                <span className={`font-bold text-sm ${color}`}>{name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Ouvrez l&apos;assistant : indiquez votre compte Nuvio, votre clé API TorBox (indispensable pour regarder),
          et laissez-le créer votre configuration AIO Metadata. Vos clés TMDB / TheTVDB / MDBList sont optionnelles ;
          pour Lumio, collez le lien de manifest de votre profil. Chaque étape explique où récupérer les clés et comment créer un compte.
        </p>

        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            <strong className="text-white block mb-0.5">Prêt à démarrer ?</strong>
            Chaque information est demandée au bon moment, avec des liens directs vers les sites nécessaires.
          </div>
          <button
            onClick={() => setConfigModalOpen(true)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 shadow-glow transition-all shrink-0"
          >
            Ouvrir l&apos;assistant de configuration
          </button>
        </div>
      </section>


      {/* Modal */}
      <NuvioConfiguratorModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
}
