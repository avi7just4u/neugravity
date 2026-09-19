import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ExternalLink, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export const metadata: Metadata = { title: "Review Queue" }

// Demo candidates for the review queue UI
const demoCandidates = [
  {
    id: "1",
    headline: "Anthropic releases Claude 4 with extended context window",
    source: "techcrunch.com",
    sourceUrl: "#",
    publishedAt: "2 hours ago",
    category: "AI",
    importance: 9,
    aiSummary: "Anthropic has announced Claude 4, featuring a significantly extended context window and improved reasoning capabilities. The model shows substantial improvements in coding and analysis tasks.",
    entities: ["Anthropic", "Claude", "AI"],
    duplicateLikelihood: "low",
    status: "pending",
  },
  {
    id: "2",
    headline: "GitHub introduces new code review AI features",
    source: "github.blog",
    sourceUrl: "#",
    publishedAt: "5 hours ago",
    category: "Developer",
    importance: 7,
    aiSummary: "GitHub has launched AI-powered code review suggestions directly in pull requests, helping developers identify potential issues and improvements during the review process.",
    entities: ["GitHub", "AI", "Code Review"],
    duplicateLikelihood: "medium",
    status: "pending",
  },
  {
    id: "3",
    headline: "AWS announces new AI services at re:Invent",
    source: "aws.amazon.com",
    sourceUrl: "#",
    publishedAt: "1 day ago",
    category: "Cloud",
    importance: 8,
    aiSummary: "Amazon Web Services revealed a suite of new AI services at its annual re:Invent conference, expanding Bedrock with additional foundation models and new developer tooling.",
    entities: ["AWS", "Amazon", "AI", "Cloud"],
    duplicateLikelihood: "low",
    status: "pending",
  },
]

export default function ReviewQueuePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Review Queue</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            AI-discovered candidates awaiting editorial review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{demoCandidates.length} pending</Badge>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {["Inbox", "AI Drafts", "Needs Review", "Approved", "Scheduled", "Published", "Rejected"].map((tab, i) => (
          <button
            key={tab}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              i === 0
                ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab}
            {i === 0 && (
              <span className="ml-1.5 text-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-1.5 py-0.5 rounded-full">
                {demoCandidates.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Candidate list */}
      <div className="space-y-4">
        {demoCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{candidate.category}</Badge>
                    <Badge
                      variant={candidate.importance >= 9 ? "destructive" : candidate.importance >= 7 ? "warning" : "secondary"}
                      className="text-xs"
                    >
                      Priority {candidate.importance}/10
                    </Badge>
                    {candidate.duplicateLikelihood === "medium" && (
                      <Badge variant="warning" className="text-xs">Possible duplicate</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{candidate.headline}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {candidate.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {candidate.publishedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    Edit
                  </Button>
                  <Button size="sm" className="gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              </div>

              {/* AI Summary */}
              <div className="mt-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  AI-generated summary — verify before publishing
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{candidate.aiSummary}</p>
              </div>

              {/* Entities */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-zinc-400">Detected entities:</span>
                {candidate.entities.map((entity) => (
                  <Badge key={entity} variant="outline" className="text-xs">{entity}</Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
