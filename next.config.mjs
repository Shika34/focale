/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

/**
 * En-têtes de sécurité appliqués à toutes les réponses (Vercel les reprend tels quels).
 * La CSP autorise l'inline : Next.js injecte son bootstrap et ses styles en ligne.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://image.tmdb.org",
  "font-src 'self' data:",
  // Seuls appels sortants du navigateur : l'API Nuvio (comptes, collections, addons).
  "connect-src 'self' https://api.nuvio.tv",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true,
    // Aucune image distante n'est affichée : les captures sont servies depuis /public.
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
