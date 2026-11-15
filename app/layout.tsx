import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { site } from "@/content/site";
import { SITE_URL, ld, sameAs, siteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.name,
    title: site.name,
    description: site.description,
    locale: "en_US",
    firstName: site.firstName,
    lastName: site.lastName,
    images: [{ url: site.homeImage, alt: site.homeImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable summary" />
        {sameAs.map((u) => (
          <link key={u} rel="me" href={u} />
        ))}
        {site.contact.tallyFormId && (
          <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
        )}
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(siteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
