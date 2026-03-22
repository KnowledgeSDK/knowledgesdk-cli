import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { CLIConfig } from '../types.js';

const CONFIG_DIR = join(homedir(), '.knowledge');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export const DEFAULT_BASE_URL = 'https://api.knowledgesdk.com';

/**
 * Read the stored config from disk.
 */
export function readConfig(): CLIConfig {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as CLIConfig;
  } catch {
    return {};
  }
}

/**
 * Write updated config to disk, merging with existing values.
 */
export function writeConfig(updates: Partial<CLIConfig>): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const current = readConfig();
  const merged = { ...current, ...updates };
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
}

/**
 * Resolve the API key from env var or config file.
 */
export function resolveApiKey(): string | undefined {
  if (process.env['KNOWLEDGESDK_API_KEY']) {
    return process.env['KNOWLEDGESDK_API_KEY'];
  }
  const config = readConfig();
  return config.apiKey;
}

/**
 * Resolve the base URL from env var or config file, with fallback.
 */
export function resolveBaseUrl(): string {
  if (process.env['KNOWLEDGESDK_BASE_URL']) {
    return process.env['KNOWLEDGESDK_BASE_URL'];
  }
  const config = readConfig();
  return config.baseUrl ?? DEFAULT_BASE_URL;
}

/**
 * Returns the path to the config file for display purposes.
 */
export function getConfigFilePath(): string {
  return CONFIG_FILE;
}
