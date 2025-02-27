// Monaco Bundle Builder Build Script
const { execSync } = require('child_process');
const { copyFileSync, mkdirSync, readFileSync, writeFileSync, cpSync, existsSync } = require('fs');
const { join, dirname, resolve } = require('path');

// Configuration
const rootDir = resolve(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

// CLI Arguments
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const isWatch = args.includes('--watch');
const isCopyResources = args.includes('--copy-resources');

// Only copy resources if specified
if (isCopyResources) {
  copyResources();
  process.exit(0);
}

// Ensure output directory exists
mkdirSync(distDir, { recursive: true });

// Build options
const buildOptions = {
  entryPoints: [
    join(srcDir, 'index.ts'),
    join(srcDir, 'wasmLoader.ts'),
    join(srcDir, 'language-service-worker.ts'),
    join(srcDir, 'compiler-worker.ts')
  ],
  bundle: true,
  platform: 'browser',
  target: ['es2020', 'chrome64', 'edge79', 'firefox62', 'safari11.1'],
  sourcemap: isDev ? 'inline' : false,
  minify: !isDev,
  outdir: distDir,
  external: [],
  loader: { 
    '.ts': 'ts',
    '.js': 'js'
  },
};

// Execute build using esbuild
function buildBundle() {
  console.log(`Building bundle in ${isDev ? 'development' : 'production'} mode`);
  try {
    const command = `npx esbuild ${buildOptions.entryPoints.join(' ')} --bundle --platform=${buildOptions.platform} --target=${buildOptions.target.join(',')} ${buildOptions.sourcemap ? `--sourcemap=${buildOptions.sourcemap}` : ''} ${buildOptions.minify ? '--minify' : ''} --outdir=${buildOptions.outdir}`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('Build completed successfully!');
    
    copyFilesToOutput();
    
    copyResources();
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

function copyFilesToOutput() {
  const templatePath = join(publicDir, 'template.html');
  const outputHtmlPath = join(distDir, 'monaco.html');
  
  if (existsSync(templatePath)) {
    let templateContent = readFileSync(templatePath, 'utf8');
    
    templateContent = templateContent.replace(
      'http://localhost:8080/index.js',
      './index.js'
    );
    
    writeFileSync(outputHtmlPath, templateContent);
    console.log(`Copied and modified template to ${outputHtmlPath}`);
  } else {
    console.warn(`Template file not found: ${templatePath}`);
  }
  
  // Copy test HTML
  const testHtmlSrc = join(rootDir, 'test.html');
  const testHtmlDest = join(distDir, 'test.html');
  copyFileSync(testHtmlSrc, testHtmlDest);
  console.log(`Copied test.html to ${testHtmlDest}`);
}

function copyResources() {
  console.log('Copying external resources...');
  
  const nodeModulesDir = join(rootDir, 'node_modules');
  const monacoSrcDir = join(nodeModulesDir, 'monaco-editor', isDev ? 'dev' : 'min');
  const monacoDestDir = join(distDir, 'vs');
  
  // Ensure destination directory exists
  mkdirSync(monacoDestDir, { recursive: true });
  
  try {
    // Copy Monaco resources
    if (existsSync(join(monacoSrcDir, 'vs'))) {
      cpSync(join(monacoSrcDir, 'vs'), monacoDestDir, { recursive: true });
      console.log('Monaco resources copied successfully');
    } else {
      console.error(`Monaco source directory not found: ${join(monacoSrcDir, 'vs')}`);
    }
    
    // Copy Q# WASM files if available
    const qsharpWasmDir = join(nodeModulesDir, 'qsharp-lang', 'lib', 'web');
    const qsharpDestDir = join(distDir, 'qsharp');
    
    if (existsSync(qsharpWasmDir)) {
      mkdirSync(qsharpDestDir, { recursive: true });
      
      if (existsSync(join(qsharpWasmDir, 'qsc_wasm_bg.wasm'))) {
        copyFileSync(
          join(qsharpWasmDir, 'qsc_wasm_bg.wasm'),
          join(qsharpDestDir, 'qsc_wasm_bg.wasm')
        );
        console.log('Q# WASM file copied successfully');
      } else {
        console.warn('Q# WASM file not found');
      }
    } else {
      console.warn(`Q# WASM directory not found: ${qsharpWasmDir}`);
    }
  } catch (error) {
    console.error('Error copying resources:', error);
    process.exit(1);
  }
}

if (isWatch) {
  console.log('Starting watch mode...');
  const { watch } = require('fs');
  
  buildBundle();
  
  watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.ts')) {
      console.log(`\nFile ${filename} changed, rebuilding...`);
      buildBundle();
    }
  });
  
  console.log('Watching for changes... (Press Ctrl+C to stop)');
} else {
  buildBundle();
}