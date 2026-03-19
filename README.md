# KnowledgeSDK CLI

A beautiful, fully-featured command-line interface for [KnowledgeSDK](https://knowledgesdk.com) — extract, scrape, classify, search, and manage knowledge from any website.

## Installation

```bash
npm install -g @knowledgesdk/cli
```

Or use without installing:

```bash
npx @knowledgesdk/cli <command>
```

## Quick Start

```bash
# 1. Set your API key
npx knowledgesdk config --key sk_ks_your_key

# 2. Extract knowledge from a website
npx knowledgesdk extract https://competitor.com

# 3. Search your knowledge base
npx knowledgesdk search "pricing plans"
```

## Configuration

API keys are stored in `~/.knowledgesdk/config.json`.

```bash
# Set API key
npx knowledgesdk config --key sk_ks_your_key

# Set a custom API base URL
npx knowledgesdk config --url https://api.myinstance.com

# View current config
npx knowledgesdk config

# Clear stored config
npx knowledgesdk config --clear
```

You can also use environment variables instead of the config file:

```bash
export KNOWLEDGESDK_API_KEY=sk_ks_your_key
export KNOWLEDGESDK_BASE_URL=https://api.knowledgesdk.com  # optional
```

## Commands

### `extract` — Extract knowledge from a website

Crawls a website and extracts structured knowledge from its pages.

```bash
# Basic extraction (synchronous)
npx knowledgesdk extract https://competitor.com

# Run asynchronously and get a job ID back
npx knowledgesdk extract https://competitor.com --async

# Run asynchronously with a webhook callback
npx knowledgesdk extract https://competitor.com --async --callback-url https://myapp.com/hook

# Limit crawl depth
npx knowledgesdk extract https://competitor.com --max-pages 20

# Save result to a file
npx knowledgesdk extract https://competitor.com --output result.json

# Output raw JSON
npx knowledgesdk extract https://competitor.com --json
```

| Flag | Description |
|------|-------------|
| `--async` | Run asynchronously; returns a job ID |
| `--callback-url <url>` | Webhook URL to notify when done |
| `--max-pages <n>` | Maximum pages to crawl |
| `--output <file>` | Save JSON result to file |
| `--json` | Output raw JSON |

---

### `scrape` — Scrape a URL to Markdown

Fetches a single page and returns its content as clean Markdown.

```bash
npx knowledgesdk scrape https://docs.example.com
npx knowledgesdk scrape https://docs.example.com --output content.md
npx knowledgesdk scrape https://docs.example.com --json
```

| Flag | Description |
|------|-------------|
| `--output <file>` | Save markdown to file |
| `--json` | Output raw JSON including metadata |

---

### `classify` — Classify a business

Uses AI to classify a website into an industry/category.

```bash
npx knowledgesdk classify https://example.com
npx knowledgesdk classify https://example.com --json
```

| Flag | Description |
|------|-------------|
| `--json` | Output raw JSON |

---

### `sitemap` — Get a website's sitemap

```bash
npx knowledgesdk sitemap https://example.com

# Limit the number of URLs shown
npx knowledgesdk sitemap https://example.com --limit 50

# Output raw JSON
npx knowledgesdk sitemap https://example.com --json
```

| Flag | Description |
|------|-------------|
| `--limit <n>` | Limit number of URLs shown |
| `--json` | Output raw JSON |

---

### `screenshot` — Take a screenshot

```bash
npx knowledgesdk screenshot https://example.com
npx knowledgesdk screenshot https://example.com --output screenshot.png
```

| Flag | Description |
|------|-------------|
| `--output <file>` | Save PNG to file |
| `--json` | Output raw JSON (includes base64 image) |

---

### `search` — Search your knowledge base

```bash
npx knowledgesdk search "pricing plans"
npx knowledgesdk search "integration options" --limit 5
npx knowledgesdk search "API documentation" --json
```

| Flag | Description |
|------|-------------|
| `--limit <n>` | Maximum results to return |
| `--json` | Output raw JSON |

---

### `webhooks` — Manage webhooks

```bash
# List all webhooks
npx knowledgesdk webhooks list

# Create a webhook
npx knowledgesdk webhooks create \
  --url https://myapp.com/hook \
  --events EXTRACTION_COMPLETED,PAGE_SCRAPED

# Delete a webhook
npx knowledgesdk webhooks delete weh_xxx
```

**Available events:**

| Event | Description |
|-------|-------------|
| `EXTRACTION_COMPLETED` | Full extraction job finished |
| `EXTRACTION_FAILED` | Full extraction job failed |
| `PAGE_SCRAPED` | Individual page scraped |
| `JOB_STARTED` | Async job started |
| `JOB_FAILED` | Async job failed |

---

### `jobs` — Monitor async jobs

```bash
# Check job status once
npx knowledgesdk jobs get job_xxx

# Poll until the job completes
npx knowledgesdk jobs poll job_xxx

# Poll with a custom interval (in ms)
npx knowledgesdk jobs poll job_xxx --interval 5000

# Output final result as JSON
npx knowledgesdk jobs poll job_xxx --json
```

---

## Global Flags

| Flag | Description |
|------|-------------|
| `--help` / `-h` | Show help for any command |
| `--version` / `-v` | Show CLI version |

## Output Formats

By default the CLI renders human-readable, colored output. Use `--json` on any command to get raw JSON, or `--output <file>` to save results to disk.

## Error Handling

The CLI provides friendly error messages for common issues:

| HTTP Status | Message |
|-------------|---------|
| `401` | Invalid API key — prompts you to run `config` |
| `403` | Access forbidden |
| `429` | Rate limit exceeded — suggests retrying |
| `500/502/503` | Server error — suggests retrying |

If no API key is found at all, the CLI will tell you exactly how to set one.

## Requirements

- Node.js >= 18 (uses native `fetch`)
- A KnowledgeSDK API key from [knowledgesdk.com](https://knowledgesdk.com)

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run dev

# Run locally
node dist/index.js --help
```

## License

MIT
