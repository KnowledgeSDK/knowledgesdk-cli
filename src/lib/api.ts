import { resolveApiKey, resolveBaseUrl } from './config.js';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Friendly messages for common HTTP error codes.
 */
function friendlyErrorMessage(status: number, body: unknown): string {
  const bodyMsg =
    body &&
    typeof body === 'object' &&
    'message' in body &&
    typeof (body as Record<string, unknown>)['message'] === 'string'
      ? (body as Record<string, string>)['message']
      : undefined;

  switch (status) {
    case 401:
      return (
        bodyMsg ??
        'Invalid API key. Run `knowledgesdk config --key <your-key>` to set your API key.'
      );
    case 403:
      return bodyMsg ?? 'Access forbidden. Check your API key permissions.';
    case 404:
      return bodyMsg ?? 'Resource not found.';
    case 422:
      return bodyMsg ?? 'Invalid request parameters.';
    case 429:
      return (
        bodyMsg ??
        'Rate limit exceeded. Please wait a moment before retrying.'
      );
    case 500:
    case 502:
    case 503:
      return bodyMsg ?? 'KnowledgeSDK server error. Please try again later.';
    default:
      return bodyMsg ?? `Request failed with status ${status}.`;
  }
}

/**
 * Core fetch wrapper — attaches auth header and handles errors.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const apiKey = resolveApiKey();

  if (!apiKey) {
    throw new ApiError(
      0,
      'No API key configured. Run `knowledgesdk config --key <your-key>` or set the KNOWLEDGESDK_API_KEY environment variable.',
    );
  }

  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'User-Agent': '@knowledgesdk/cli/0.1.0',
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(url, { ...options, headers });

  // For binary responses (e.g. screenshot) return the raw Response object
  // wrapped in a special marker that callers can check
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => undefined);
    }
    throw new ApiError(
      response.status,
      friendlyErrorMessage(response.status, body),
      body,
    );
  }

  if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
    return response as unknown as T;
  }

  // Some endpoints return 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ─── API methods ──────────────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE' });
}

// ─── Specific endpoint helpers ────────────────────────────────────────────────

import type {
  ClassifyResult,
  ExtractionJob,
  Job,
  ScrapeResult,
  SearchResult,
  SitemapResult,
  ScreenshotResult,
  Webhook,
  WebhookListResult,
  WebhookEvent,
} from '../types.js';

export async function extractUrl(
  url: string,
  options: {
    async?: boolean;
    callbackUrl?: string;
    maxPages?: number;
  } = {},
): Promise<ExtractionJob> {
  return apiPost<ExtractionJob>('/v1/extract', {
    url,
    async: options.async,
    callbackUrl: options.callbackUrl,
    maxPages: options.maxPages,
  });
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  return apiPost<ScrapeResult>('/v1/scrape', { url });
}

export async function classifyUrl(url: string): Promise<ClassifyResult> {
  return apiPost<ClassifyResult>('/v1/classify', { url });
}

export async function getSitemap(url: string): Promise<SitemapResult> {
  return apiPost<SitemapResult>('/v1/sitemap', { url });
}

export async function takeScreenshot(url: string): Promise<ScreenshotResult> {
  return apiPost<ScreenshotResult>('/v1/screenshot', { url });
}

export async function searchKnowledge(
  query: string,
  limit?: number,
): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query });
  if (limit !== undefined) params.set('limit', String(limit));
  return apiGet<SearchResult>(`/v1/search?${params.toString()}`);
}

export async function listWebhooks(): Promise<WebhookListResult> {
  return apiGet<WebhookListResult>('/v1/webhooks');
}

export async function createWebhook(
  url: string,
  events: WebhookEvent[],
): Promise<Webhook> {
  return apiPost<Webhook>('/v1/webhooks', { url, events });
}

export async function deleteWebhook(id: string): Promise<void> {
  return apiDelete<void>(`/v1/webhooks/${id}`);
}

export async function getJob(jobId: string): Promise<Job> {
  return apiGet<Job>(`/v1/jobs/${jobId}`);
}
