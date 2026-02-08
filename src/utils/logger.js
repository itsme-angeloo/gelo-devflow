import chalk from 'chalk';
import ora from 'ora';

class Logger {
  constructor() {
    this.spinner = null;
  }

  // Success messages
  success(message) {
    console.log(chalk.green('✓') + ' ' + message);
  }

  // Error messages
  error(message) {
    console.log(chalk.red('✗') + ' ' + message);
  }

  // Info messages
  info(message) {
    console.log(chalk.blue('ℹ') + ' ' + message);
  }

  // Warning messages
  warn(message) {
    console.log(chalk.yellow('⚠') + ' ' + message);
  }

  // Title/header
  title(message) {
    console.log('\n' + chalk.bold.cyan(message) + '\n');
  }

  // Spinner for loading states
  startSpinner(message) {
    this.spinner = ora(message).start();
  }

  stopSpinner(message, isSuccess = true) {
    if (this.spinner) {
      if (isSuccess) {
        this.spinner.succeed(message);
      } else {
        this.spinner.fail(message);
      }
      this.spinner = null;
    }
  }

  // Pretty print session info
  printSession(session) {
    console.log(chalk.bold('\n📁 Session:'), chalk.cyan(session.name));
    console.log(chalk.bold('📂 Path:'), session.path);
    if (session.editor) {
      console.log(chalk.bold('💻 Editor:'), session.editor);
    }
    if (session.commands && session.commands.length > 0) {
      console.log(chalk.bold('⚡ Commands:'));
      session.commands.forEach((cmd, idx) => {
        console.log(`  ${idx + 1}. ${chalk.gray(cmd)}`);
      });
    }
    console.log();
  }
}

export default new Logger();