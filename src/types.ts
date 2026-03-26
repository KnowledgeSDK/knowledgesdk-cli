// ─── Config ──────────────────────────────────────────────────────────────────

export interface CLIConfig {
  apiKey?: string;
  baseUrl?: string;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ─── Extract (single URL → markdown) ─────────────────────────────────────────

export interface ExtractOptions {
  output?: string;
}

export interface ExtractResult {
  url: string;
  markdown: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

// ─── Business (full AI extraction) ───────────────────────────────────────────

export interface BusinessOptions {
  async?: boolean;
  callbackUrl?: string;
  maxPages?: number;
  output?: string;
}

export interface BusinessJob {
  jobId: string;
  status: JobStatus;
  url: string;
  createdAt: string;
  completedAt?: string;
  result?: ExtractionResult;
}

export interface ExtractionResult {
  url: string;
  pages: PageResult[];
  summary?: string;
  totalPages: number;
  metadata?: Record<string, unknown>;
}

export interface PageResult {
  url: string;
  title?: string;
  content?: string;
  markdown?: string;
  metadata?: Record<string, unknown>;
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export interface SitemapResult {
  url: string;
  pages: SitemapPage[];
  totalPages: number;
}

export interface SitemapPage {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
}

// ─── Screenshot ───────────────────────────────────────────────────────────────

export interface ScreenshotOptions {
  output?: string;
}

export interface ScreenshotResult {
  url: string;
  imageBase64?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchOptions {
  limit?: number;
  json?: boolean;
}

export interface SearchResult {
  query: string;
  results: SearchItem[];
  total: number;
}

export interface SearchItem {
  id: string;
  url: string;
  title?: string;
  snippet?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export type WebhookEvent =
  | 'EXTRACTION_COMPLETED'
  | 'EXTRACTION_FAILED'
  | 'PAGE_SCRAPED'
  | 'JOB_STARTED'
  | 'JOB_FAILED';

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WebhookListResult {
  webhooks: Webhook[];
  total: number;
}

export interface CreateWebhookOptions {
  url: string;
  events: string;
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface Job {
  jobId: string;
  status: JobStatus;
  type?: string;
  url?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  error?: string;
  result?: unknown;
  progress?: number;
}
