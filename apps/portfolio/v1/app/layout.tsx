import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Syed Adnan Ali - Software Developer & Founder",
  description: "Full-stack developer and founder of Electroplix, specializing in serverless architectures, web development, and AI integration with expertise in Next.js, React, TypeScript, and Python.",
  keywords: "software developer, full-stack developer, serverless architecture, Cloudflare Workers, Next.js, React, TypeScript, Python, web development, Electroplix",
  authors: [
    {
      name: "Syed Adnan Ali",
      url: "https://www.linkedin.com/in/syedadnanali99",
    },
  ],
  creator: "Syed Adnan Ali",
  publisher: "Syed Adnan Ali",
  openGraph: {
    title: "Syed Adnan Ali - Software Developer & Founder of Electroplix",
    description: "Full-stack developer specializing in serverless architectures, web development, and AI integration with expertise in Next.js, React, TypeScript, and Python.",
    url: "https://adnanthecoder.com",
    siteName: "Syed Adnan Ali Portfolio",
    images: [
      {
        url: "/assets/electroplix_landingPage.png",
        width: 1200,
        height: 630,
        alt: "Syed Adnan Ali - Software Developer Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syed Adnan Ali - Software Developer & Founder",
    description: "Full-stack developer specializing in serverless architectures, web development, and AI integration with expertise in Next.js, React, TypeScript, and Python.",
    images: ["/assets/electroplix_landingPage.png"],
    creator: "@SyedAdnanAli",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://adnanthecoder.com",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script id="schema-script" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Syed Adnan Ali",
            url: "https://adnanthecoder.com",
            jobTitle: "Software Developer",
            worksFor: {
              "@type": "Organization",
              name: "Electroplix",
              url: "https://electroplix.com"
            },
            description: "Full-stack developer and founder of Electroplix, specializing in serverless architectures, web development, and AI integration.",
            sameAs: [
              "https://www.linkedin.com/in/syedadnanali99",
              "https://github.com/Adnan-The-Coder"
            ],
            knowsAbout: [
              "Web Development",
              "Serverless Architecture",
              "Cloudflare Workers",
              "Next.js",
              "React",
              "TypeScript",
              "Python",
              "Node.js",
              "API Development"
            ],
            alumniOf: {
              "@type": "EducationalOrganization",
              name: "Muffakham Jah College of Engineering & Technology",
              sameAs: "https://mjcollege.ac.in/"
            },
            image: "/assets/profile-image.jpg"
          })}
        </Script>
      </body>
    </html>
  );
}