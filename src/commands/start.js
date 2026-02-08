import { execa } from 'execa';
import open from 'open';
import chalk from 'chalk';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';
import gitManager from '../utils/git.js';

export async function startCommand(sessionName, options) {
  logger.title('🚀 Starting DevFlow Session');

  // Get session
  let session;
  if (!sessionName) {
    // Use last used session
    const lastUsed = configManager.getLastUsed();
    if (!lastUsed) {
      logger.error('No session specified and no last used session found.');
      logger.info(`Use: ${chalk.cyan('devflow start <session-name>')}`);
      return;
    }
    sessionName = lastUsed;
    logger.info(`Using last session: ${chalk.cyan(sessionName)}`);
  }

  session = configManager.getSession(sessionName);

  if (!session) {
    logger.error(`Session "${sessionName}" not found.`);
    logger.info(`Run ${chalk.cyan('devflow list')} to see available sessions.`);
    return;
  }

  logger.printSession(session);

    // Update last used and record analytics
    configManager.setLastUsed(sessionName);
    configManager.recordSessionStart(sessionName);

  try {
    // 1. Check if it's a git repository
    const isGit = await gitManager.isGitRepo(session.path);
    
    if (isGit) {
      logger.info('📦 Git repository detected');
      
      // Get current branch
      const currentBranch = await gitManager.getCurrentBranch(session.path);
      console.log(chalk.gray(`   Current branch: ${currentBranch}`));

      // Checkout branch if specified
      if (session.git && session.git.branch) {
        if (currentBranch !== session.git.branch) {
          logger.info(`Switching to branch: ${chalk.cyan(session.git.branch)}`);
          await gitManager.checkoutBranch(session.path, session.git.branch);
        } else {
          logger.success(`Already on branch: ${chalk.cyan(currentBranch)}`);
        }
      }

      // Optional: Pull latest changes
      if (session.git && session.git.autoPull) {
        await gitManager.pullLatest(session.path);
      }
    }

    // 2. Open editor
    if (session.editor) {
      logger.startSpinner(`Opening ${session.editor}...`);
      await open(session.path, { app: { name: session.editor } });
      logger.stopSpinner(`Opened ${session.editor}`);
    }

    // 3. Run commands
    if (session.commands && session.commands.length > 0) {
      logger.info(`\n⚡ Running ${session.commands.length} command(s)...\n`);

      for (const [index, command] of session.commands.entries()) {
        console.log(chalk.cyan(`[${index + 1}/${session.commands.length}]`), chalk.gray(command));
        
        try {
          // For dev servers and long-running commands, we want to run them in background
          // For install commands, we want to wait
          const isLongRunning = command.includes('dev') || 
                               command.includes('start') || 
                               command.includes('serve');

          if (isLongRunning) {
            // Run in background
            const subprocess = execa(command, {
              cwd: session.path,
              shell: true,
              env: {
                ...process.env,
                ...session.env
              },
              stdio: 'inherit',
              detached: true
            });

            subprocess.unref(); // Allow parent to exit independently
            
          } else {
            // Wait for completion (for install commands, etc.)
            await execa(command, {
              cwd: session.path,
              shell: true,
              env: {
                ...process.env,
                ...session.env
              },
              stdio: 'inherit'
            });
          }
          
        } catch (cmdError) {
          logger.warn(`Command had issues: ${command}`);
          console.error(cmdError.message);
        }
      }

      console.log();
      logger.success(`✨ Session "${sessionName}" started successfully!`);
      logger.info(`Working directory: ${chalk.gray(session.path)}`);
      
      if (isGit) {
        const repoInfo = await gitManager.getRepoInfo(session.path);
        if (repoInfo) {
          console.log(chalk.gray(`   Branch: ${repoInfo.branch}`));
          if (repoInfo.modified > 0) {
            console.log(chalk.yellow(`   Modified files: ${repoInfo.modified}`));
          }
        }
      }
      
    } else {
      logger.success(`✨ Session "${sessionName}" started (editor only)`);
    }

  } catch (error) {
    logger.error('Failed to start session:');
    console.error(error.message);
  }
}