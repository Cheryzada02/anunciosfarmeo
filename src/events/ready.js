import { logger } from '../utils/logger.js';

export default {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`✅ Conectado como ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: 'anuncios bonitos ✨', type: 0 }],
      status: 'online',
    });
  },
};
