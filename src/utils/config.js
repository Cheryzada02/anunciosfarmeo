import 'dotenv/config';

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}

export const config = {
  token: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  guildId: process.env.GUILD_ID || null,

  allowedRoleIds: (process.env.ALLOWED_ROLE_IDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),

  announceChannelId: process.env.ANNOUNCE_CHANNEL_ID || null,

  // Color del embed (estilo logo)
  embedColor: process.env.EMBED_COLOR || '#F99E00',

  // ✅ NUEVO: logo fijo para el embed
  serverLogoUrl: process.env.SERVER_LOGO_URL || null,

  // ✅ NUEVO: video (link) que se manda ARRIBA del embed
  announceVideoUrl: process.env.ANNOUNCE_VIDEO_URL || null,

  port: Number(process.env.PORT || 10000),
  renderPingUrl: process.env.RENDER_PING_URL || null,
  pingIntervalMinutes: Number(process.env.PING_INTERVAL_MINUTES || 5),
};
