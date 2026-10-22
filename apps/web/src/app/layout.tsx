import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { BRANDING } from "@/config/branding";
import "./global.css";

export const metadata: Metadata = {
  title: BRANDING.name,
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
