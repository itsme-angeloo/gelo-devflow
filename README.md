# 🚀 DevFlow - Smart Development Session Manager

> Never waste time on repetitive project setup again. DevFlow remembers your workflows so you don't have to.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/devflow)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Built with GitHub Copilot](https://img.shields.io/badge/Built%20with-GitHub%20Copilot%20CLI-purple.svg)](https://github.com/features/copilot)

## 🎯 The Problem

As a developer, you probably do this every single day:
```bash
# Morning routine 😩
cd ~/projects/my-app
code .
npm run dev
git checkout feature-branch
export NODE_ENV=development
# ... repeat for every project you work on

Every. Single. Time.
When you work on 5+ projects, this adds up to 10-20 minutes per day of pure repetition.

The Solution
``` devflow start my-app

## Installation
``` # Clone the repository
git clone https://github.com/yourusername/devflow.git
cd devflow

# Install dependencies
npm install

# Link globally
npm link

# Verify installation
devflow --version

Create your first session
devflow init my-project
```

Answer the interactive prompts:
```
? Would you like to use a template? Yes
? Choose a template: React Application
? Session name: my-project
? Project path: /Users/you/projects/my-project
? Which editor do you use? code
? Commands to run: npm install, npm run dev
? Git branch (optional): main

## Start Working
``` devflow start my-project

## Core Commands
```
# Session Management
devflow init [name]         # Create a new session (with templates!)
devflow start [name]        # Start a session (opens editor + runs commands)
devflow quick               # Interactive session picker (fastest way!)
devflow list                # List all sessions with stats
devflow info [name]         # Show detailed session information
devflow edit [name]         # Edit an existing session
devflow delete [name]       # Delete a session

# Favorites & Analytics
devflow favorite [name]     # Toggle favorite status ⭐
devflow stats               # View detailed usage analytics

# Git & Collaboration
devflow clone [url]         # Clone repo and create session automatically

# Import/Export & Backup
devflow export [name]       # Export single session to .json file
devflow import [file]       # Import session from .json file
devflow backup              # Backup ALL sessions to single file
devflow restore [file]      # Restore sessions from backup

# Maintenance
devflow doctor              # Health check all sessions
devflow settings            # Configure DevFlow preferences