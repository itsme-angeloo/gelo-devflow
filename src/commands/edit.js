import inquirer from 'inquirer';
import chalk from 'chalk';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function editCommand(sessionName) {
  logger.title('✏️  Edit DevFlow Session');

  // If no session name provided, show list
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
        message: 'Which session do you want to edit?',
        choices: sessionNames
      }
    ]);

    sessionName = selected;
  }

  // Get existing session
  const session = configManager.getSession(sessionName);
  if (!session) {
    logger.error(`Session "${sessionName}" not found.`);
    return;
  }

  logger.printSession(session);

  // Ask what to edit
  const { field } = await inquirer.prompt([
    {
      type: 'list',
      name: 'field',
      message: 'What do you want to edit?',
      choices: [
        { name: 'Commands', value: 'commands' },
        { name: 'Path', value: 'path' },
        { name: 'Editor', value: 'editor' },
        { name: 'Git Branch', value: 'git' },
        { name: 'Environment Variables', value: 'env' },
        { name: chalk.gray('Cancel'), value: 'cancel' }
      ]
    }
  ]);

  if (field === 'cancel') {
    return;
  }

  let updates = {};

  switch (field) {
    case 'commands':
      const { commands } = await inquirer.prompt([
        {
          type: 'input',
          name: 'commands',
          message: 'Commands (comma-separated):',
          default: session.commands.join(', ')
        }
      ]);
      updates.commands = commands.split(',').map(cmd => cmd.trim()).filter(cmd => cmd);
      break;

    case 'path':
      const { path } = await inquirer.prompt([
        {
          type: 'input',
          name: 'path',
          message: 'Project path:',
          default: session.path
        }
      ]);
      updates.path = path;
      break;

    case 'editor':
      const { editor } = await inquirer.prompt([
        {
          type: 'list',
          name: 'editor',
          message: 'Editor:',
          choices: ['code', 'cursor', 'webstorm', 'sublime', 'atom', 'none'],
          default: session.editor || 'code'
        }
      ]);
      updates.editor = editor !== 'none' ? editor : null;
      break;

    case 'git':
      const { branch } = await inquirer.prompt([
        {
          type: 'input',
          name: 'branch',
          message: 'Git branch:',
          default: session.git?.branch || ''
        }
      ]);
      updates.git = branch ? { branch } : null;
      break;

    case 'env':
      const currentEnv = Object.entries(session.env || {})
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      
      const { envInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'envInput',
          message: 'Environment variables (KEY=value, comma-separated):',
          default: currentEnv
        }
      ]);

      const envVars = {};
      if (envInput.trim()) {
        envInput.split(',').forEach(pair => {
          const [key, value] = pair.split('=').map(s => s.trim());
          if (key && value) {
            envVars[key] = value;
          }
        });
      }
      updates.env = envVars;
      break;
  }

  // Save updates
  const updatedSession = { ...session, ...updates };
  logger.startSpinner('Updating session...');
  configManager.saveSession(sessionName, updatedSession);
  logger.stopSpinner('Session updated successfully!');

  logger.printSession(updatedSession);
}