import chalk from 'chalk';
import boxen from 'boxen';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';
import gitManager from '../utils/git.js';
import fs from 'fs';

export async function infoCommand(sessionName) {
  // If no session name, use last used
  if (!sessionName) {
    sessionName = configManager.getLastUsed();
    if (!sessionName) {
      logger.error('No session specified and no last used session found.');
      return;
    }
  }

  const session = configManager.getSession(sessionName);
  
  if (!session) {
    logger.error(`Session "${sessionName}" not found.`);
    return;
  }

  // Check if path exists
  const pathExists = fs.existsSync(session.path);
  const isGit = pathExists ? await gitManager.isGitRepo(session.path) : false;

  // Build info display
  let info = '';
  
  info += chalk.bold.cyan(`\n📁 ${session.name}\n\n`);
  info += chalk.gray('Path:        ') + `${session.path} ${pathExists ? chalk.green('✓') : chalk.red('✗')}\n`;
  info += chalk.gray('Template:    ') + `${session.template || 'custom'}\n`;
  info += chalk.gray('Editor:      ') + `${session.editor || 'none'}\n`;
  
  if (session.commands && session.commands.length > 0) {
    info += chalk.gray('\nCommands:\n');
    session.commands.forEach((cmd, idx) => {
      info += chalk.gray(`  ${idx + 1}. `) + `${cmd}\n`;
    });
  }

  if (session.env && Object.keys(session.env).length > 0) {
    info += chalk.gray('\nEnvironment:\n');
    Object.entries(session.env).forEach(([key, value]) => {
      info += chalk.gray(`  ${key}=`) + `${value}\n`;
    });
  }

  // Git info
  if (isGit) {
    const repoInfo = await gitManager.getRepoInfo(session.path);
    if (repoInfo) {
      info += chalk.gray('\n🌿 Git:\n');
      info += chalk.gray('  Current branch: ') + `${repoInfo.branch}\n`;
      
      if (session.git?.branch) {
        info += chalk.gray('  Target branch:  ') + `${session.git.branch}\n`;
      }

      if (repoInfo.modified > 0 || repoInfo.created > 0 || repoInfo.deleted > 0) {
        info += chalk.yellow(`  Uncommitted changes: ${repoInfo.modified + repoInfo.created + repoInfo.deleted}\n`);
      }

      if (repoInfo.remotes.length > 0) {
        info += chalk.gray('  Remote: ') + `${repoInfo.remotes[0].name}\n`;
      }
    }
  } else if (session.git) {
    info += chalk.gray('\n🌿 Git:\n');
    info += chalk.yellow('  Not a git repository\n');
  }

  // Metadata
  info += chalk.gray('\nMetadata:\n');
  info += chalk.gray('  Created:  ') + `${new Date(session.createdAt).toLocaleString()}\n`;
  info += chalk.gray('  Updated:  ') + `${new Date(session.updatedAt).toLocaleString()}\n`;

  // Display in a box
  console.log(boxen(info, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }));

  logger.info(`Run ${chalk.cyan(`devflow start ${sessionName}`)} to start this session`);
}