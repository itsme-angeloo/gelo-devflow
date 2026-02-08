import chalk from 'chalk';
import inquirer from 'inquirer';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';
import { startCommand } from './start.js';

export async function quickCommand() {
  logger.title('⚡ Quick Start');

  const favorites = configManager.getFavorites();
  const sessions = configManager.getAllSessions();
  const lastUsed = configManager.getLastUsed();

  if (Object.keys(sessions).length === 0) {
    logger.warn('No sessions found.');
    logger.info(`Create one with: ${chalk.cyan('devflow init')}`);
    return;
  }

  // Build choices: favorites first, then most used
  const analytics = configManager.getAnalytics();
  const sortedByUsage = Object.entries(analytics.sessionStarts || {})
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name)
    .filter(name => sessions[name]); // Only existing sessions

  const choices = [];

  // Add last used
  if (lastUsed && sessions[lastUsed]) {
    choices.push({
      name: `${chalk.green('●')} ${lastUsed} ${chalk.gray('(last used)')}`,
      value: lastUsed
    });
    choices.push(new inquirer.Separator());
  }

  // Add favorites
  if (favorites.length > 0) {
    favorites.forEach(name => {
      if (name !== lastUsed && sessions[name]) {
        const stats = configManager.getSessionStats(name);
        choices.push({
          name: `${chalk.yellow('★')} ${name} ${chalk.gray(`(${stats.starts} starts)`)}`,
          value: name
        });
      }
    });
    if (favorites.length > 0) {
      choices.push(new inquirer.Separator());
    }
  }

  // Add most used (excluding already shown)
  const shownSessions = new Set([lastUsed, ...favorites]);
  sortedByUsage
    .filter(name => !shownSessions.has(name))
    .slice(0, 5)
    .forEach(name => {
      const stats = configManager.getSessionStats(name);
      choices.push({
        name: `  ${name} ${chalk.gray(`(${stats.starts} starts)`)}`,
        value: name
      });
    });

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Select a session:',
      choices,
      pageSize: 15
    }
  ]);

  // Start the selected session
  await startCommand(selected);
}