<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://knowledgesdk.com/knowledgesdk_light.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://knowledgesdk.com/knowledgesdk_dark.svg" />
    <img src="https://knowledgesdk.com/knowledgesdk_dark.svg" alt="KnowledgeSDK" width="300" />
  </picture>
</p>

<p align="center">
  <b>Official CLI for <a href="https://knowledgesdk.com">KnowledgeSDK</a></b><br/>
  Extract, analyze, search, and manage knowledge from any website — right from your terminal.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@knowledgesdk/cli">
    <img src="https://img.shields.io/npm/v/@knowledgesdk/cli.svg?style=flat-square" alt="NPM Version" />
  </a>
  <a href="https://github.com/KnowledgeSDK/knowledgesdk-cli/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/KnowledgeSDK/knowledgesdk-cli.svg?style=flat-square" alt="License" />
  </a>
</p>

# KnowledgeSDK CLI

## What is KnowledgeSDK?

**KnowledgeSDK** is an API that turns any website into structured, searchable knowledge — built for developers, AI agents, and data pipelines.

- **Extract** — Convert any URL to clean Markdown
- **Business** — Full AI-powered business extraction (crawl, classify, and extract)
- **Screenshot** — Full-page screenshots of any website
- **Sitemap** — Discover all URLs on a domain
- **Search** — Semantic search across your extracted knowledge base

> [Get your API key](https://knowledgesdk.com/connect)

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
npx knowledgesdk config --key knowledgesdk_live_your_key

# 2. Extract a page to markdown
npx knowledgesdk extract https://docs.stripe.com

# 3. Run full business extraction
npx knowledgesdk business https://stripe.com

# 4. Search your knowledge base
npx knowledgesdk search "pricing plans"
```

## Configuration

API keys are stored in `~/.knowledgesdk/config.json`.

```bash
# Set API key
npx knowledgesdk config --key knowledgesdk_live_your_key

# Set a custom API base URL
npx knowledgesdk config --url https://api.myinstance.com

# View current config
npx knowledgesdk config

# Clear stored config
npx knowledgesdk config --clear
```

You can also use environment variables instead of the config file:

```bash
export KNOWLEDGESDK_API_KEY=knowledgesdk_live_your_key
export KNOWLEDGESDK_BASE_URL=https://api.knowledgesdk.com  # optional
```

## Commands

### `extract` — Extract a URL to Markdown

Fetches a single page and returns its content as clean Markdown.

```bash
npx knowledgesdk extract https://docs.stripe.com
npx knowledgesdk extract https://docs.stripe.com --output content.md
npx knowledgesdk extract https://docs.stripe.com --json
```

| Flag | Description |
|------|-------------|
| `--output <file>` | Save markdown to file |
| `--json` | Output raw JSON including metadata |

---

### `business` — Full AI business extraction

Crawls a website, classifies the business, and extracts structured knowledge from its pages.

```bash
# Basic extraction (streams by default)
npx knowledgesdk business https://stripe.com

# Run asynchronously and get a job ID back
npx knowledgesdk business https://stripe.com --async

# Run asynchronously with a webhook callback
npx knowledgesdk business https://stripe.com --async --callback-url https://myapp.com/hook

# Limit crawl depth
npx knowledgesdk business https://stripe.com --max-pages 20

# Save result to a file
npx knowledgesdk business https://stripe.com --output result.json

# Output raw JSON
npx knowledgesdk business https://stripe.com --json
```

| Flag | Description |
|------|-------------|
| `--async` | Run asynchronously; returns a job ID |
| `--callback-url <url>` | Webhook URL to notify when done |
| `--max-pages <n>` | Maximum pages to crawl |
| `--output <file>` | Save JSON result to file |
| `--no-stream` | Disable live streaming and wait synchronously |
| `--json` | Output raw JSON |

---

### `classify` — Classify a business (deprecated)

> **Deprecated:** Classification is now included in the `business` command. This command will be removed in a future release.

```bash
npx knowledgesdk classify https://stripe.com
npx knowledgesdk classify https://stripe.com --json
```

| Flag | Description |
|------|-------------|
| `--json` | Output raw JSON |

---

### `sitemap` — Get a website's sitemap

```bash
npx knowledgesdk sitemap https://stripe.com

# Limit the number of URLs shown
npx knowledgesdk sitemap https://stripe.com --limit 50

# Output raw JSON
npx knowledgesdk sitemap https://stripe.com --json
```

| Flag | Description |
|------|-------------|
| `--limit <n>` | Limit number of URLs shown |
| `--json` | Output raw JSON |

---

### `screenshot` — Take a screenshot

```bash
npx knowledgesdk screenshot https://stripe.com
npx knowledgesdk screenshot https://stripe.com --output screenshot.png
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

## Documentation

Full API reference → **<https://knowledgesdk.com/docs>**

## Contributing

We love PRs!

1. **Fork** → `git checkout -b feat/awesome`
2. Add tests & docs
3. **PR** against `main`

## License

[MIT](LICENSE)
