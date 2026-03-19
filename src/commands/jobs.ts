import { Command } from 'commander';
import ora from 'ora';
import { getJob } from '../lib/api.js';
import {
  colorizeStatus,
  handleApiError,
  printError,
  printField,
  printHeader,
  printJson,
  printSuccess,
  theme,
} from '../lib/output.js';
import type { JobStatus } from '../types.js';

const TERMINAL_STATUSES: JobStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED'];
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 100; // 5 minutes at 3s intervals

export function registerJobsCommand(program: Command): void {
  const jobs = program.command('jobs').description('Manage and monitor async jobs');

  // ── get ─────────────────────────────────────────────────────────────────────
  jobs
    .command('get <jobId>')
    .description('Get the current status of a job')
    .option('--json', 'Output raw JSON')
    .action(async (jobId: string, opts: { json?: boolean }) => {
      const spinner = ora({
        text: `Fetching job ${theme.bold(jobId)}…`,
        color: 'cyan',
      }).start();

      try {
        const job = await getJob(jobId);

        spinner.stop();

        if (opts.json) {
          printJson(job);
          return;
        }

        printJobDetails(job);
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });

  // ── poll ────────────────────────────────────────────────────────────────────
  jobs
    .command('poll <jobId>')
    .description('Poll a job until it completes (or fails)')
    .option('--json', 'Output final result as raw JSON')
    .option(
      '-i, --interval <ms>',
      'Polling interval in milliseconds',
      parseInt,
      POLL_INTERVAL_MS,
    )
    .action(
      async (
        jobId: string,
        opts: { json?: boolean; interval?: number },
      ) => {
        const interval = opts.interval ?? POLL_INTERVAL_MS;
        const spinner = ora({
          text: `Polling job ${theme.bold(jobId)}…`,
          color: 'cyan',
        }).start();

        let attempts = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          attempts++;

          try {
            const job = await getJob(jobId);

            const progress =
              job.progress !== undefined ? ` (${job.progress}%)` : '';
            spinner.text = `Job ${theme.bold(jobId)} — ${colorizeStatus(job.status)}${progress}`;

            if (TERMINAL_STATUSES.includes(job.status)) {
              spinner.stop();

              if (opts.json) {
                printJson(job);
                return;
              }

              printJobDetails(job);

              if (job.status === 'COMPLETED') {
                printSuccess('Job completed successfully.');
              } else {
                printError(
                  `Job ended with status: ${job.status}`,
                  job.error,
                );
                process.exit(1);
              }

              console.log('');
              return;
            }

            if (attempts >= MAX_POLL_ATTEMPTS) {
              spinner.stop();
              printError(
                `Timed out after ${MAX_POLL_ATTEMPTS} polling attempts.`,
                `Check status manually: knowledgesdk jobs get ${jobId}`,
              );
              process.exit(1);
            }

            await sleep(interval);
          } catch (err) {
            spinner.stop();
            handleApiError(err);
          }
        }
      },
    );
}

function printJobDetails(job: {
  jobId: string;
  status: JobStatus;
  type?: string;
  url?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  error?: string;
  result?: unknown;
  progress?: number;
}): void {
  printHeader('Job details');
  printField('Job ID', job.jobId);
  printField('Status', colorizeStatus(job.status));
  if (job.type) printField('Type', job.type);
  if (job.url) printField('URL', job.url);
  if (job.progress !== undefined) printField('Progress', `${job.progress}%`);
  printField('Created', job.createdAt);
  if (job.updatedAt) printField('Updated', job.updatedAt);
  if (job.completedAt) printField('Completed', job.completedAt);
  if (job.error) {
    console.log('');
    console.log(`  ${theme.label('Error')}`);
    console.log(`  ${theme.error(job.error)}`);
  }
  if (job.result && job.status === 'COMPLETED') {
    console.log('');
    console.log(`  ${theme.label('Result preview')}`);
    const preview = JSON.stringify(job.result, null, 2).slice(0, 500);
    console.log(
      preview
        .split('\n')
        .map((l) => `  ${theme.dim(l)}`)
        .join('\n'),
    );
    if (JSON.stringify(job.result).length > 500) {
      console.log(theme.muted('  … (truncated, use --json for full output)'));
    }
  }
  console.log('');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
