import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDirectory = path.join(projectRoot, 'server');
const wrapper = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
const mode = process.argv[2] ?? 'run';
const goals = {
  run: ['spring-boot:run'],
  test: ['test'],
  package: ['package'],
};

if (!goals[mode]) {
  console.error(`Unknown server mode: ${mode}. Use run, test, or package.`);
  process.exit(1);
}

const executable = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : wrapper;
const args = process.platform === 'win32'
  ? ['/d', '/c', [wrapper, ...goals[mode]].join(' ')]
  : goals[mode];

const child = spawn(executable, args, {
  cwd: serverDirectory,
  env: process.env,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error('Unable to start the Maven wrapper:', error.message);
  process.exit(1);
});

child.on('exit', (code) => process.exit(code ?? 1));
