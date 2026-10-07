import type { MetadataRoute } from "next";
import { locales } from "@/lib/locales";
import { getLanguageAlternates, getLocalizedUrl, sitePaths } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitePaths.flatMap((path) =>
    locales.map((locale) => ({
      url: getLocalizedUrl(locale, path),
      changeFrequency: path.startsWith("/guides") ? ("monthly" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : path.includes("calculator") ? 0.9 : 0.7,
      alternates: {
        languages: getLanguageAlternates(path),
      },
    })),
  );
}
