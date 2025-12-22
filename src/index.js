import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import { startKeepAliveServer, startSelfPing } from './utils/keepAlive.js';

import ready from './events/ready.js';
import interactionCreate from './events/interactionCreate.js';

import ping from './commands/ping.js';
import anuncio from './commands/anuncio.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.commands.set(ping.data.name, ping);
client.commands.set(anuncio.data.name, anuncio);

client.once('ready', (...args) => ready.execute(...args, client));
client.on('interactionCreate', (i) => interactionCreate.execute(i, client));

startKeepAliveServer({ port: config.port });
startSelfPing({ url: config.renderPingUrl, intervalMinutes: config.pingIntervalMinutes });

client.login(config.token).catch((e) => logger.error(e?.message || e));
