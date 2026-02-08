import fs from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function restoreCommand(backupPath, options) {
  logger.title('♻️  Restore Sessions from Backup');

  // Ask for backup file if not provided
  if (!backupPath) {
    const { selectedFile } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selectedFile',
        message: 'Path to backup file:',
        validate: (input) => {
          if (!input.trim()) return 'File path is required';
          if (!fs.existsSync(input)) return 'File does not exist';
          return true;
        }
      }
    ]);
    backupPath = selectedFile;
  }

  try {
    // Read backup file
    logger.startSpinner('Reading backup file...');
    const fileContent = fs.readFileSync(backupPath, 'utf-8');
    const backup = JSON.parse(fileContent);
    logger.stopSpinner('Backup loaded successfully!');

    if (!backup.sessions || typeof backup.sessions !== 'object') {
      logger.error('Invalid backup file format!');
      return;
    }

    const backupSessionNames = Object.keys(backup.sessions);
    logger.info(`Found ${backupSessionNames.length} session(s) in backup.`);
    logger.info(`Backup created: ${new Date(backup.exportedAt).toLocaleString()}`);

    // Check for conflicts
    const existingSessions = configManager.getAllSessions();
    const conflicts = backupSessionNames.filter(name => name in existingSessions);

    if (conflicts.length > 0) {
      logger.warn(`${conflicts.length} session(s) already exist:`);
      conflicts.forEach(name => console.log(chalk.yellow(`  - ${name}`)));
      
      const { strategy } = await inquirer.prompt([
        {
          type: 'list',
          name: 'strategy',
          message: 'How to handle conflicts?',
          choices: [
            { name: 'Skip existing sessions', value: 'skip' },
            { name: 'Overwrite existing sessions', value: 'overwrite' },
            { name: 'Rename conflicting sessions', value: 'rename' },
            { name: 'Cancel restore', value: 'cancel' }
          ]
        }
      ]);

      if (strategy === 'cancel') {
        logger.info('Restore cancelled.');
        return;
      }

      // Restore sessions
      logger.startSpinner('Restoring sessions...');
      let restored = 0;
      let skipped = 0;

      for (const [name, sessionData] of Object.entries(backup.sessions)) {
        if (name in existingSessions) {
          if (strategy === 'skip') {
            skipped++;
            continue;
          } else if (strategy === 'rename') {
            const newName = `${name}-restored`;
            configManager.saveSession(newName, { ...sessionData, name: newName });
            restored++;
          } else {
            // overwrite
            configManager.saveSession(name, sessionData);
            restored++;
          }
        } else {
          configManager.saveSession(name, sessionData);
          restored++;
        }
      }

      logger.stopSpinner('Restore complete!');
      logger.success(`Restored ${restored} session(s)`);
      if (skipped > 0) {
        logger.info(`Skipped ${skipped} existing session(s)`);
      }

    } else {
      // No conflicts, restore all
      logger.startSpinner('Restoring sessions...');
      let restored = 0;

      for (const [name, sessionData] of Object.entries(backup.sessions)) {
        configManager.saveSession(name, sessionData);
        restored++;
      }

      logger.stopSpinner(`Restored ${restored} session(s) successfully!`);
    }

    logger.info(`Run ${chalk.cyan('devflow list')} to see your sessions.`);

  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error('Invalid backup file format!');
    } else {
      logger.error('Failed to restore backup:');
      console.error(error.message);
    }
  }
}