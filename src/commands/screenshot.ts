import { writeFileSync } from 'fs';
import { Command } from 'commander';
import ora from 'ora';
import { takeScreenshot } from '../lib/api.js';
import {
  handleApiError,
  printField,
  printHeader,
  printJson,
  printSuccess,
  printInfo,
  theme,
} from '../lib/output.js';
import type {
  ScreenshotApiOptions,
  ScreenshotCookie,
  ScreenshotWaitUntil,
  ViewportPreset,
} from '../types.js';

interface CliOptions {
  output?: string;
  json?: boolean;
  viewport?: string;
  width?: string;
  height?: string;
  fullPage?: boolean;
  selector?: string;
  waitUntil?: string;
  waitFor?: string;
  wait?: string;
  timeout?: string;
  header?: string[];
  cookie?: string[];
  cookieDomain?: string;
}

const VIEWPORT_PRESETS: ReadonlyArray<ViewportPreset> = [
  'mobile',
  'tablet',
  'desktop',
  'desktop_hd',
];
const WAIT_UNTIL_VALUES: ReadonlyArray<ScreenshotWaitUntil> = [
  'load',
  'dom_content_loaded',
  'network_idle',
];

const collectRepeatable = (value: string, previous: string[] = []): string[] => [
  ...previous,
  value,
];

const splitOnce = (input: string, sep: string): [string, string] => {
  const idx = input.indexOf(sep);
  if (idx === -1) return [input, ''];
  return [input.slice(0, idx), input.slice(idx + sep.length)];
};

const parsePositiveInt = (label: string, raw: string | undefined): number | undefined => {
  if (raw === undefined) return undefined;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0) {
    throw new Error(`Invalid ${label}: ${raw}`);
  }
  return n;
};

const buildApiOptions = (opts: CliOptions): ScreenshotApiOptions => {
  const out: ScreenshotApiOptions = {};

  if (opts.viewport) {
    if (!VIEWPORT_PRESETS.includes(opts.viewport as ViewportPreset)) {
      throw new Error(
        `Invalid --viewport: ${opts.viewport}. Use one of: ${VIEWPORT_PRESETS.join(', ')}`,
      );
    }
    out.viewport = opts.viewport as ViewportPreset;
  }

  if (opts.width || opts.height) {
    const w = parsePositiveInt('--width', opts.width);
    const h = parsePositiveInt('--height', opts.height);
    if (w === undefined || h === undefined) {
      throw new Error('--width and --height must be provided together');
    }
    out.viewport = { width: w, height: h };
  }

  if (opts.fullPage) out.fullPage = true;
  if (opts.selector) out.capture = { selector: opts.selector };

  const wait: NonNullable<ScreenshotApiOptions['wait']> = {};
  if (opts.waitUntil) {
    if (!WAIT_UNTIL_VALUES.includes(opts.waitUntil as ScreenshotWaitUntil)) {
      throw new Error(
        `Invalid --wait-until: ${opts.waitUntil}. Use one of: ${WAIT_UNTIL_VALUES.join(', ')}`,
      );
    }
    wait.until = opts.waitUntil as ScreenshotWaitUntil;
  }
  if (opts.waitFor) wait.selector = opts.waitFor;
  const delayMs = parsePositiveInt('--wait', opts.wait);
  if (delayMs !== undefined) wait.delayMs = delayMs;
  const timeoutMs = parsePositiveInt('--timeout', opts.timeout);
  if (timeoutMs !== undefined) wait.timeoutMs = timeoutMs;
  if (Object.keys(wait).length > 0) out.wait = wait;

  if (opts.header && opts.header.length > 0) {
    const headers: Record<string, string> = {};
    for (const raw of opts.header) {
      const [k, v] = splitOnce(raw, ':');
      const name = k.trim();
      if (!name) throw new Error(`Invalid --header: ${raw} (expected "Key: value")`);
      headers[name] = v.trim();
    }
    out.headers = headers;
  }

  if (opts.cookie && opts.cookie.length > 0) {
    const cookies: ScreenshotCookie[] = opts.cookie.map((raw) => {
      const [name, value] = splitOnce(raw, '=');
      if (!name) throw new Error(`Invalid --cookie: ${raw} (expected "name=value")`);
      const cookie: ScreenshotCookie = { name, value };
      if (opts.cookieDomain) cookie.domain = opts.cookieDomain;
      return cookie;
    });
    out.auth = { cookies };
  }

  return out;
};

const downloadAndSave = async (url: string, output: string): Promise<number> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download screenshot (${res.status} ${res.statusText})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(output, buffer);
  return buffer.length;
};

export function registerScreenshotCommand(program: Command): void {
  program
    .command('screenshot <url>')
    .description('Take a screenshot of a website')
    .option('-o, --output <file>', 'Download the PNG and save to this path')
    .option('--json', 'Output raw JSON')
    .option(
      '-V, --viewport <preset>',
      `Viewport preset: ${VIEWPORT_PRESETS.join(' | ')} (default: desktop)`,
    )
    .option('--width <px>', 'Custom viewport width (use with --height)')
    .option('--height <px>', 'Custom viewport height (use with --width)')
    .option('-f, --full-page', 'Capture entire scrollable height')
    .option('-s, --selector <css>', 'Element-only capture (CSS selector)')
    .option(
      '--wait-until <event>',
      `When the page is ready: ${WAIT_UNTIL_VALUES.join(' | ')}`,
    )
    .option('--wait-for <css>', 'Wait for a CSS selector before capture')
    .option('--wait <ms>', 'Extra delay (ms) after ready')
    .option('--timeout <ms>', 'Max wait timeout (ms)')
    .option(
      '-H, --header <line>',
      'Custom header forwarded to target ("Key: value"). Repeatable.',
      collectRepeatable,
      [],
    )
    .option(
      '-c, --cookie <pair>',
      'Cookie forwarded to target ("name=value"). Repeatable.',
      collectRepeatable,
      [],
    )
    .option('--cookie-domain <domain>', 'Apply this domain to every --cookie')
    .action(async (url: string, opts: CliOptions) => {
      let apiOptions: ScreenshotApiOptions;
      try {
        apiOptions = buildApiOptions(opts);
      } catch (err) {
        console.error((err as Error).message);
        process.exit(1);
      }

      const spinner = ora({
        text: `Taking screenshot of ${theme.url(url)}…`,
        color: 'cyan',
      }).start();

      try {
        const result = await takeScreenshot(url, apiOptions);
        spinner.stop();

        if (opts.json) {
          printJson(result);
          return;
        }

        printHeader('Screenshot');
        printField('URL', result.url);
        printField('Image URL', result.screenshotUrl);
        printField('Size', `${result.bytes.toLocaleString()} bytes`);
        printField('Duration', `${result.durationMs} ms`);

        if (opts.output) {
          spinner.text = 'Downloading…';
          spinner.start();
          try {
            const bytes = await downloadAndSave(result.screenshotUrl, opts.output);
            spinner.stop();
            printSuccess(
              `Screenshot saved to ${theme.url(opts.output)} (${bytes.toLocaleString()} bytes)`,
            );
          } catch (err) {
            spinner.stop();
            printInfo(`Download failed: ${(err as Error).message}`);
            printInfo(`Open the URL directly: ${theme.url(result.screenshotUrl)}`);
          }
        } else {
          printInfo('Use --output screenshot.png to save the image locally.');
        }

        console.log('');
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });
}
