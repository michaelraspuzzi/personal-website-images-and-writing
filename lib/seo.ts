// Facts for search engines and AI answer engines, built from content/site.ts.
import { sections, site } from "@/content/site";
import { toPlain } from "./markup";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(/\/$/, "");

export const sameAs = site.social.map((s) => s.href).filter((h) => h.startsWith("http"));

const personId = `${SITE_URL}/#person`;
const websiteId = `${SITE_URL}/#website`;
const orgId = (i: number) => `${SITE_URL}/#org-${i}`;

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: site.name,
      url: SITE_URL,
      description: site.description,
      jobTitle: site.jobTitle,
      knowsAbout: site.topics,
      affiliation: site.organizations.map((_, i) => ({ "@id": orgId(i) })),
      sameAs,
    },
    ...site.organizations.map((o, i) => ({
      "@type": "Organization",
      "@id": orgId(i),
      name: o.name,
      url: o.url,
      description: o.description,
      member: { "@id": personId },
    })),
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_URL,
      name: site.name,
      description: site.description,
      inLanguage: "en-US",
      publisher: { "@id": personId },
    },
  ],
};

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profile`,
  url: SITE_URL,
  name: site.name,
  description: site.description,
  dateModified: site.updated,
  isPartOf: { "@id": websiteId },
  mainEntity: { "@id": personId },
};

// Serialize for a <script type="application/ld+json"> tag; escaping "<"
// keeps any text from closing the script early.
export const ld = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

// The whole essay as plain Markdown, for /llms.txt.
export function llmsText() {
  const body = sections
    .map((s) => {
      const lines = s.blocks.flatMap((b) => {
        if ("p" in b) return [toPlain(b.p)];
        if ("list" in b) return [b.list.map((l) => `- ${toPlain(l)}`).join("\n")];
        if ("quote" in b) return [`> ${b.quote} (${b.by})`];
        return [];
      });
      return `## ${s.label}\n\n${lines.join("\n\n")}`;
    })
    .join("\n\n");
  const links = [
    `- Contact: ${site.contact.tallyFormId ? `https://tally.so/r/${site.contact.tallyFormId}` : site.contact.href}`,
    ...site.social.map((s) => `- ${s.label === "x" ? "X" : s.label}: ${s.href}`),
  ].join("\n");
  return `# ${site.name}\n\n> ${site.description}\n\nLast updated: ${site.updated}. Website: ${SITE_URL}\n\n${toPlain(site.intro)}\n\n${body}\n\n## Elsewhere\n\n${links}\n`;
}
