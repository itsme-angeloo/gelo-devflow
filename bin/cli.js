#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from '../src/commands/init.js';
import { listCommand } from '../src/commands/list.js';
import { startCommand } from '../src/commands/start.js';
import { deleteCommand } from '../src/commands/delete.js';
import { stopCommand } from '../src/commands/stop.js';
import { editCommand } from '../src/commands/edit.js';
import { infoCommand } from '../src/commands/info.js';
import { cloneCommand } from '../src/commands/clone.js';
import { exportCommand } from '../src/commands/export.js';
import { importCommand } from '../src/commands/import.js';
import { backupCommand } from '../src/commands/backup.js';
import { restoreCommand } from '../src/commands/restore.js';
import { doctorCommand } from '../src/commands/doctor.js';
import { statsCommand } from '../src/commands/stats.js';
import { favoriteCommand } from '../src/commands/favorite.js';
import { settingsCommand } from '../src/commands/settings.js';
import { quickCommand } from '../src/commands/quick.js';

const program = new Command();

program
  .name('devflow')
  .description('🚀 Smart development session manager')
  .version('1.0.0');

// Quick start (no arguments - interactive mode)
program
  .command('quick')
  .alias('q')
  .description('Quick start - interactive session picker')
  .action(quickCommand);

// Core commands
program
  .command('init [name]')
  .description('Create a new development session')
  .action(initCommand);

program
  .command('list')
  .alias('ls')
  .description('List all sessions')
  .action(listCommand);

program
  .command('start [name]')
  .description('Start a development session')
  .action(startCommand);

program
  .command('stop [name]')
  .description('Stop a running session')
  .action(stopCommand);

program
  .command('edit [name]')
  .description('Edit an existing session')
  .action(editCommand);

program
  .command('delete [name]')
  .alias('rm')
  .description('Delete a session')
  .action(deleteCommand);

program
  .command('info [name]')
  .description('Show detailed session information')
  .action(infoCommand);

program
  .command('clone [url]')
  .description('Clone a repository and create a session')
  .action(cloneCommand);

// Favorites & Analytics
program
  .command('favorite [name]')
  .alias('fav')
  .description('Add/remove session from favorites')
  .action(favoriteCommand);

program
  .command('stats')
  .description('Show usage statistics and analytics')
  .action(statsCommand);

// Import/Export commands
program
  .command('export [name]')
  .description('Export a session to a file')
  .action(exportCommand);

program
  .command('import [file]')
  .description('Import a session from a file')
  .action(importCommand);

program
  .command('backup')
  .description('Backup all sessions to a file')
  .action(backupCommand);

program
  .command('restore [file]')
  .description('Restore sessions from a backup file')
  .action(restoreCommand);

// Maintenance commands
program
  .command('doctor')
  .alias('check')
  .description('Check health of all sessions')
  .action(doctorCommand);

program
  .command('settings')
  .alias('config')
  .description('Configure DevFlow settings')
  .action(settingsCommand);

// Help customization
program.on('--help', () => {
  console.log('');
  console.log('Quick Start:');
  console.log('  $ devflow quick              # Interactive session picker');
  console.log('  $ devflow start my-app       # Start a specific session');
  console.log('');
  console.log('Common Commands:');
  console.log('  $ devflow init my-app        # Create new session');
  console.log('  $ devflow list               # Show all sessions');
  console.log('  $ devflow stats              # View analytics');
  console.log('  $ devflow favorite my-app    # Add to favorites');
  console.log('');
  console.log('Management:');
  console.log('  $ devflow backup             # Backup all sessions');
  console.log('  $ devflow doctor             # Health check');
  console.log('  $ devflow settings           # Configure settings');
  console.log('');
});

program.parse();