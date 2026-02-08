import Conf from 'conf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  constructor() {
    // Store for user sessions
    this.store = new Conf({
      projectName: 'devflow',
      schema: {
        sessions: {
          type: 'object',
          default: {}
        },
        lastUsed: {
          type: 'string',
          default: ''
        },
        analytics: {
          type: 'object',
          default: {
            totalStarts: 0,
            sessionStarts: {},
            lastStartTimes: {},
            favorites: []
          }
        },
        settings: {
          type: 'object',
          default: {
            autoGitPull: false,
            openEditorInNewWindow: true,
            confirmBeforeDelete: true
          }
        }
      }
    });
  }

  // Get all sessions
  getAllSessions() {
    return this.store.get('sessions', {});
  }

  // Get a specific session
  getSession(name) {
    const sessions = this.getAllSessions();
    return sessions[name] || null;
  }

  // Save a session
  saveSession(name, sessionData) {
    const sessions = this.getAllSessions();
    sessions[name] = {
      ...sessionData,
      name,
      createdAt: sessionData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.store.set('sessions', sessions);
    return sessions[name];
  }

  // Delete a session
  deleteSession(name) {
    const sessions = this.getAllSessions();
    if (sessions[name]) {
      delete sessions[name];
      this.store.set('sessions', sessions);
      
      // Also remove from favorites
      this.removeFavorite(name);
      
      return true;
    }
    return false;
  }

  // Check if session exists
  sessionExists(name) {
    const sessions = this.getAllSessions();
    return name in sessions;
  }

  // Update last used session
  setLastUsed(name) {
    this.store.set('lastUsed', name);
  }

  // Get last used session
  getLastUsed() {
    return this.store.get('lastUsed', '');
  }

  // Analytics methods
  recordSessionStart(sessionName) {
    const analytics = this.store.get('analytics');
    
    analytics.totalStarts = (analytics.totalStarts || 0) + 1;
    analytics.sessionStarts[sessionName] = (analytics.sessionStarts[sessionName] || 0) + 1;
    analytics.lastStartTimes[sessionName] = new Date().toISOString();
    
    this.store.set('analytics', analytics);
  }

  getAnalytics() {
    return this.store.get('analytics');
  }

  getSessionStats(sessionName) {
    const analytics = this.getAnalytics();
    return {
      starts: analytics.sessionStarts[sessionName] || 0,
      lastStarted: analytics.lastStartTimes[sessionName] || null
    };
  }

  // Favorites
  addFavorite(sessionName) {
    const analytics = this.store.get('analytics');
    if (!analytics.favorites.includes(sessionName)) {
      analytics.favorites.push(sessionName);
      this.store.set('analytics', analytics);
      return true;
    }
    return false;
  }

  removeFavorite(sessionName) {
    const analytics = this.store.get('analytics');
    const index = analytics.favorites.indexOf(sessionName);
    if (index > -1) {
      analytics.favorites.splice(index, 1);
      this.store.set('analytics', analytics);
      return true;
    }
    return false;
  }

  isFavorite(sessionName) {
    const analytics = this.store.get('analytics');
    return analytics.favorites.includes(sessionName);
  }

  getFavorites() {
    const analytics = this.store.get('analytics');
    return analytics.favorites || [];
  }

  // Settings
  getSettings() {
    return this.store.get('settings');
  }

  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.store.set('settings', settings);
  }

  // Validate session data
  validateSession(sessionData) {
    const errors = [];

    if (!sessionData.name) {
      errors.push('Session name is required');
    }

    if (!sessionData.path) {
      errors.push('Project path is required');
    }

    if (sessionData.path && !fs.existsSync(sessionData.path)) {
      errors.push(`Path does not exist: ${sessionData.path}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new ConfigManager();