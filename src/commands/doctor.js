import fs from 'fs';
import chalk from 'chalk';
import Table from 'cli-table3';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';
import gitManager from '../utils/git.js';

export async function doctorCommand() {
  logger.title('🩺 DevFlow Health Check');

  const sessions = configManager.getAllSessions();
  const sessionNames = Object.keys(sessions);

  if (sessionNames.length === 0) {
    logger.warn('No sessions found.');
    return;
  }

  logger.info(`Checking ${sessionNames.length} session(s)...\n`);

  const issues = [];
  const table = new Table({
    head: [
      chalk.cyan('Session'),
      chalk.cyan('Path'),
      chalk.cyan('Editor'),
      chalk.cyan('Git'),
      chalk.cyan('Status')
    ],
    colWidths: [20, 25, 12, 8, 15]
  });

  for (const name of sessionNames) {
    const session = sessions[name];
    const problems = [];

    // Check 1: Path exists
    const pathExists = fs.existsSync(session.path);
    if (!pathExists) {
      problems.push('Path missing');
    }

    // Check 2: Editor command exists
    let editorOk = true;
    if (session.editor) {
      // We'll assume it's ok for now (hard to check without running)
      editorOk = true;
    }

    // Check 3: Git repo if git config exists
    let gitStatus = '-';
    if (session.git && pathExists) {
      const isGit = await gitManager.isGitRepo(session.path);
      if (!isGit) {
        problems.push('Not a git repo');
        gitStatus = chalk.red('✗');
      } else {
        gitStatus = chalk.green('✓');
      }
    }

    // Determine status
    let status;
    if (problems.length === 0) {
      status = chalk.green('✓ OK');
    } else {
      status = chalk.red(`✗ ${problems.length} issue(s)`);
      issues.push({ session: name, problems });
    }

    table.push([
      name,
      pathExists ? chalk.green(session.path.slice(-20)) : chalk.red('Missing'),
      session.editor || '-',
      gitStatus,
      status
    ]);
  }

  console.log(table.toString());
  console.log();

  // Show detailed issues
  if (issues.length > 0) {
    logger.warn(`Found issues in ${issues.length} session(s):\n`);
    issues.forEach(({ session, problems }) => {
      console.log(chalk.yellow(`⚠ ${session}:`));
      problems.forEach(problem => {
        console.log(chalk.gray(`  - ${problem}`));
      });
      console.log();
    });

    logger.info('Fix suggestions:');
    console.log(chalk.gray(`  - Update paths: ${chalk.cyan('devflow edit <session>')}`));
    console.log(chalk.gray(`  - Remove broken sessions: ${chalk.cyan('devflow delete <session>')}`));
  } else {
    logger.success('All sessions are healthy! 🎉');
  }
}