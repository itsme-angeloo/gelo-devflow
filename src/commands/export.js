import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function exportCommand(sessionName, options) {
  logger.title('📤 Export DevFlow Session');

  // Get session
  let session;
  if (!sessionName) {
    const sessions = configManager.getAllSessions();
    const sessionNames = Object.keys(sessions);

    if (sessionNames.length === 0) {
      logger.warn('No sessions found to export.');
      return;
    }

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Which session do you want to export?',
        choices: sessionNames
      }
    ]);

    sessionName = selected;
  }

  session = configManager.getSession(sessionName);

  if (!session) {
    logger.error(`Session "${sessionName}" not found.`);
    return;
  }

  // Ask for export location
  const defaultPath = path.join(process.cwd(), `${sessionName}.devflow.json`);
  
  const { exportPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'exportPath',
      message: 'Export to:',
      default: defaultPath
    }
  ]);

  try {
    // Write session to file
    logger.startSpinner('Exporting session...');
    fs.writeFileSync(exportPath, JSON.stringify(session, null, 2));
    logger.stopSpinner('Session exported successfully!');

    logger.success(`Exported to: ${chalk.cyan(exportPath)}`);
    logger.info('Share this file with others or use it as a backup!');
  } catch (error) {
    logger.error('Failed to export session:');
    console.error(error.message);
  }
}