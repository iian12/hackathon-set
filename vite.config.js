import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { randomUUID } from 'node:crypto';

// A new ID for each server process, shared by HTTP, React and browser checks.
const serverId = randomUUID();
export default defineConfig({
  plugins: [react(), {
    name: 'server-identity',
    configureServer(server) {
      server.middlewares.use('/__server_identity', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify({ app: 'cofa-exam-kit', serverId, port: 3000 }));
      });
    },
  }],
  define: { __SERVER_ID__: JSON.stringify(serverId) },
  server: { host: '0.0.0.0', port: 3000, strictPort: true },
  preview: { host: '0.0.0.0', port: 3000, strictPort: true },
});
