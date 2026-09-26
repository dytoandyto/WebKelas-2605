import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

const DB_PORT = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5433;
const DB_HOST = process.env.PGHOST || '127.0.0.1';

function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function waitForPort(host, port, maxRetries = 50) {
  for (let i = 0; i < maxRetries; i++) {
    const isOnline = await checkPort(host, port);
    if (isOnline) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

async function main() {
  console.log('🚀 Starting ClassHub Development Environment...');

  let dbProcess = null;
  const isDbRunning = await checkPort(DB_HOST, DB_PORT);

  if (isDbRunning) {
    console.log(`✅ PGlite Database already active on ${DB_HOST}:${DB_PORT}`);
  } else {
    console.log(`📦 Launching embedded PGlite Database on ${DB_HOST}:${DB_PORT}...`);
    dbProcess = spawn(process.execPath, [path.join(process.cwd(), 'scripts', 'dev-db.mjs')], {
      stdio: 'inherit',
    });

    const ready = await waitForPort(DB_HOST, DB_PORT);
    if (!ready) {
      console.error('❌ Failed to start dev database.');
      if (dbProcess) dbProcess.kill();
      process.exit(1);
    }
    console.log('✅ Embedded Database ready.');
  }

  // Launch Next.js dev server
  console.log('⚡ Launching Next.js dev server...');
  const isWindows = process.platform === 'win32';
  const nextCmd = isWindows ? 'npx.cmd' : 'npx';
  const nextProcess = spawn(nextCmd, ['next', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  const cleanup = () => {
    if (nextProcess && !nextProcess.killed) {
      nextProcess.kill();
    }
    if (dbProcess && !dbProcess.killed) {
      console.log('\n🛑 Stopping embedded database...');
      dbProcess.kill();
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  nextProcess.on('exit', (code) => {
    cleanup();
  });
}

main().catch((err) => {
  console.error('Failed to launch dev environment:', err);
  process.exit(1);
});
