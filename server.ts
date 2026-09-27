import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { recordAutomationActivity } from './server/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) === 3001 ? 3000 : (Number(process.env.PORT) || 3000);

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Siri Birthday & Email Automation Server running on http://0.0.0.0:${PORT}`);
    recordAutomationActivity('SCHEDULER_CHECK', `Scheduler engine initialized on port ${PORT}`);
  });
}

startServer();
