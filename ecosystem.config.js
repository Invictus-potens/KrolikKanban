module.exports = {
  apps: [
    {
      name: 'krolikkanban',
      script: 'npm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Restart policy
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Environment variables
      env_file: '.env',
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Health check
      health_check_grace_period: 3000,
      
      // Auto restart
      autorestart: true,
      
      // Cron restart (every day at 2 AM)
      cron_restart: '0 2 * * *',
    },
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/KrolikKanban.git',
      path: '/var/www/krolikkanban',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};