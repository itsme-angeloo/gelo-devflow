import chalk from 'chalk';
import Table from 'cli-table3';
import { formatDistanceToNow } from 'date-fns';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export function statsCommand() {
  logger.title('📊 DevFlow Analytics');

  const analytics = configManager.getAnalytics();
  const sessions = configManager.getAllSessions();

  // Overall stats
  console.log(chalk.bold('\n📈 Overall Statistics\n'));
  console.log(chalk.gray('Total sessions started:'), chalk.cyan(analytics.totalStarts || 0));
  console.log(chalk.gray('Total sessions:'), chalk.cyan(Object.keys(sessions).length));
  console.log(chalk.gray('Favorite sessions:'), chalk.cyan(analytics.favorites?.length || 0));

  // Most used sessions
  if (Object.keys(analytics.sessionStarts || {}).length > 0) {
    console.log(chalk.bold('\n🏆 Most Used Sessions\n'));

    const sessionStats = Object.entries(analytics.sessionStarts)
      .map(([name, starts]) => ({
        name,
        starts,
        lastStarted: analytics.lastStartTimes[name]
      }))
      .sort((a, b) => b.starts - a.starts)
      .slice(0, 10);

    const table = new Table({
      head: [
        chalk.cyan('Rank'),
        chalk.cyan('Session'),
        chalk.cyan('Starts'),
        chalk.cyan('Last Used'),
        chalk.cyan('Favorite')
      ],
      colWidths: [8, 25, 10, 20, 12]
    });

    sessionStats.forEach((stat, index) => {
      const isFav = configManager.isFavorite(stat.name);
      const lastUsed = stat.lastStarted 
        ? formatDistanceToNow(new Date(stat.lastStarted), { addSuffix: true })
        : 'Never';

      table.push([
        chalk.yellow(`#${index + 1}`),
        stat.name,
        chalk.cyan(stat.starts),
        chalk.gray(lastUsed),
        isFav ? chalk.yellow('★') : ''
      ]);
    });

    console.log(table.toString());
  }

  // Favorites
  const favorites = configManager.getFavorites();
  if (favorites.length > 0) {
    console.log(chalk.bold('\n⭐ Favorite Sessions\n'));
    favorites.forEach(name => {
      const stats = configManager.getSessionStats(name);
      console.log(chalk.yellow('★'), chalk.cyan(name), chalk.gray(`(${stats.starts} starts)`));
    });
  }

  console.log();
}