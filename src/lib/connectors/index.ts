import { RSSConnector } from "./rss.connector"
import type { SourceConnector } from "./types"

const CONNECTORS: Record<string, SourceConnector> = {
  "rss-generic": new RSSConnector(),
  "rss-status": new RSSConnector({ contentType: "status" }),
}

export function getConnector(parser_key: string | null): SourceConnector {
  return CONNECTORS[parser_key ?? "rss-generic"] ?? CONNECTORS["rss-generic"]
}

export type { SourceConnector, NormalizedItem } from "./types"
