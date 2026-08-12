import { MetadataRoute } from "next";
import db from "@/lib/db";
import { articlesData } from "@/app/blog/[slug]/page";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skylightvillagelb.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic accommodation slugs
  const accommodations = await db.accommodation.findMany({
    select: { slug: true },
  });

  // Fetch dynamic events
  const events = await db.event.findMany({
    select: { id: true },
  });

  const accommodationUrls = accommodations.map((acc) => ({
    url: `${baseUrl}/stay/${acc.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const eventUrls = events.map((e) => ({
    url: `${baseUrl}/events/${e.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogUrls = Object.keys(articlesData).map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stay`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...accommodationUrls, ...eventUrls, ...blogUrls];
}
