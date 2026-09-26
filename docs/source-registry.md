# NeuGravity Source Registry
**Last updated:** 2026-09-21
**Purpose:** Canonical list of all content sources for the NeuGravity platform.

---

## Summary
- Active sources: 2
- Ready to activate: 16
- Failed (needs investigation): 1
- Disabled/Demo: 6
- Total: 25

---

## Source Taxonomy

### Categories
| Category | Description |
|----------|-------------|
| ai | Artificial intelligence, ML, LLM tools and research |
| cloud | Cloud platforms: AWS, GCP, Azure, and cloud-native tools |
| developer | Software development tools, languages, frameworks |
| security / cybersecurity | Cybersecurity news, vulnerabilities, best practices |
| infrastructure | DevOps, networking, containers, orchestration |
| databases | Databases, data management, storage |
| enterprise | Enterprise software, B2B, CRM, ERP |
| open-source | Open source projects, foundations, communities |
| productivity | Developer and team productivity tools |
| hardware | Hardware, silicon, semiconductors, devices |
| technology_companies | Company news, funding, products |
| general | Broad technology coverage |

### Source Types
| Type | Description |
|------|-------------|
| official_blog | Official company or product blog |
| engineering_blog | Technical engineering team blog |
| release_feed | Changelog or release announcement feed |
| rss | General RSS/Atom news feed |
| api | API-based data source |
| status | Status page (operational incidents) |
| security_advisory | Security vulnerability/advisory feed |
| youtube | YouTube channel |
| manual | Manually curated or imported |

### Trust Levels
| Level | Label | Description |
|-------|-------|-------------|
| primary | Primary | The authoritative source for a topic (e.g., official CVE database, Krebs on Security) |
| official | Official | Official company or organization source |
| reputable_secondary | Reputable Secondary | Established, reputable publication |
| community | Community | Community-contributed content |

### Source Priority (1-10)
10 = Highest priority (breaking news, high signal)
1 = Lowest priority (background noise)

---

## ACTIVE Sources

Sources with `active = true` and `health_status = healthy`. Currently ingesting.

| Name | Domain | Type | Category | Trust | Priority | Poll | Items | Last Success | Feed URL |
|------|--------|------|----------|-------|----------|------|-------|--------------|----------|
| GitHub Blog | github.blog | rss | developer | official | 9 | 1h | 10 | 2026-09-20 22:19 UTC | https://github.blog/feed/ |
| The Verge - AI | theverge.com | rss | _(unset)_ | reputable_secondary | 5 | 6h | 20 | 2026-09-20 07:26 UTC | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

**Data notes:**
- The Verge - AI has no `category` set. Should be `ai`.
- GitHub Blog has no `rss_url` (only `feed_url`) — consistent with other sources, no issue.

---

## FAILED Sources

Sources that attempted ingestion but are currently in a failed state. Requires investigation before re-enabling.

| Name | Domain | Type | Category | Trust | Priority | Poll | Last Error | Feed URL |
|------|--------|------|----------|-------|----------|------|------------|----------|
| Anthropic News | anthropic.com | rss | ai | official | 9 | 1h | 2026-09-21 00:19 UTC | https://www.anthropic.com/rss.xml |

**Investigation steps:** Verify `https://www.anthropic.com/rss.xml` returns valid RSS. Anthropic may not publish a standard RSS feed — check `https://www.anthropic.com/news` for a feed link or consider scraping the news page.

---

## READY TO ACTIVATE

Sources with valid feed URLs and complete configuration, not yet enabled. All have `active = false` and `health_status = unknown`.

