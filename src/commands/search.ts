import { Command } from 'commander';
import ora from 'ora';
import { searchKnowledge } from '../lib/api.js';
import {
  handleApiError,
  printField,
  printHeader,
  printJson,
  theme,
  sym,
} from '../lib/output.js';
import type { SearchOptions } from '../types.js';

export function registerSearchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('Search your extracted knowledge base')
    .option('-l, --limit <number>', 'Maximum number of results to return', parseInt)
    .option('--json', 'Output raw JSON')
    .action(async (query: string, opts: SearchOptions) => {
      const spinner = ora({
        text: `Searching for ${theme.highlight(`"${query}"`)}…`,
        color: 'cyan',
      }).start();

      try {
        const result = await searchKnowledge(query, opts.limit);

        spinner.stop();

        if (opts.json) {
          printJson(result);
          return;
        }

        printHeader(`Search results for "${query}"`);
        printField('Total results', result.total);
        console.log('');

        if (result.results.length === 0) {
          console.log(`  ${sym.info} ${theme.muted('No results found.')}`);
          console.log('');
          return;
        }

        for (let i = 0; i < result.results.length; i++) {
          const item = result.results[i];
          const num = theme.muted(`${i + 1}.`);
          console.log(`  ${num} ${theme.bold(item.title ?? 'Untitled')}`);
          console.log(`     ${theme.url(item.url)}`);
          if (item.score !== undefined) {
            const pct = Math.round(item.score * 100);
            console.log(`     ${theme.muted('Score:')} ${theme.info(`${pct}%`)}`);
          }
          if (item.snippet) {
            console.log(`     ${theme.dim(item.snippet)}`);
          }
          console.log('');
        }
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });
}
