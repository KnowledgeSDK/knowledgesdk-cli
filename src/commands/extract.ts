import { Command } from 'commander';
import ora from 'ora';
import { extractUrl, extractUrlStream } from '../lib/api.js';
import {
  colorizeStatus,
  handleApiError,
  printField,
  printHeader,
  printInfo,
  printJson,
  saveToFile,
  theme,
} from '../lib/output.js';
import type { ExtractOptions } from '../types.js';

export function registerExtractCommand(program: Command): void {
  program
    .command('extract <url>')
    .description('Extract structured knowledge from a website')
    .option('-a, --async', 'Run extraction asynchronously (returns a job ID)')
    .option(
      '-c, --callback-url <url>',
      'Webhook URL to call when extraction completes',
    )
    .option('-m, --max-pages <number>', 'Maximum number of pages to crawl', parseInt)
    .option('-o, --output <file>', 'Save result to a file (JSON)')
    .option('--no-stream', 'Disable live streaming and wait synchronously')
    .option('--json', 'Output raw JSON')
    .action(
      async (
        url: string,
        opts: ExtractOptions & { json?: boolean; stream?: boolean },
      ) => {
        // ── Async mode: fire and forget ──────────────────────────────────────
        if (opts.async) {
          const spinner = ora({ text: `Queuing extraction for ${theme.url(url)}…`, color: 'cyan' }).start();
          try {
            const result = await extractUrl(url, {
              async: true,
              callbackUrl: opts.callbackUrl,
              maxPages: opts.maxPages,
            });
            spinner.stop();
            if (opts.json) { printJson(result); return; }
            printHeader('Extraction queued');
            printField('Job ID', result.jobId);
            printField('Status', colorizeStatus(result.status));
            printField('URL', result.url);
            console.log('');
            printInfo(`Poll for results: knowledgesdk jobs poll ${result.jobId}`);
            console.log('');
            if (opts.output) saveToFile(opts.output, JSON.stringify(result, null, 2));
          } catch (err) {
            spinner.stop();
            handleApiError(err);
          }
          return;
        }

        // ── Streaming mode (default) ─────────────────────────────────────────
        if (opts.stream !== false) {
          const spinner = ora({ text: `Connecting to ${theme.url(url)}…`, color: 'cyan' }).start();
          const startTime = Date.now();
          let businessName = '';
          let finalResult: any = null;

          try {
            for await (const event of extractUrlStream(url, { maxPages: opts.maxPages })) {
              switch (event.type) {
                case 'connected':
                  spinner.text = `Classifying ${theme.url(url)}…`;
                  break;
                case 'business_classified':
                  businessName = event.business.businessName;
                  spinner.text = `Classified: ${theme.bold(businessName)}`;
                  break;
                case 'progress':
                  spinner.text = event.message;
                  break;
                case 'pages_planned':
                  spinner.text = `Planned ${event.pages.length} pages to scrape…`;
                  break;
                case 'page_scraped':
                  spinner.text = `Scraping page ${event.index + 1}/${event.total}: ${theme.dim(event.url)}`;
                  break;
                case 'complete':
                  finalResult = event.result;
                  break;
                case 'error':
                  throw new Error(event.message);
              }
            }

            const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
            const label = businessName || url;
            const pages = finalResult?.pagesScraped ?? 0;
            const items = Array.isArray(finalResult?.knowledgeItems) ? finalResult.knowledgeItems.length : 0;
            spinner.succeed(`${theme.bold(label)} — ${pages} pages · ${items} knowledge items · ${durationSec}s`);

            if (opts.json) { printJson(finalResult); return; }

            if (finalResult) {
              console.log('');
              printHeader('Extraction complete');
              printField('Pages scraped', String(pages));
              printField('Knowledge items', String(items));
              printField('Duration', `${durationSec}s`);
            }

            console.log('');
            if (opts.output && finalResult) saveToFile(opts.output, JSON.stringify(finalResult, null, 2));
          } catch (err) {
            spinner.fail();
            handleApiError(err);
          }
          return;
        }

        // ── Sync fallback (--no-stream) ──────────────────────────────────────
        const spinner = ora({ text: `Extracting knowledge from ${theme.url(url)}…`, color: 'cyan' }).start();
        try {
          const result = await extractUrl(url, {
            async: false,
            callbackUrl: opts.callbackUrl,
            maxPages: opts.maxPages,
          });
          spinner.stop();
          if (opts.json) { printJson(result); return; }
          printHeader('Extraction result');
          printField('Job ID', result.jobId);
          printField('Status', colorizeStatus(result.status));
          printField('URL', result.url);
          printField('Created', result.createdAt);
          if (result.status === 'COMPLETED' && result.result) {
            printField('Total pages', result.result.totalPages);
          }
          if (result.completedAt) printField('Completed', result.completedAt);
          console.log('');
          if (opts.output) saveToFile(opts.output, JSON.stringify(result, null, 2));
        } catch (err) {
          spinner.stop();
          handleApiError(err);
        }
      },
    );
}
