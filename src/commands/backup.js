import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function backupCommand(options) {
  logger.title('💾 Backup All Sessions');

  const sessions = configManager.getAllSessions();
  const sessionCount = Object.keys(sessions).length;

  if (sessionCount === 0) {
    logger.warn('No sessions to backup.');
    return;
  }

  logger.info(`Found ${sessionCount} session(s) to backup.`);

  // Ask for backup location
  const defaultPath = path.join(process.cwd(), `devflow-backup-${Date.now()}.json`);
  
  const { backupPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'backupPath',
      message: 'Backup to:',
      default: defaultPath
    }
  ]);

  try {
    // Create backup object
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      sessionCount: sessionCount,
      sessions: sessions
    };

    // Write to file
    logger.startSpinner('Creating backup...');
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    logger.stopSpinner('Backup created successfully!');

    logger.success(`Backed up ${sessionCount} session(s) to:`);
    console.log(chalk.cyan(backupPath));
    logger.info('Keep this file safe! You can restore it anytime with:');
    console.log(chalk.gray(`  devflow restore ${backupPath}`));

  } catch (error) {
    logger.error('Failed to create backup:');
    console.error(error.message);
  }
}