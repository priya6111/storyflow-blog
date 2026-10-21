import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('===============================================================');
console.log('🚀 Starting StoryFlow Blog Platform (Full-Stack)');
console.log('   Backend:  http://localhost:5000');
console.log('   Frontend: http://localhost:5173');
console.log('===============================================================\n');

// 1. Launch Backend
const backend = spawn(npmCmd, ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true,
});

backend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => console.log(`\x1b[36m[Backend]\x1b[0m ${line}`));
});

backend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => console.error(`\x1b[31m[Backend Error]\x1b[0m ${line}`));
});

// 2. Launch Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true,
});

frontend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => console.log(`\x1b[32m[Frontend]\x1b[0m ${line}`));
});

frontend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => console.error(`\x1b[33m[Frontend Warn]\x1b[0m ${line}`));
});

const cleanup = () => {
  console.log('\nShutting down StoryFlow servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
