import chalk from 'chalk';
import { execa } from 'execa';
import logger from '../utils/logger.js';

export async function stopCommand(sessionName) {
  logger.title('🛑 Stop DevFlow Session');

  logger.info('Stopping all devflow-related processes...');

  try {
    // Find and kill processes started by devflow
    // This is a simplified version - we'll improve process tracking later
    
    if (process.platform === 'darwin' || process.platform === 'linux') {
      // On macOS/Linux, we can try to find node processes in the session path
      logger.warn('Process stopping is basic - manually stop processes if needed.');
      logger.info('Press Ctrl+C in terminal windows running devflow commands.');
    } else if (process.platform === 'win32') {
      logger.warn('Windows process stopping not yet implemented.');
      logger.info('Manually close terminal windows running devflow commands.');
    }

    logger.success('Note: Enhanced process management coming in next update!');
    
  } catch (error) {
    logger.error('Error stopping processes:');
    console.error(error.message);
  }
}