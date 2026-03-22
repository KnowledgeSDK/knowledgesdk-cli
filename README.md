# KnowledgeSDK CLI

A beautiful, fully-featured command-line interface for [KnowledgeSDK](https://knowledgesdk.com) — extract, scrape, classify, search, and manage knowledge from any website.

## Installation

```bash
npm install -g @knowledge/cli
```

Or use without installing:

```bash
npx @knowledge/cli <command>
```

## Quick Start

```bash
# 1. Set your API key
npx knowledge config --key sk_ks_your_key

# 2. Extract knowledge from a website
npx knowledge extract https://stripe.com

# 3. Search your knowledge base
npx knowledge search "pricing plans"
```

## Configuration

API keys are stored in `~/.knowledge/config.json`.

```bash
# Set API key
npx knowledge config --key sk_ks_your_key

# Set a custom API base URL
npx knowledge config --url https://api.myinstance.com

# View current config
npx knowledge config

# Clear stored config
npx knowledge config --clear
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
npx knowledge extract https://stripe.com

# Run asynchronously and get a job ID back
npx knowledge extract https://stripe.com --async

# Run asynchronously with a webhook callback
npx knowledge extract https://stripe.com --async --callback-url https://myapp.com/hook

# Limit crawl depth
npx knowledge extract https://stripe.com --max-pages 20

# Save result to a file
npx knowledge extract https://stripe.com --output result.json

# Output raw JSON
npx knowledge extract https://stripe.com --json
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
npx knowledge scrape https://docs.stripe.com
npx knowledge scrape https://docs.stripe.com --output content.md
npx knowledge scrape https://docs.stripe.com --json
```

| Flag | Description |
|------|-------------|
| `--output <file>` | Save markdown to file |
| `--json` | Output raw JSON including metadata |

---

### `classify` — Classify a business

Uses AI to classify a website into an industry/category.

```bash
npx knowledge classify https://stripe.com
npx knowledge classify https://stripe.com --json
```

| Flag | Description |
|------|-------------|
| `--json` | Output raw JSON |

---

### `sitemap` — Get a website's sitemap

```bash
npx knowledge sitemap https://stripe.com

# Limit the number of URLs shown
npx knowledge sitemap https://stripe.com --limit 50

# Output raw JSON
npx knowledge sitemap https://stripe.com --json
```

| Flag | Description |
|------|-------------|
| `--limit <n>` | Limit number of URLs shown |
| `--json` | Output raw JSON |

---

### `screenshot` — Take a screenshot

```bash
npx knowledge screenshot https://stripe.com
npx knowledge screenshot https://stripe.com --output screenshot.png
```

| Flag | Description |
|------|-------------|
| `--output <file>` | Save PNG to file |
| `--json` | Output raw JSON (includes base64 image) |

---

### `search` — Search your knowledge base

```bash
npx knowledge search "pricing plans"
npx knowledge search "integration options" --limit 5
npx knowledge search "API documentation" --json
```

| Flag | Description |
|------|-------------|
| `--limit <n>` | Maximum results to return |
| `--json` | Output raw JSON |

---

### `webhooks` — Manage webhooks

```bash
# List all webhooks
npx knowledge webhooks list

# Create a webhook
npx knowledge webhooks create \
  --url https://myapp.com/hook \
  --events EXTRACTION_COMPLETED,PAGE_SCRAPED

# Delete a webhook
npx knowledge webhooks delete weh_xxx
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
npx knowledge jobs get job_xxx

# Poll until the job completes
npx knowledge jobs poll job_xxx

# Poll with a custom interval (in ms)
npx knowledge jobs poll job_xxx --interval 5000

# Output final result as JSON
npx knowledge jobs poll job_xxx --json
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
