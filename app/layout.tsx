import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Header } from "@/components/Header";
import { Preloader } from "@/components/Preloader";
import { Environment } from "@/components/Environment";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const arabicMark = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["500"],
  variable: "--font-arabic-mark",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "computational physics",
    "ocean dynamics",
    "numerical modeling",
    "QGSW",
    "MITgcm",
    "CUDA",
    "HPC",
    "scientific computing",
  ],
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
    images: ["/og-image.png"],
  },
  icons: {
    // ?v=5 busts browser caches still holding the pre-rebrand icon
    icon: [
      { url: "/favicon.ico?v=5", sizes: "any" },
      { url: "/icon-192.png?v=5", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-touch-icon.png?v=5",
    shortcut: "/favicon.ico?v=5",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#05060e" },
  ],
};

const themeInit = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");var d=t?t==="dark":true;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: site.role,
  affiliation: { "@type": "CollegeOrUniversity", name: "American University of Beirut" },
  sameAs: [site.github, site.linkedin],
  knowsAbout: [
    "Computational physics",
    "Ocean dynamics",
    "Quasi-geostrophic shallow-water equations",
    "MITgcm",
    "CUDA",
    "High-performance computing",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${arabicMark.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </head>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <Environment />
        <Preloader />
        <Header />
        <main id="content" className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
