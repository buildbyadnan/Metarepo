import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { BRANDING } from "@/config/branding";
import "./global.css";

export const metadata: Metadata = {
  title: {
    default: BRANDING.name,
    template: `%s · ${BRANDING.name}`,
  },
  description: BRANDING.tagline,
  metadataBase: new URL(BRANDING.url),
  openGraph: {
    title: BRANDING.name,
    description: BRANDING.tagline,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BRANDING.name,
    description: BRANDING.tagline,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Sora:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
