export const BRANDING = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "MetaRepo",
  tagline:
    "The Development Universe — one open monorepo for everything I build, with Google auth and waitlist access.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://metarepo.adnanbuilds.online",
} as const;
