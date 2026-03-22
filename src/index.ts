#!/usr/bin/env node

import { Command } from 'commander';
import { registerConfigCommand } from './commands/config.js';
import { registerExtractCommand } from './commands/extract.js';
import { registerScrapeCommand } from './commands/scrape.js';
import { registerClassifyCommand } from './commands/classify.js';
import { registerSitemapCommand } from './commands/sitemap.js';
import { registerScreenshotCommand } from './commands/screenshot.js';
import { registerSearchCommand } from './commands/search.js';
import { registerWebhooksCommand } from './commands/webhooks.js';
import { registerJobsCommand } from './commands/jobs.js';
import { printBanner, printError, theme } from './lib/output.js';
import { resolveApiKey } from './lib/config.js';

const program = new Command();

program
  .name('knowledgesdk')
  .description(
    [
      '',
      theme.brand.bold('  KnowledgeSDK CLI'),
      theme.muted('  Extract, scrape, classify, and search website knowledge'),
      '',
      `  ${theme.label('Quickstart')}`,
      `  ${theme.dim('1.')} knowledgesdk config --key sk_ks_your_key`,
      `  ${theme.dim('2.')} knowledgesdk extract https://stripe.com`,
      '',
    ].join('\n'),
  )
  .version('0.1.0', '-v, --version', 'Display the current version')
  .addHelpText(
    'after',
    [
      '',
      theme.muted('  Documentation: https://docs.knowledgesdk.com'),
      theme.muted('  Support:       https://knowledgesdk.com/support'),
      '',
    ].join('\n'),
  );

// Register all sub-commands
registerConfigCommand(program);
registerExtractCommand(program);
registerScrapeCommand(program);
registerClassifyCommand(program);
registerSitemapCommand(program);
registerScreenshotCommand(program);
registerSearchCommand(program);
registerWebhooksCommand(program);
registerJobsCommand(program);

// Global error handler — catch unknown options / commands gracefully
program.on('command:*', (operands: string[]) => {
  printError(
    `Unknown command: ${operands[0]}`,
    'Run `knowledgesdk --help` to see available commands.',
  );
  process.exit(1);
});

// Show a friendly warning if no API key is configured (except for `config` command)
const args = process.argv.slice(2);
const firstArg = args[0];
const noKeyNeeded = ['config', '--help', '-h', '--version', '-v', 'help', undefined];

if (!noKeyNeeded.includes(firstArg) && !resolveApiKey()) {
  // Defer until after parse so the help text still shows
  process.nextTick(() => {
    if (args.length > 0) {
      console.error(
        [
          '',
          `  ${theme.warning('No API key configured.')}`,
          `  ${theme.muted('Set your key:')} knowledgesdk config --key sk_ks_your_key`,
          `  ${theme.muted('Or export:')}   KNOWLEDGESDK_API_KEY=sk_ks_your_key`,
          '',
        ].join('\n'),
      );
    }
  });
}

program.parse(process.argv);
