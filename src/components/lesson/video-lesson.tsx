interface VideoLessonProps {
  videoUrl: string
  durationSeconds: number | null
}

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be")
}

function toYouTubeEmbed(url: string): string {
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
  if (url.includes("youtube.com/embed/")) return url
  return url
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function VideoLesson({ videoUrl, durationSeconds }: VideoLessonProps) {
  const embedUrl = isYouTubeUrl(videoUrl) ? toYouTubeEmbed(videoUrl) : videoUrl

  return (
    <div className="space-y-3">
      <div className="aspect-video rounded-xl overflow-hidden bg-zinc-950 shadow-lg">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Lesson video"
        />
      </div>
      {durationSeconds && (
        <p className="text-xs text-zinc-400 text-center">{formatDuration(durationSeconds)}</p>
      )}
    </div>
  )
}
