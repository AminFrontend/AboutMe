import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';

const commands = [
  {
    name: 'api',
    command: 'node',
    args: ['server/index.js']
  },
  {
    name: 'vite',
    command: path.join(root, 'node_modules', '.bin', isWindows ? 'vite.cmd' : 'vite'),
    args: ['--host', '0.0.0.0']
  }
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
});

function shutdown(code = 0) {
  const exitCode = typeof code === 'number' ? code : 0;

  children.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