Before activating each source, complete the [Source Activation Checklist](#source-activation-checklist) below.

| Name | Domain | Type | Category | Trust | Priority | Poll | Feed URL |
|------|--------|------|----------|-------|----------|------|----------|
| AWS News Blog | aws.amazon.com | rss | cloud | official | 9 | 1h | https://aws.amazon.com/blogs/aws/feed/ |
| Google Cloud Blog | cloud.google.com | rss | cloud | official | 9 | 1h | https://cloudblog.withgoogle.com/rss/ |
| Google DeepMind Blog | deepmind.google | rss | ai | official | 9 | 2h | https://deepmind.google/blog/rss.xml |
| Krebs on Security | krebsonsecurity.com | rss | security | primary | 9 | 1h | https://krebsonsecurity.com/feed/ |
| Microsoft Azure Blog | azure.microsoft.com | rss | cloud | official | 9 | 1h | https://azure.microsoft.com/en-us/blog/feed/ |
| PostgreSQL News | postgresql.org | rss | databases | official | 9 | 24h | https://www.postgresql.org/news/pwr/rss/ |
| CNCF Blog | cncf.io | rss | infrastructure | official | 8 | 2h | https://www.cncf.io/blog/feed/ |
| HashiCorp Blog | hashicorp.com | rss | infrastructure | official | 8 | 2h | https://www.hashicorp.com/blog/feed.xml |
| Hugging Face Blog | huggingface.co | rss | ai | official | 8 | 1h | https://huggingface.co/blog/feed.xml |
| InfoQ | infoq.com | rss | developer | reputable_secondary | 8 | 1h | https://feed.infoq.com/ |
| Linux Foundation Blog | linuxfoundation.org | rss | open-source | official | 8 | 24h | https://www.linuxfoundation.org/blog/feed |
| MongoDB Blog | mongodb.com | rss | databases | official | 8 | 2h | https://www.mongodb.com/developer/feed.xml |
| Vercel Blog | vercel.com | rss | developer | official | 8 | 1h | https://vercel.com/blog/rss.xml |
| The Hacker News | thehackernews.com | rss | security | reputable_secondary | 7 | 30m | https://feeds.feedburner.com/TheHackersNews |
| The New Stack | thenewstack.io | rss | infrastructure | reputable_secondary | 7 | 1h | https://thenewstack.io/feed/ |
| Wired | wired.com | rss | general | reputable_secondary | 7 | 1h | https://www.wired.com/feed/rss |

**Recommended activation order (by trust level, then impact):**
1. Krebs on Security (primary trust, security — high value)
2. AWS News Blog, Google Cloud Blog, Microsoft Azure Blog (official cloud coverage)
3. Google DeepMind Blog (official AI research)
4. PostgreSQL News (official, relevant to platform stack)
5. CNCF Blog, HashiCorp Blog (infrastructure ecosystem)
6. Hugging Face Blog (AI community)
7. Remaining reputable_secondary sources

---

## DISABLED / DEMO

Sources that are intentionally disabled. These include demo records created during initial platform setup. Do not activate without replacing placeholder data.

| Name | Domain | Type | Category | Trust | Priority | Notes |
|------|--------|------|----------|-------|----------|-------|
| OpenAI Blog [DEMO] | openai.com | official_blog | ai | official | 9 | Demo record; has both `rss_url` and `feed_url` set (inconsistency). Feed URL: https://openai.com/news/rss.xml |
| TechCrunch [DEMO] | techcrunch.com | news | ai | reputable_secondary | 7 | Demo record; source_type is `news` (not a defined type). Has both `rss_url` and `feed_url`. Feed: https://techcrunch.com/category/artificial-intelligence/feed/ |
| Hacker News [DEMO] | news.ycombinator.com | api | _(unset)_ | reputable_secondary | 6 | Demo record; API-based, no feed_url — requires HN Algolia API integration. No category set. |
| AWS Status | status.aws.amazon.com | status | _(unset)_ | reputable_secondary | 5 | Demo/disabled per notes. No category set. Feed: https://status.aws.amazon.com/rss/all.rss |
| GitHub Status | githubstatus.com | status | _(unset)_ | reputable_secondary | 5 | Demo/disabled per notes. No category set. Feed: https://www.githubstatus.com/history.rss |
| Vercel Status | vercel-status.com | status | _(unset)_ | reputable_secondary | 5 | Demo/disabled per notes. No category set. Feed: https://www.vercel-status.com/history.rss |

**Data issues in demo records:**
- OpenAI Blog [DEMO]: Both `rss_url` and `feed_url` are populated. The ingestion pipeline should use one canonical field — verify which field the poller reads.
- TechCrunch [DEMO]: `source_type = 'news'` is not a recognized type in the taxonomy. Should likely be `rss`.
- Hacker News [DEMO], AWS Status, GitHub Status, Vercel Status: `category` is NULL. These need a category before activation.

---

## Source Activation Checklist

For each new source before marking `active = true`:

- [ ] Feed URL returns valid RSS/Atom XML (curl or browser check)
- [ ] Items have correct timestamps (`source_published_at` populated, not null or epoch)
- [ ] Deduplication working (re-fetch produces 0 new items)
- [ ] Content normalizes correctly (`title`, `description`, `canonical_url` all present)
- [ ] AI enrichment produces reasonable summary
- [ ] Editorial queue shows item correctly under `/admin/editorial/news`
- [ ] `is_demo = false`
- [ ] Source attribution shown on news item (public-facing)
- [ ] `category` field is set (not NULL)
- [ ] `source_type` matches a recognized type in the taxonomy

---

## Proposed Sources (Not Yet Added)

Sources worth evaluating for future addition. Not yet in the database. Verify feed URLs are live before adding.

| Name | Domain | Feed URL | Category | Trust | Rationale |
|------|--------|----------|----------|-------|-----------|
| The Register | theregister.com | https://www.theregister.com/headlines.atom | developer / enterprise | reputable_secondary | Long-running, opinionated enterprise and developer tech news |
| IEEE Spectrum | spectrum.ieee.org | https://spectrum.ieee.org/feeds/feed.rss | hardware | reputable_secondary | Engineering and hardware coverage with academic credibility |
| ACM TechNews | technews.acm.org | https://technews.acm.org/archives.cfm | general | official | Curated academic/research tech news from ACM |
| Node.js Blog | nodejs.org | https://nodejs.org/en/feed/blog.xml | developer | official | Official release announcements and project news |
| Python Blog | blog.python.org | https://blog.python.org/feeds/posts/default | developer | official | Official Python Software Foundation blog |
| Rust Blog | blog.rust-lang.org | https://blog.rust-lang.org/feed.xml | developer | official | Official Rust language blog — releases, editions, RFCs |
| Go Blog | go.dev | https://go.dev/blog/feed.atom | developer | official | Official Go language blog — releases and ecosystem news |
| OWASP Blog | owasp.org | https://owasp.org/feed.xml | security | official | Web application security standards and community news |
| CISA Advisories | cisa.gov | https://www.cisa.gov/cybersecurity-advisories/all.xml | security | primary | US government cybersecurity advisories — high signal for critical vulns |
| Lobsters | lobste.rs | https://lobste.rs/rss | developer | community | High-quality developer link aggregator; invitation-only, lower noise than HN |
| Docker Blog | docker.com | https://www.docker.com/blog/feed/ | infrastructure | official | Container tooling, Docker Desktop, and ecosystem news |
| Cloudflare Blog | blog.cloudflare.com | https://blog.cloudflare.com/rss/ | infrastructure | official | Edge computing, security, networking — high technical quality |
| Red Hat Blog | redhat.com | https://www.redhat.com/en/rss/blog | open-source / enterprise | official | OpenShift, RHEL, enterprise Linux and open source strategy |
