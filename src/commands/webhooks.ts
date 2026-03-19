import { Command } from 'commander';
import ora from 'ora';
import {
  createWebhook,
  deleteWebhook,
  listWebhooks,
} from '../lib/api.js';
import {
  handleApiError,
  printError,
  printField,
  printHeader,
  printJson,
  printSuccess,
  theme,
  sym,
} from '../lib/output.js';
import type { WebhookEvent } from '../types.js';

export function registerWebhooksCommand(program: Command): void {
  const webhooks = program
    .command('webhooks')
    .description('Manage webhooks for event notifications');

  // ── list ────────────────────────────────────────────────────────────────────
  webhooks
    .command('list')
    .description('List all configured webhooks')
    .option('--json', 'Output raw JSON')
    .action(async (opts: { json?: boolean }) => {
      const spinner = ora({ text: 'Fetching webhooks…', color: 'cyan' }).start();

      try {
        const result = await listWebhooks();

        spinner.stop();

        if (opts.json) {
          printJson(result);
          return;
        }

        printHeader('Webhooks');
        printField('Total', result.total);
        console.log('');

        if (result.webhooks.length === 0) {
          console.log(
            `  ${sym.info} ${theme.muted('No webhooks configured.')}`,
          );
          console.log(
            `  ${theme.muted('Create one with:')} knowledgesdk webhooks create --url <url> --events <events>`,
          );
          console.log('');
          return;
        }

        for (const wh of result.webhooks) {
          const status = wh.active
            ? theme.success('active')
            : theme.error('inactive');
          console.log(`  ${sym.bullet} ${theme.bold(wh.id)}`);
          console.log(`    ${theme.label('URL')}       ${theme.url(wh.url)}`);
          console.log(`    ${theme.label('Status')}    ${status}`);
          console.log(
            `    ${theme.label('Events')}    ${wh.events.map((e) => theme.info(e)).join(', ')}`,
          );
          console.log(`    ${theme.label('Created')}   ${theme.dim(wh.createdAt)}`);
          console.log('');
        }
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });

  // ── create ──────────────────────────────────────────────────────────────────
  webhooks
    .command('create')
    .description('Create a new webhook')
    .requiredOption('-u, --url <url>', 'Endpoint URL to receive events')
    .option(
      '-e, --events <events>',
      'Comma-separated list of events (e.g. EXTRACTION_COMPLETED,PAGE_SCRAPED)',
      'EXTRACTION_COMPLETED',
    )
    .option('--json', 'Output raw JSON')
    .action(
      async (opts: { url: string; events: string; json?: boolean }) => {
        const validEvents: WebhookEvent[] = [
          'EXTRACTION_COMPLETED',
          'EXTRACTION_FAILED',
          'PAGE_SCRAPED',
          'JOB_STARTED',
          'JOB_FAILED',
        ];

        const requestedEvents = opts.events
          .split(',')
          .map((e) => e.trim().toUpperCase()) as WebhookEvent[];

        const invalidEvents = requestedEvents.filter(
          (e) => !validEvents.includes(e),
        );

        if (invalidEvents.length > 0) {
          printError(
            `Invalid event(s): ${invalidEvents.join(', ')}`,
            `Valid events: ${validEvents.join(', ')}`,
          );
          process.exit(1);
        }

        const spinner = ora({
          text: `Creating webhook for ${theme.url(opts.url)}…`,
          color: 'cyan',
        }).start();

        try {
          const webhook = await createWebhook(opts.url, requestedEvents);

          spinner.stop();

          if (opts.json) {
            printJson(webhook);
            return;
          }

          printHeader('Webhook created');
          printField('ID', webhook.id);
          printField('URL', webhook.url);
          printField(
            'Events',
            webhook.events.map((e) => theme.info(e)).join(', '),
          );
          printField('Status', webhook.active ? theme.success('active') : theme.error('inactive'));
          printField('Created', webhook.createdAt);
          console.log('');
          printSuccess(`Webhook ${theme.bold(webhook.id)} created.`);
          console.log('');
        } catch (err) {
          spinner.stop();
          handleApiError(err);
        }
      },
    );

  // ── delete ──────────────────────────────────────────────────────────────────
  webhooks
    .command('delete <id>')
    .description('Delete a webhook by ID')
    .action(async (id: string) => {
      const spinner = ora({
        text: `Deleting webhook ${theme.bold(id)}…`,
        color: 'cyan',
      }).start();

      try {
        await deleteWebhook(id);

        spinner.stop();
        printSuccess(`Webhook ${theme.bold(id)} deleted.`);
        console.log('');
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });
}
