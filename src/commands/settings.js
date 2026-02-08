import chalk from 'chalk';
import inquirer from 'inquirer';
import configManager from '../core/config.js';
import logger from '../utils/logger.js';

export async function settingsCommand() {
  logger.title('⚙️  DevFlow Settings');

  const currentSettings = configManager.getSettings();

  // Show current settings
  console.log(chalk.bold('\nCurrent Settings:\n'));
  console.log(chalk.gray('Auto Git Pull:           '), currentSettings.autoGitPull ? chalk.green('Enabled') : chalk.red('Disabled'));
  console.log(chalk.gray('Open Editor New Window:  '), currentSettings.openEditorInNewWindow ? chalk.green('Yes') : chalk.red('No'));
  console.log(chalk.gray('Confirm Before Delete:   '), currentSettings.confirmBeforeDelete ? chalk.green('Yes') : chalk.red('No'));
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Change settings', value: 'change' },
        { name: 'Reset to defaults', value: 'reset' },
        { name: chalk.gray('Cancel'), value: 'cancel' }
      ]
    }
  ]);

  if (action === 'cancel') {
    return;
  }

  if (action === 'reset') {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Reset all settings to defaults?',
        default: false
      }
    ]);

    if (confirm) {
      configManager.updateSetting('autoGitPull', false);
      configManager.updateSetting('openEditorInNewWindow', true);
      configManager.updateSetting('confirmBeforeDelete', true);
      logger.success('Settings reset to defaults!');
    }
    return;
  }

  // Change settings
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoGitPull',
      message: 'Automatically pull latest changes when starting sessions?',
      default: currentSettings.autoGitPull
    },
    {
      type: 'confirm',
      name: 'openEditorInNewWindow',
      message: 'Open editor in new window?',
      default: currentSettings.openEditorInNewWindow
    },
    {
      type: 'confirm',
      name: 'confirmBeforeDelete',
      message: 'Confirm before deleting sessions?',
      default: currentSettings.confirmBeforeDelete
    }
  ]);

  // Save settings
  Object.entries(answers).forEach(([key, value]) => {
    configManager.updateSetting(key, value);
  });

  logger.success('Settings updated!');
}