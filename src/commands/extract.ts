import { Command } from 'commander';
import ora from 'ora';
import { extractUrl } from '../lib/api.js';
import {
  handleApiError,
  printField,
  printHeader,
  printJson,
  saveToFile,
  theme,
} from '../lib/output.js';
import type { ExtractOptions } from '../types.js';

export function registerExtractCommand(program: Command): void {
  program
    .command('extract <url>')
    .description('Extract a single URL and return its content as Markdown')
    .option('-o, --output <file>', 'Save markdown to a file')
    .option('--json', 'Output raw JSON including metadata')
    .action(async (url: string, opts: ExtractOptions & { json?: boolean }) => {
      const spinner = ora({
        text: `Extracting ${theme.url(url)}…`,
        color: 'cyan',
      }).start();

      try {
        const result = await extractUrl(url);

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
        printHeader('Extract result');
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
