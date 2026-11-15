import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Everyone may read the site, including AI search and answer engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
