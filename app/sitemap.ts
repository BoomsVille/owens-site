import type { MetadataRoute } from "next";

import { servicePages } from "@/lib/servicePages";
import { getSiteOrigin } from "@/lib/siteUrl";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteOrigin();

  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/desktop`,
      changeFrequency: "monthly",
      priority: 0.6
    },
    ...servicePages.map((service) => ({
      url: `${siteUrl}/services/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.75
    }))
  ];
}
