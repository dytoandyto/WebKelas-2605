import { PGlite } from '@electric-sql/pglite';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fromNodeSocket } from 'pg-gateway/node';

const dbPath = path.resolve(process.cwd(), 'prisma/dev-db');
fs.mkdirSync(dbPath, { recursive: true });

console.log(`[dev-db] Initializing PGlite at ${dbPath}...`);
const db = new PGlite(dbPath);
await db.waitReady;

// Ensure database 'classhub' exists
try {
  const res = await db.query("SELECT 1 FROM pg_database WHERE datname = 'classhub'");
  if (res.rows.length === 0) {
    await db.query('CREATE DATABASE classhub');
    console.log("[dev-db] Created database 'classhub'");
  }
} catch {
  // Ignore if already exists
}

console.log('[dev-db] PGlite database engine is ready.');

// Mutex queue to serialize protocol execution across concurrent client connections
let queue = Promise.resolve();
function runExclusive(fn) {
  const result = queue.then(() => fn());
  queue = result.catch(() => {});
  return result;
}

const server = net.createServer(async (socket) => {
  socket.on('error', (err) => {
    if (err.code !== 'ECONNRESET' && err.code !== 'EPIPE') {
      console.error('[dev-db] Socket error:', err.message);
    }
  });

  try {
    await fromNodeSocket(socket, {
      serverVersion: '16.3',
      auth: { method: 'trust' },
      async onStartup() {
        await db.waitReady;
      },
      async onMessage(data) {
        // Handle Postgres SSLRequest (length: 8, code: 80877103 -> 0x04D2162F)
        if (data.length === 8) {
          const buf = Buffer.from(data);
          if (buf.readInt32BE(0) === 8 && buf.readInt32BE(4) === 80877103) {
            // Respond with 'N' to indicate SSL is not supported
            return new Uint8Array([0x4e]);
          }
        }
        return await runExclusive(() => db.execProtocolRaw(data));
      },
    });
  } catch (err) {
    if (err.code !== 'ECONNRESET' && err.code !== 'EPIPE') {
      console.error('[dev-db] Connection error:', err.message || err);
    }
  }
});

const PORT = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5433;
const HOST = process.env.PGHOST || '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`[dev-db] PGlite PostgreSQL server listening on ${HOST}:${PORT}`);
});