import chalk from 'chalk';
import inquirer from 'inquirer';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function favoriteCommand(sessionName, options) {
  // If no session name, show list to choose from
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
        message: 'Which session do you want to favorite/unfavorite?',
        choices: sessionNames.map(name => ({
          name: configManager.isFavorite(name) ? `${name} ${chalk.yellow('★')}` : name,
          value: name
        }))
      }
    ]);

    sessionName = selected;
  }

  // Check if session exists
  if (!configManager.sessionExists(sessionName)) {
    logger.error(`Session "${sessionName}" not found.`);
    return;
  }

  // Toggle favorite
  const isFav = configManager.isFavorite(sessionName);

  if (isFav) {
    configManager.removeFavorite(sessionName);
    logger.success(`Removed "${sessionName}" from favorites`);
  } else {
    configManager.addFavorite(sessionName);
    logger.success(`Added "${sessionName}" to favorites ${chalk.yellow('★')}`);
  }
}