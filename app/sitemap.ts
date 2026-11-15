import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: site.updated, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/llms.txt`, lastModified: site.updated, changeFrequency: "monthly", priority: 0.3 },
  ];
}
