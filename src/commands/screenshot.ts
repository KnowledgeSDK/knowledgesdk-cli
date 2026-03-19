import { writeFileSync } from 'fs';
import { Command } from 'commander';
import ora from 'ora';
import { takeScreenshot } from '../lib/api.js';
import {
  handleApiError,
  printField,
  printHeader,
  printJson,
  printSuccess,
  printInfo,
  theme,
} from '../lib/output.js';
import type { ScreenshotOptions } from '../types.js';

export function registerScreenshotCommand(program: Command): void {
  program
    .command('screenshot <url>')
    .description('Take a screenshot of a website')
    .option('-o, --output <file>', 'Save screenshot to a PNG file')
    .option('--json', 'Output raw JSON (includes base64 image data)')
    .action(async (url: string, opts: ScreenshotOptions & { json?: boolean }) => {
      const spinner = ora({
        text: `Taking screenshot of ${theme.url(url)}…`,
        color: 'cyan',
      }).start();

      try {
        const result = await takeScreenshot(url);

        spinner.stop();

        if (opts.json) {
          printJson(result);
          return;
        }

        printHeader('Screenshot');
        printField('URL', result.url);
        if (result.width && result.height) {
          printField('Dimensions', `${result.width}x${result.height}`);
        }

        if (opts.output) {
          if (result.imageBase64) {
            const buffer = Buffer.from(result.imageBase64, 'base64');
            writeFileSync(opts.output, buffer);
            printSuccess(`Screenshot saved to ${theme.url(opts.output)}`);
          } else if (result.imageUrl) {
            printInfo(`Download your screenshot from: ${theme.url(result.imageUrl)}`);
          } else {
            printInfo('No image data returned from the API.');
          }
        } else {
          if (result.imageUrl) {
            printField('Image URL', result.imageUrl);
            printInfo('Use --output screenshot.png to save the image.');
          } else if (result.imageBase64) {
            printInfo('Image returned as base64. Use --output <file.png> to save.');
          }
        }

        console.log('');
      } catch (err) {
        spinner.stop();
        handleApiError(err);
      }
    });
}
