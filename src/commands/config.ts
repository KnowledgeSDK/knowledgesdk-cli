import { Command } from 'commander';
import {
  getConfigFilePath,
  readConfig,
  resolveApiKey,
  resolveBaseUrl,
  writeConfig,
} from '../lib/config.js';
import {
  printError,
  printField,
  printHeader,
  printInfo,
  printSuccess,
  theme,
} from '../lib/output.js';

export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description('Manage CLI configuration (API key, base URL)');

  // knowledge config --key sk_ks_xxx
  config
    .option('-k, --key <apiKey>', 'Set your KnowledgeSDK API key')
    .option('-u, --url <baseUrl>', 'Set a custom API base URL')
    .option('--show', 'Show current configuration')
    .option('--clear', 'Remove stored configuration')
    .action((opts: { key?: string; url?: string; show?: boolean; clear?: boolean }) => {
      if (opts.clear) {
        writeConfig({ apiKey: undefined, baseUrl: undefined });
        printSuccess('Configuration cleared.');
        return;
      }

      if (opts.key || opts.url) {
        const updates: { apiKey?: string; baseUrl?: string } = {};

        if (opts.key) {
          if (!opts.key.startsWith('sk_')) {
            printError(
              'API key format looks incorrect.',
              'Keys typically start with sk_ks_...',
            );
            process.exit(1);
          }
          updates.apiKey = opts.key;
        }

        if (opts.url) {
          updates.baseUrl = opts.url;
        }

        writeConfig(updates);

        printHeader('Configuration saved');
        if (updates.apiKey) {
          const masked =
            updates.apiKey.slice(0, 8) + '••••••••' + updates.apiKey.slice(-4);
          printField('API Key', masked);
        }
        if (updates.baseUrl) {
          printField('Base URL', updates.baseUrl);
        }
        printField('Config file', getConfigFilePath());
        console.log('');
        return;
      }

      // Default: show current config
      const apiKey = resolveApiKey();
      const baseUrl = resolveBaseUrl();
      const filePath = getConfigFilePath();

      printHeader('Current configuration');
      if (apiKey) {
        const masked = apiKey.slice(0, 8) + '••••••••' + apiKey.slice(-4);
        printField('API Key', masked);
        printField(
          'Key source',
          process.env['KNOWLEDGESDK_API_KEY'] ? 'env var' : 'config file',
        );
      } else {
        printField('API Key', theme.error('not set'));
        printInfo(
          'Set your key: knowledge config --key <your-api-key>',
        );
      }
      printField('Base URL', baseUrl);
      printField('Config file', filePath);
      console.log('');
    });
}
