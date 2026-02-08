import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function importCommand(filePath, options) {
  logger.title('📥 Import DevFlow Session');

  // Ask for file path if not provided
  if (!filePath) {
    const { selectedFile } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selectedFile',
        message: 'Path to .devflow.json file:',
        validate: (input) => {
          if (!input.trim()) return 'File path is required';
          if (!fs.existsSync(input)) return 'File does not exist';
          if (!input.endsWith('.json')) return 'File must be a .json file';
          return true;
        }
      }
    ]);
    filePath = selectedFile;
  }

  try {
    // Read and parse file
    logger.startSpinner('Reading session file...');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const sessionData = JSON.parse(fileContent);
    logger.stopSpinner('File loaded successfully!');

    // Validate session data
    if (!sessionData.name || !sessionData.path) {
      logger.error('Invalid session file format!');
      logger.info('Required fields: name, path');
      return;
    }

    // Check if session already exists
    if (configManager.sessionExists(sessionData.name)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Session "${sessionData.name}" already exists. Overwrite?`,
          default: false
        }
      ]);

      if (!overwrite) {
        // Ask for new name
        const { newName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'newName',
            message: 'Enter a new name for this session:',
            default: `${sessionData.name}-imported`,
            validate: (input) => {
              if (!input.trim()) return 'Name is required';
              return true;
            }
          }
        ]);
        sessionData.name = newName;
      }
    }

    // Ask if user wants to update the path
    const { updatePath } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'updatePath',
        message: `Current path is "${sessionData.path}". Update it?`,
        default: !fs.existsSync(sessionData.path)
      }
    ]);

    if (updatePath) {
      const { newPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'newPath',
          message: 'New project path:',
          default: process.cwd(),
          validate: (input) => {
            if (!fs.existsSync(input)) {
              return `Path does not exist: ${input}`;
            }
            return true;
          }
        }
      ]);
      sessionData.path = newPath;
    }

    // Save session
    logger.startSpinner('Importing session...');
    configManager.saveSession(sessionData.name, sessionData);
    logger.stopSpinner(`Session "${sessionData.name}" imported successfully!`);

    logger.printSession(sessionData);
    logger.info(`Run ${chalk.cyan(`devflow start ${sessionData.name}`)} to start this session`);

  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error('Invalid JSON file format!');
    } else {
      logger.error('Failed to import session:');
      console.error(error.message);
    }
  }
}