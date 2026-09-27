import type { MetadataRoute } from "next"
import { TechnologyService } from "@/lib/services/technology.service"
import { ToolService } from "@/lib/services/tool.service"
import { ContentService } from "@/lib/services/content.service"
import { CompanyService } from "@/lib/services/company.service"
import { ComparisonService } from "@/lib/services/comparison.service"
import { CourseService } from "@/lib/services/course.service"
import { InterviewService } from "@/lib/services/interview.service"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/tech`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/news`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/tools`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/compare`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/companies`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/interviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/work`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/community`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${siteUrl}/status`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
    { url: `${siteUrl}/enterprise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ]

  const [techData, toolData, newsData, articleData, companyData, comparisonData, courseData, interviewData] =
    await Promise.allSettled([
      TechnologyService.getTechnologies({ perPage: 500 }),
      ToolService.getTools({ perPage: 500 }),
      ContentService.getPublishedNews({ perPage: 500 }),
      ContentService.getPublishedArticles({ perPage: 500 }),
      CompanyService.getCompanies({ perPage: 500 }),
      ComparisonService.getComparisons({ perPage: 500 }),
      CourseService.getCourses({ perPage: 500 }),
      InterviewService.getPublishedInterviews({ perPage: 500 }),
    ])

  const dynamicRoutes: MetadataRoute.Sitemap = []

  if (techData.status === "fulfilled") {
    for (const t of techData.value.data) {
      dynamicRoutes.push({
        url: `${siteUrl}/tech/${t.slug}`,
        lastModified: t.updated_at ? new Date(t.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  }

  if (toolData.status === "fulfilled") {
    for (const t of toolData.value.data) {
      dynamicRoutes.push({
        url: `${siteUrl}/tools/${t.slug}`,
        lastModified: t.updated_at ? new Date(t.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  }

  if (newsData.status === "fulfilled") {
    for (const n of newsData.value.data) {
      dynamicRoutes.push({
        url: `${siteUrl}/news/${n.slug}`,
        lastModified: n.published_at ? new Date(n.published_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }

  if (articleData.status === "fulfilled") {
    for (const a of articleData.value.data) {
      dynamicRoutes.push({
        url: `${siteUrl}/articles/${a.slug}`,
        lastModified: a.published_at ? new Date(a.published_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.7,
      })
    }
  }

  if (companyData.status === "fulfilled") {
    for (const c of companyData.value.data) {
      dynamicRoutes.push({
        url: `${siteUrl}/companies/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  }

  if (comparisonData.status === "fulfilled") {
    for (const c of comparisonData.value.data) {
      dynamicRoutes.push({
        url: `${siteUrl}/compare/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  }

  if (courseData.status === "fulfilled") {
    for (const c of courseData.value.data) {
      dynamicRoutes.push({ url: `${siteUrl}/courses/${c.slug}`, changeFrequency: "weekly", priority: 0.6 })
    }
  }

  if (interviewData.status === "fulfilled") {
    for (const i of interviewData.value.data) {
      dynamicRoutes.push({
        url: `${siteUrl}/interviews/${i.slug}`,
        lastModified: i.published_at ? new Date(i.published_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }

  return [...staticRoutes, ...dynamicRoutes]
}
