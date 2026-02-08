import inquirer from 'inquirer';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';
import { listTemplates } from '../templates/presets.js';

export async function cloneCommand(repoUrl, options) {
  logger.title('📦 Clone Repository & Create Session');

  // Ask for repo URL if not provided
  if (!repoUrl) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Repository URL:',
        validate: (input) => {
          if (!input.trim()) return 'Repository URL is required';
          if (!input.includes('github.com') && !input.includes('gitlab.com') && !input.includes('.git')) {
            return 'Please provide a valid git repository URL';
          }
          return true;
        }
      }
    ]);
    repoUrl = answer.url;
  }

  // Extract repo name from URL
  const repoName = repoUrl.split('/').pop().replace('.git', '');

  // Ask for clone destination
  const { clonePath, sessionName, useTemplate } = await inquirer.prompt([
    {
      type: 'input',
      name: 'clonePath',
      message: 'Where to clone?',
      default: path.join(process.cwd(), repoName)
    },
    {
      type: 'input',
      name: 'sessionName',
      message: 'Session name:',
      default: repoName,
      validate: (input) => {
        if (!input.trim()) return 'Session name is required';
        if (configManager.sessionExists(input)) {
          return `Session "${input}" already exists`;
        }
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'useTemplate',
      message: 'Apply a template to this session?',
      default: true
    }
  ]);

  // Check if directory already exists
  if (fs.existsSync(clonePath)) {
    logger.error(`Directory already exists: ${clonePath}`);
    return;
  }

  try {
    // Clone the repository
    logger.startSpinner('Cloning repository...');
    const git = simpleGit();
    await git.clone(repoUrl, clonePath);
    logger.stopSpinner('Repository cloned successfully!');

    // Template selection
    let templateConfig = null;
    if (useTemplate) {
      const templates = listTemplates();
      const { selectedTemplate } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedTemplate',
          message: 'Choose a template:',
          choices: [
            ...templates.map(t => ({
              name: `${t.name} - ${chalk.gray(t.description)}`,
              value: t.key
            })),
            { name: chalk.gray('Custom (no template)'), value: null }
          ]
        }
      ]);

      if (selectedTemplate) {
        const { getTemplate } = await import('../templates/presets.js');
        templateConfig = getTemplate(selectedTemplate);
      }
    }

    // Get additional session details
    const sessionDetails = await inquirer.prompt([
      {
        type: 'list',
        name: 'editor',
        message: 'Which editor?',
        choices: ['code', 'cursor', 'webstorm', 'sublime', 'atom', 'none'],
        default: templateConfig?.config.editor || 'code'
      },
      {
        type: 'input',
        name: 'commands',
        message: 'Commands to run (comma-separated):',
        default: templateConfig?.config.commands.join(', ') || 'npm install, npm run dev',
        filter: (input) => {
          if (!input.trim()) return [];
          return input.split(',').map(cmd => cmd.trim()).filter(cmd => cmd);
        }
      }
    ]);

    // Create session
    const session = {
      name: sessionName,
      path: clonePath,
      editor: sessionDetails.editor !== 'none' ? sessionDetails.editor : null,
      commands: sessionDetails.commands,
      git: { branch: 'main' },
      env: templateConfig?.config.env || {},
      template: templateConfig?.name || 'custom'
    };

    configManager.saveSession(sessionName, session);
    logger.success(`Session "${sessionName}" created!`);
    logger.printSession(session);
    logger.info(`Run ${chalk.cyan(`devflow start ${sessionName}`)} to start working`);

  } catch (error) {
    logger.error('Failed to clone repository:');
    console.error(error.message);
  }
}