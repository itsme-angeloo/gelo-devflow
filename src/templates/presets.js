export const templates = {
  'react-app': {
    name: 'React Application',
    description: 'Modern React app with Vite',
    config: {
      editor: 'code',
      commands: [
        'npm install',
        'npm run dev'
      ],
      env: {
        NODE_ENV: 'development'
      }
    }
  },
  
  'node-api': {
    name: 'Node.js API',
    description: 'Express.js REST API',
    config: {
      editor: 'code',
      commands: [
        'npm install',
        'npm run dev'
      ],
      env: {
        NODE_ENV: 'development',
        PORT: '3000'
      }
    }
  },
  
  'nextjs': {
    name: 'Next.js App',
    description: 'Next.js with TypeScript',
    config: {
      editor: 'code',
      commands: [
        'npm install',
        'npm run dev'
      ],
      env: {
        NODE_ENV: 'development'
      }
    }
  },
  
  'python-flask': {
    name: 'Python Flask API',
    description: 'Flask REST API',
    config: {
      editor: 'code',
      commands: [
        'pip install -r requirements.txt',
        'python app.py'
      ],
      env: {
        FLASK_ENV: 'development',
        FLASK_APP: 'app.py'
      }
    }
  },
  
  'vue-app': {
    name: 'Vue.js Application',
    description: 'Vue 3 with Vite',
    config: {
      editor: 'code',
      commands: [
        'npm install',
        'npm run dev'
      ],
      env: {
        NODE_ENV: 'development'
      }
    }
  }
};

export function getTemplate(templateName) {
  return templates[templateName] || null;
}

export function listTemplates() {
  return Object.keys(templates).map(key => ({
    key,
    ...templates[key]
  }));
}