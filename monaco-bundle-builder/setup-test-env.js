const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.resolve(__dirname, 'dist');

const requiredFiles = [
  'vs/loader.js',
  'vs/editor/editor.main.css',
  'wasmLoader.js',
  'index.js',
  'language-service-worker.js',
  'compiler-worker.js',
  'test.html'
];

console.log('Checking for required files in the dist directory...');

let missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${file}`);
    missingFiles.push(file);
  } else {
    console.log(`✓ Found: ${file}`);
  }
}

if (missingFiles.length > 0) {
  console.log('Some files are missing. Running build...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed. Checking files again...');
    
    let stillMissing = false;
    for (const file of missingFiles) {
      const filePath = path.join(distDir, file);
      if (!fs.existsSync(filePath)) {
        console.error(`Still missing after build: ${file}`);
        stillMissing = true;
      } else {
        console.log(`✓ Created: ${file}`);
      }
    }
    
    if (stillMissing) {
      console.error('Some required files are still missing. Please check the build process.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

console.log('All required files present. Test environment ready!');
console.log('Run "npm run test-server" to start the test server');
console.log('Then open http://localhost:8080/test.html in your browser');