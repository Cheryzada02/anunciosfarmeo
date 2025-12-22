import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

import { config } from '../utils/config.js';

function memberHasAllowedRole(member) {
  if (!config.allowedRoleIds.length) return false;
  return member.roles.cache.some((r) => config.allowedRoleIds.includes(r.id));
}

function isValidHttpUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function anuncioModal() {
  return new ModalBuilder()
    .setCustomId('anuncio_modal')
    .setTitle('📣 Crear anuncio')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Título')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(80)
          .setRequired(false)
          .setPlaceholder('Ej: Evento hoy a las 8pm ✨')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('message')
          .setLabel('Mensaje')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(2000)
          .setRequired(true)
          .setPlaceholder('Escribe el anuncio aquí...')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('image')
          .setLabel('Imagen (URL opcional)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setPlaceholder('https://... (jpg/png/gif)')
      )
    );
}

async function buildAnnouncementEmbed({ guild, member, title, message, imageUrl }) {
  const logo = config.serverLogoUrl || guild.iconURL({ size: 256 }) || null;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `${guild.name} • Anuncio`, iconURL: logo ?? undefined })
    .setTitle(title?.length ? title : '📣 Nuevo anuncio')
    .setDescription(message || '—')
    .setThumbnail(logo)
    .setColor(config.embedColor || '#F99E00')
    .addFields(
      { name: 'Publicado por', value: `${member}`, inline: true },
      { name: 'Servidor', value: `${guild.name}`, inline: true }
    )
    .setFooter({ text: 'Sistema de anuncios', iconURL: logo ?? undefined })
    .setTimestamp();

  if (imageUrl && isValidHttpUrl(imageUrl)) {
    embed.setImage(imageUrl);
  }

  return embed;
}

async function handleAnuncioModal(interaction) {
  // ✅ Aquí asumimos que interactionCreate YA hizo deferReply(ephemeral)
  const title = interaction.fields.getTextInputValue('title')?.trim();
  const message = interaction.fields.getTextInputValue('message')?.trim();
  const imageUrl = interaction.fields.getTextInputValue('image')?.trim();

  const channelId = config.announceChannelId;
  const channel = channelId ? interaction.guild.channels.cache.get(channelId) : null;

  if (!channel || !channel.isTextBased()) {
    return interaction.editReply({
      content:
        '⚠️ No se encontró el canal de anuncios configurado.\n' +
        'Configura `ANNOUNCE_CHANNEL_ID` en tu `.env` con el ID correcto.',
    });
  }

  if (imageUrl && !isValidHttpUrl(imageUrl)) {
    return interaction.editReply({
      content: '⚠️ La imagen debe ser una URL válida (http/https).',
    });
  }

  const embed = await buildAnnouncementEmbed({
    guild: interaction.guild,
    member: interaction.member,
    title,
    message,
    imageUrl,
  });

  // Video arriba (si existe)
  if (config.announceVideoUrl && isValidHttpUrl(config.announceVideoUrl)) {
    await channel.send({
      content: config.announceVideoUrl,
      allowedMentions: { parse: [] },
    });
  }

  // Embed después
  await channel.send({ embeds: [embed] });

  return interaction.editReply({
    content: `✅ Anuncio publicado en ${channel}.`,
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName('anuncio')
    .setDescription('Crea un anuncio con embed estético (solo roles autorizados).')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction, client) {
    // OJO: este execute se llama con deferReply ya hecho por interactionCreate
    // Si alguien ejecuta sin defer, igual sirve porque editReply fallaría.
    // Por eso interactionCreate ahora siempre hace deferReply.

    if (!memberHasAllowedRole(interaction.member)) {
      return interaction.editReply({
        content: '⛔ No tienes permisos para usar este comando.',
      });
    }

    if (!config.announceChannelId) {
      return interaction.editReply({
        content:
          '⚠️ No hay canal de anuncios configurado.\n' +
          'Configura `ANNOUNCE_CHANNEL_ID` en tu `.env`.',
      });
    }

    if (config.serverLogoUrl && !isValidHttpUrl(config.serverLogoUrl)) {
      return interaction.editReply({
        content: '⚠️ `SERVER_LOGO_URL` no es una URL válida (http/https).',
      });
    }

    if (config.announceVideoUrl && !isValidHttpUrl(config.announceVideoUrl)) {
      return interaction.editReply({
        content: '⚠️ `ANNOUNCE_VIDEO_URL` no es una URL válida (http/https).',
      });
    }

    if (!client.modals) client.modals = {};
    if (!client.handlers) client.handlers = {};

    client.modals.anuncioModal = anuncioModal;
    client.handlers.handleAnuncioModal = handleAnuncioModal;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('anuncio_open_modal')
        .setLabel('Escribir anuncio')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId('anuncio_cancel')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✖️')
    );

    return interaction.editReply({
      content: '📣 Listo. Pulsa **Escribir anuncio** y completa el formulario.',
      components: [row],
    });
  },
};
