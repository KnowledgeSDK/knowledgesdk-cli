import { Command } from 'commander';
import ora from 'ora';
import { classifyUrl } from '../lib/api.js';
import {
  colorizeConfidence,
  handleApiError,
  printField,
  printHeader,
  printJson,
  theme,
} from '../lib/output.js';
import type { ClassifyOptions } from '../types.js';

export function registerClassifyCommand(program: Command): void {
  program
    .command('classify <url>')
    .description('Classify a business/website into a category')
    .option('--json', 'Output raw JSON')
    .action(async (url: string, opts: ClassifyOptions) => {
      const spinner = ora({
        text: `Classifying ${theme.url(url)}…`,
        color: 'cyan',
      }).start();

      try {
        const result = await classifyUrl(url);

        spinner.stop();

        if (opts.json) {
          printJson(result);
          return;
        }

        printHeader('Classification result');
        printField('URL', result.url);
        printField('Category', theme.highlight(result.category));
        if (result.subcategory) {
          printField('Subcategory', result.subcategory);
        }
        printField('Confidence', colorizeConfidence(result.confidence));
        if (result.description) {
          console.log('');
          console.log(`  ${theme.label('Description')}`);
          console.log(`  ${theme.dim(result.description)}`);
        }
        if (result.tags && result.tags.length > 0) {
          console.log('');
          console.log(
            `  ${theme.label('Tags')}  ${result.tags.map((t) => theme.info(`#${t}`)).join('  ')}`,
          );
        }
        console.log('');
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });
}
