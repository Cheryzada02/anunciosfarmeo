import express from 'express';
import { logger } from './logger.js';

export function startKeepAliveServer({ port }) {
  const app = express();

  app.get('/', (_, res) => res.status(200).send('OK'));
  app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

  app.listen(port, () => logger.info(`Keep-alive HTTP escuchando en :${port}`));
}

export function startSelfPing({ url, intervalMinutes }) {
  if (https://github.com/Cheryzada02/anunciosfarmeo) {
    logger.warn('Si no hay URL no hay autoping');
    return;
  }

  const intervalMs = Math.max(1, intervalMinutes) * 60_000;

  async function ping() {
    try {
      const res = await fetch(url, { method: 'GET' });
      logger.info(`Self-ping ${url} -> ${res.status}`);
    } catch (e) {
      logger.warn(`Self-ping falló: ${e?.message || e}`);
    }
  }

  ping();
  setInterval(ping, intervalMs);
}
