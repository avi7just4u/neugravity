import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"

  const privateRoutes = ["/admin/", "/api/", "/login", "/signup", "/learn/dashboard", "/courses/"]

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
      // Allow major search crawlers full access to public content
      {
        userAgent: ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot"],
        allow: "/",
        disallow: ["/admin/", "/api/", "/learn/dashboard", "/courses/"],
      },
      // AI crawlers — allowed for discovery; revisit per policy
      {
        userAgent: ["GPTBot", "ClaudeBot", "Amazonbot", "anthropic-ai"],
        allow: "/",
        disallow: ["/admin/", "/api/", "/learn/dashboard", "/courses/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
