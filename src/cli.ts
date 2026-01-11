#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { listCommand } from './commands/list';

const program = new Command();

program
  .name('z-command')
  .description('Install curated GitHub Copilot skills and agents for your project')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize skills and agents in current project')
  .option('-s, --skills', 'Install skills only')
  .option('-a, --agents', 'Install agents only')
  .option('-g, --global', 'Install to user home directory')
  .option('-c, --category <name>', 'Install specific category only')
  .action(initCommand);

program
  .command('list')
  .description('List available skills and agents')
  .option('-s, --skills', 'List skills only')
  .option('-a, --agents', 'List agents only')
  .action(listCommand);

program.parse();
