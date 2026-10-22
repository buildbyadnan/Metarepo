export const BRANDING = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "YourApp",
  tagline: "Production-ready auth, payments, and infrastructure — wired up and deployable in minutes.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;
