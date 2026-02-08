import inquirer from 'inquirer';
import chalk from 'chalk';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function deleteCommand(sessionName) {
  logger.title('🗑️  Delete DevFlow Session');

  // If no session name provided, show list to choose from
  if (!sessionName) {
    const sessions = configManager.getAllSessions();
    const sessionNames = Object.keys(sessions);

    if (sessionNames.length === 0) {
      logger.warn('No sessions found.');
      return;
    }

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Which session do you want to delete?',
        choices: sessionNames
      }
    ]);

    sessionName = selected;
  }

  // Check if session exists
  if (!configManager.sessionExists(sessionName)) {
    logger.error(`Session "${sessionName}" not found.`);
    return;
  }

  // Confirm deletion
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.red(`Are you sure you want to delete "${sessionName}"?`),
      default: false
    }
  ]);

  if (!confirm) {
    logger.info('Deletion cancelled.');
    return;
  }

  // Delete
  logger.startSpinner('Deleting session...');
  const deleted = configManager.deleteSession(sessionName);
  
  if (deleted) {
    logger.stopSpinner(`Session "${sessionName}" deleted successfully!`);
  } else {
    logger.stopSpinner('Failed to delete session.', false);
  }
}