import { Command } from 'commander';
import ora from 'ora';
import { extractUrl } from '../lib/api.js';
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
    .option('--json', 'Output raw JSON')
    .action(
      async (
        url: string,
        opts: ExtractOptions & { json?: boolean },
      ) => {
        const spinner = ora({
          text: `Extracting knowledge from ${theme.url(url)}…`,
          color: 'cyan',
        }).start();

        try {
          const result = await extractUrl(url, {
            async: opts.async,
            callbackUrl: opts.callbackUrl,
            maxPages: opts.maxPages,
          });

          spinner.stop();

          if (opts.json) {
            printJson(result);
            return;
          }

          printHeader('Extraction result');
          printField('Job ID', result.jobId);
          printField('Status', colorizeStatus(result.status));
          printField('URL', result.url);
          printField('Created', result.createdAt);

          if (result.status === 'COMPLETED' && result.result) {
            printField('Total pages', result.result.totalPages);
            if (result.result.summary) {
              console.log('');
              console.log(`  ${theme.label('Summary')}`);
              console.log(`  ${theme.dim(result.result.summary)}`);
            }
          }

          if (opts.async || result.status === 'PENDING' || result.status === 'RUNNING') {
            console.log('');
            printInfo(
              `Job is running. Poll for results: knowledgesdk jobs poll ${result.jobId}`,
            );
          }

          if (result.completedAt) {
            printField('Completed', result.completedAt);
          }

          console.log('');

          if (opts.output) {
            saveToFile(opts.output, JSON.stringify(result, null, 2));
          }
        } catch (err) {
          spinner.stop();
          handleApiError(err);
        }
      },
    );
}
