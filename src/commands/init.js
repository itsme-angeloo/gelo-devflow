import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';
import { getTemplate, listTemplates } from '../templates/presets.js';

export async function initCommand(sessionName, options) {
  logger.title('🚀 Create New DevFlow Session');

  // Check if session already exists
  if (sessionName && configManager.sessionExists(sessionName)) {
    logger.error(`Session "${sessionName}" already exists!`);
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite it?',
        default: false
      }
    ]);

    if (!overwrite) {
      logger.info('Init cancelled.');
      return;
    }
  }

  // Ask if user wants to use a template
  const { useTemplate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useTemplate',
      message: 'Would you like to use a template?',
      default: true
    }
  ]);

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
      templateConfig = getTemplate(selectedTemplate);
      logger.success(`Using template: ${templateConfig.name}`);
    }
  }

  // Interactive prompts
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Session name:',
      default: sessionName || path.basename(process.cwd()),
      validate: (input) => {
        if (!input.trim()) return 'Session name is required';
        if (input.includes(' ')) return 'Session name cannot contain spaces';
        return true;
      }
    },
    {
      type: 'input',
      name: 'path',
      message: 'Project path:',
      default: process.cwd(),
      validate: (input) => {
        if (!fs.existsSync(input)) {
          return `Path does not exist: ${input}`;
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'editor',
      message: 'Which editor do you use?',
      choices: ['code', 'cursor', 'webstorm', 'sublime', 'atom', 'none'],
      default: templateConfig?.config.editor || 'code'
    },
    {
      type: 'input',
      name: 'commands',
      message: 'Commands to run (comma-separated):',
      default: templateConfig?.config.commands.join(', ') || '',
      filter: (input) => {
        if (!input.trim()) return [];
        return input.split(',').map(cmd => cmd.trim()).filter(cmd => cmd);
      }
    },
    {
      type: 'input',
      name: 'gitBranch',
      message: 'Git branch (optional):',
      default: ''
    },
    {
      type: 'confirm',
      name: 'addEnvVars',
      message: 'Add environment variables?',
      default: templateConfig?.config.env ? true : false
    }
  ]);

  // Environment variables
  let envVars = templateConfig?.config.env || {};
  
  if (answers.addEnvVars) {
    const { envInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'envInput',
        message: 'Environment variables (KEY=value, comma-separated):',
        default: Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join(', ')
      }
    ]);

    if (envInput.trim()) {
      envVars = {};
      envInput.split(',').forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key && value) {
          envVars[key] = value;
        }
      });
    }
  }

  // Build session object
  const session = {
    name: answers.name,
    path: answers.path,
    editor: answers.editor !== 'none' ? answers.editor : null,
    commands: answers.commands,
    git: answers.gitBranch ? { branch: answers.gitBranch } : null,
    env: envVars,
    template: templateConfig ? templateConfig.name : 'custom'
  };

  // Validate
  const validation = configManager.validateSession(session);
  if (!validation.isValid) {
    logger.error('Invalid session configuration:');
    validation.errors.forEach(err => logger.error(`  - ${err}`));
    return;
  }

  // Save
  logger.startSpinner('Creating session...');
  const savedSession = configManager.saveSession(session.name, session);
  logger.stopSpinner(`Session "${savedSession.name}" created successfully!`);

  // Print summary
  logger.printSession(savedSession);
  logger.info(`Run ${chalk.cyan(`devflow start ${savedSession.name}`)} to start this session`);
}