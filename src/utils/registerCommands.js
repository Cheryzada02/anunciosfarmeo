import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { logger } from './logger.js';

import ping from '../commands/ping.js';
import anuncio from '../commands/anuncio.js';

const commands = [ping.data.toJSON(), anuncio.data.toJSON()];
const rest = new REST({ version: '10' }).setToken(config.token);

async function main() {
  try {
    if (config.guildId) {
      logger.info(`Registrando comandos en guild ${config.guildId}...`);
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
      logger.info('✅ Comandos registrados (GUILD).');
    } else {
      logger.info('Registrando comandos globales...');
      await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
      logger.info('✅ Comandos registrados (GLOBAL).');
    }
  } catch (err) {
    logger.error(err?.stack || String(err));
    process.exit(1);
  }
}

main();
