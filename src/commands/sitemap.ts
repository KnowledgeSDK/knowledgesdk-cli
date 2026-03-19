import { Command } from 'commander';
import ora from 'ora';
import { getSitemap } from '../lib/api.js';
import {
  handleApiError,
  printField,
  printHeader,
  printJson,
  theme,
  sym,
} from '../lib/output.js';

export function registerSitemapCommand(program: Command): void {
  program
    .command('sitemap <url>')
    .description('Retrieve the sitemap for a website')
    .option('--json', 'Output raw JSON')
    .option('-l, --limit <number>', 'Limit number of URLs shown', parseInt)
    .action(async (url: string, opts: { json?: boolean; limit?: number }) => {
      const spinner = ora({
        text: `Fetching sitemap for ${theme.url(url)}…`,
        color: 'cyan',
      }).start();

      try {
        const result = await getSitemap(url);

        spinner.stop();

        if (opts.json) {
          printJson(result);
          return;
        }

        printHeader('Sitemap');
        printField('URL', result.url);
        printField('Total pages', result.totalPages);
        console.log('');

        const pages = opts.limit ? result.pages.slice(0, opts.limit) : result.pages;

        for (const page of pages) {
          console.log(`  ${sym.bullet} ${theme.url(page.url)}`);
          if (page.lastModified) {
            console.log(`    ${theme.muted('Last modified:')} ${theme.dim(page.lastModified)}`);
          }
        }

        if (opts.limit && result.pages.length > opts.limit) {
          console.log('');
          console.log(
            theme.muted(
              `  … and ${result.pages.length - opts.limit} more pages (use --limit to adjust)`,
            ),
          );
        }

        console.log('');
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });
}
