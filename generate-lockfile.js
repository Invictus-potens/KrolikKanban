#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Generating package-lock.json...');

try {
  // Check if package-lock.json already exists
  const lockfilePath = path.join(process.cwd(), 'package-lock.json');
  
  if (fs.existsSync(lockfilePath)) {
    console.log('package-lock.json already exists. Removing it to regenerate...');
    fs.unlinkSync(lockfilePath);
  }
  
  // Run npm install to generate package-lock.json
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ package-lock.json generated successfully!');
  console.log('You can now use npm ci in CI/CD environments.');
  
} catch (error) {
  console.error('❌ Error generating package-lock.json:', error.message);
  process.exit(1);
}