import chalk from 'chalk';
import { writeFileSync } from 'fs';

// ─── Color theme ──────────────────────────────────────────────────────────────

export const theme = {
  brand: chalk.hex('#6366f1'),       // indigo
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.cyan,
  muted: chalk.gray,
  bold: chalk.bold,
  url: chalk.cyan.underline,
  key: chalk.magenta,
  value: chalk.white,
  label: chalk.bold.white,
  dim: chalk.dim,
  highlight: chalk.hex('#f59e0b'),   // amber
};

// ─── Symbols ──────────────────────────────────────────────────────────────────

export const sym = {
  check: chalk.green('✓'),
  cross: chalk.red('✗'),
  arrow: chalk.cyan('→'),
  dot: chalk.gray('·'),
  info: chalk.cyan('ℹ'),
  warn: chalk.yellow('⚠'),
  bullet: chalk.gray('•'),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Print a formatted key/value pair.
 */
export function printField(label: string, value: string | number | boolean | undefined | null): void {
  if (value === undefined || value === null) return;
  console.log(`  ${theme.label(label.padEnd(18))} ${theme.value(String(value))}`);
}

/**
 * Print a section header.
 */
export function printHeader(title: string): void {
  console.log('');
  console.log(theme.brand.bold(`  ${title}`));
  console.log(theme.muted('  ' + '─'.repeat(Math.max(title.length, 40))));
}

/**
 * Print a success message.
 */
export function printSuccess(message: string): void {
  console.log(`\n  ${sym.check} ${theme.success(message)}`);
}

/**
 * Print an error message and exit.
 */
export function printError(message: string, hint?: string): void {
  console.error(`\n  ${sym.cross} ${theme.error(message)}`);
  if (hint) {
    console.error(`  ${sym.info} ${theme.muted(hint)}`);
  }
}

/**
 * Print a warning.
 */
export function printWarning(message: string): void {
  console.warn(`  ${sym.warn} ${theme.warning(message)}`);
}

/**
 * Print info.
 */
export function printInfo(message: string): void {
  console.log(`  ${sym.info} ${theme.info(message)}`);
}

/**
 * Output raw JSON (for --json flag).
 */
export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Save output to a file.
 */
export function saveToFile(filePath: string, content: string | Buffer): void {
  writeFileSync(filePath, content);
  printSuccess(`Saved to ${theme.url(filePath)}`);
}

/**
 * Format a job status with appropriate color.
 */
export function colorizeStatus(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return theme.success(status);
    case 'RUNNING':
    case 'PENDING':
      return theme.info(status);
    case 'FAILED':
    case 'CANCELLED':
      return theme.error(status);
    default:
      return theme.muted(status);
  }
}

/**
 * Format a confidence value (0-1) as a percentage with color.
 */
export function colorizeConfidence(confidence: number): string {
  const pct = Math.round(confidence * 100);
  if (pct >= 80) return theme.success(`${pct}%`);
  if (pct >= 50) return theme.warning(`${pct}%`);
  return theme.error(`${pct}%`);
}

/**
 * Print a banner line.
 */
export function printBanner(): void {
  console.log('');
  console.log(
    theme.brand.bold('  KnowledgeSDK') + theme.muted(' CLI v0.1.0'),
  );
  console.log('');
}

/**
 * Handle an error from an API call and exit.
 */
export function handleApiError(err: unknown): never {
  if (
    err instanceof Error &&
    err.name === 'ApiError'
  ) {
    const apiErr = err as Error & { statusCode?: number };
    printError(err.message);
    if (apiErr.statusCode === 0) {
      // No API key
      printInfo('Run: knowledge config --key <your-api-key>');
      printInfo('Or set: export KNOWLEDGESDK_API_KEY=<your-api-key>');
    }
  } else if (err instanceof Error) {
    if (err.message.includes('fetch')) {
      printError(
        'Network error — could not connect to KnowledgeSDK API.',
        'Check your internet connection or KNOWLEDGESDK_BASE_URL.',
      );
    } else {
      printError(err.message);
    }
  } else {
    printError('An unexpected error occurred.');
  }
  process.exit(1);
}
