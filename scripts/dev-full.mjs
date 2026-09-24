import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDirectory = path.join(projectRoot, 'server');
const serverWrapper = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let frontend;
let server;
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (frontend && !frontend.killed) frontend.kill('SIGTERM');
  if (server && !server.killed) server.kill('SIGTERM');
  setTimeout(() => process.exit(code), 300);
}

const serverExecutable = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : serverWrapper;
const serverArgs = process.platform === 'win32'
  ? ['/d', '/c', `${serverWrapper} spring-boot:run`]
  : ['spring-boot:run'];
server = spawn(serverExecutable, serverArgs, {
  cwd: serverDirectory,
  env: process.env,
  stdio: 'inherit',
});

server.on('error', (error) => {
  console.error('Unable to start the API:', error.message);
  stop(1);
});

server.on('exit', (code) => {
  if (!stopping) {
    console.error(`API stopped before Vite started (exit ${code ?? 1}).`);
    stop(code ?? 1);
  }
});

async function waitForApi() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (stopping) return;
    try {
      const response = await fetch('http://127.0.0.1:8080/actuator/health');
      if (response.ok) return;
    } catch {
      // The API is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error('API did not become healthy within 120 seconds.');
}

try {
  await waitForApi();
  console.log('\nKindred API is ready. Starting the React workspace...\n');
  const frontendExecutable = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : npmCommand;
  const frontendArgs = process.platform === 'win32'
    ? ['/d', '/c', `${npmCommand} run dev -- --host 127.0.0.1`]
    : ['run', 'dev', '--', '--host', '127.0.0.1'];
  frontend = spawn(frontendExecutable, frontendArgs, {
    cwd: projectRoot,
    env: { ...process.env, VITE_API_BASE_URL: '/api' },
    stdio: 'inherit',
  });
  frontend.on('error', (error) => {
    console.error('Unable to start Vite:', error.message);
    stop(1);
  });
  frontend.on('exit', (code) => stop(code ?? 0));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  stop(1);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
