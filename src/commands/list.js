import chalk from 'chalk';
import Table from 'cli-table3';
import { formatDistanceToNow } from 'date-fns';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function listCommand(options) {
  logger.title('📋 Your DevFlow Sessions');

  const sessions = configManager.getAllSessions();
  const sessionNames = Object.keys(sessions);

  if (sessionNames.length === 0) {
    logger.warn('No sessions found.');
    logger.info(`Create one with: ${chalk.cyan('devflow init')}`);
    return;
  }

  const lastUsed = configManager.getLastUsed();
  const favorites = configManager.getFavorites();

  // Separate favorites and regular sessions
  const favSessions = sessionNames.filter(name => favorites.includes(name));
  const regularSessions = sessionNames.filter(name => !favorites.includes(name));

  // Sort by usage
  const sortedFavorites = favSessions.sort((a, b) => {
    const aStats = configManager.getSessionStats(a);
    const bStats = configManager.getSessionStats(b);
    return bStats.starts - aStats.starts;
  });

  const sortedRegular = regularSessions.sort((a, b) => {
    const aStats = configManager.getSessionStats(a);
    const bStats = configManager.getSessionStats(b);
    return bStats.starts - aStats.starts;
  });

  // Create table
  const table = new Table({
    head: [
      chalk.cyan(''),
      chalk.cyan('Name'),
      chalk.cyan('Template'),
      chalk.cyan('Commands'),
      chalk.cyan('Starts'),
      chalk.cyan('Last Used')
    ],
    colWidths: [4, 22, 15, 10, 10, 18]
  });

  // Add favorites
  if (sortedFavorites.length > 0) {
    sortedFavorites.forEach(name => {
      const session = sessions[name];
      const stats = configManager.getSessionStats(name);
      const isLast = name === lastUsed;
      const status = isLast ? chalk.green('●') : ' ';
      const template = session.template || 'custom';
      const cmdCount = session.commands ? session.commands.length : 0;
      const lastStarted = stats.lastStarted 
        ? formatDistanceToNow(new Date(stats.lastStarted), { addSuffix: true })
        : 'Never';

      table.push([
        chalk.yellow('★'),
        isLast ? chalk.bold.green(name) : chalk.cyan(name),
        chalk.gray(template),
        chalk.gray(`${cmdCount}`),
        chalk.cyan(stats.starts || 0),
        chalk.gray(lastStarted)
      ]);
    });
  }

  // Add regular sessions
  sortedRegular.forEach(name => {
    const session = sessions[name];
    const stats = configManager.getSessionStats(name);
    const isLast = name === lastUsed;
    const status = isLast ? chalk.green('●') : ' ';
    const template = session.template || 'custom';
    const cmdCount = session.commands ? session.commands.length : 0;
    const lastStarted = stats.lastStarted 
      ? formatDistanceToNow(new Date(stats.lastStarted), { addSuffix: true })
      : 'Never';

    table.push([
      status,
      isLast ? chalk.bold.green(name) : name,
      chalk.gray(template),
      chalk.gray(`${cmdCount}`),
      chalk.cyan(stats.starts || 0),
      chalk.gray(lastStarted)
    ]);
  });

  console.log(table.toString());
  console.log();

  if (lastUsed) {
    console.log(chalk.green('●'), chalk.gray(`Currently active: ${lastUsed}`));
  }
  
  console.log(chalk.gray(`\nTotal: ${sessionNames.length} session(s) | Favorites: ${favorites.length}`));
  console.log(chalk.gray(`Run ${chalk.cyan('devflow start <name>')} to start a session`));
  console.log(chalk.gray(`Run ${chalk.cyan('devflow stats')} to see detailed analytics`));
}