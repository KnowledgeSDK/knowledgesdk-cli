import { Command } from 'commander';
import ora from 'ora';
import { scrapeUrl } from '../lib/api.js';
import {
  handleApiError,
  printField,
  printHeader,
  printJson,
  saveToFile,
  theme,
} from '../lib/output.js';
import type { ScrapeOptions } from '../types.js';

export function registerScrapeCommand(program: Command): void {
  program
    .command('scrape <url>')
    .description('Scrape a URL and return its content as Markdown')
    .option('-o, --output <file>', 'Save markdown to a file')
    .option('--json', 'Output raw JSON including metadata')
    .action(async (url: string, opts: ScrapeOptions & { json?: boolean }) => {
      const spinner = ora({
        text: `Scraping ${theme.url(url)}…`,
        color: 'cyan',
      }).start();

      try {
        const result = await scrapeUrl(url);

        spinner.stop();

        if (opts.json) {
          printJson(result);
          return;
        }

        if (opts.output) {
          // Save raw markdown
          saveToFile(opts.output, result.markdown);
          return;
        }

        // Pretty print
        printHeader('Scrape result');
        printField('URL', result.url);
        if (result.title) printField('Title', result.title);
        console.log('');
        console.log(theme.label('  Content (Markdown):'));
        console.log(theme.dim('  ' + '─'.repeat(50)));
        // Print first 3000 chars to avoid flooding the terminal
        const preview =
          result.markdown.length > 3000
            ? result.markdown.slice(0, 3000) + '\n\n…(truncated, use --output to save full content)'
            : result.markdown;
        console.log(preview);
        console.log('');
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });
}
