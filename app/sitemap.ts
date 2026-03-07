import type { MetadataRoute } from "next";

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
    }
  ];
}
