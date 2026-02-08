import simpleGit from 'simple-git';
import logger from './logger.js';
import fs from 'fs';
import path from 'path';

class GitManager {
  /**
   * Check if a directory is a git repository
   */
  async isGitRepo(projectPath) {
    try {
      const git = simpleGit(projectPath);
      await git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(projectPath) {
    try {
      const git = simpleGit(projectPath);
      const status = await git.status();
      return status.current;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all branches
   */
  async getAllBranches(projectPath) {
    try {
      const git = simpleGit(projectPath);
      const branches = await git.branchLocal();
      return branches.all;
    } catch (error) {
      return [];
    }
  }

  /**
   * Checkout a branch
   */
  async checkoutBranch(projectPath, branchName) {
    try {
      const git = simpleGit(projectPath);
      
      // Check if branch exists
      const branches = await this.getAllBranches(projectPath);
      
      if (!branches.includes(branchName)) {
        logger.warn(`Branch "${branchName}" does not exist.`);
        return false;
      }

      // Check for uncommitted changes
      const status = await git.status();
      if (status.files.length > 0) {
        logger.warn('You have uncommitted changes!');
        logger.info('Stashing changes...');
        await git.stash();
      }

      // Checkout branch
      await git.checkout(branchName);
      logger.success(`Switched to branch "${branchName}"`);
      return true;
    } catch (error) {
      logger.error(`Failed to checkout branch: ${error.message}`);
      return false;
    }
  }

  /**
   * Pull latest changes
   */
  async pullLatest(projectPath) {
    try {
      const git = simpleGit(projectPath);
      logger.info('Pulling latest changes...');
      await git.pull();
      logger.success('Successfully pulled latest changes');
      return true;
    } catch (error) {
      logger.error(`Failed to pull: ${error.message}`);
      return false;
    }
  }

  /**
   * Get repository info
   */
  async getRepoInfo(projectPath) {
    try {
      const git = simpleGit(projectPath);
      const status = await git.status();
      const remotes = await git.getRemotes(true);
      
      return {
        branch: status.current,
        ahead: status.ahead,
        behind: status.behind,
        modified: status.modified.length,
        created: status.created.length,
        deleted: status.deleted.length,
        remotes: remotes.map(r => ({ name: r.name, url: r.refs.fetch }))
      };
    } catch (error) {
      return null;
    }
  }
}

export default new GitManager();