import { logger } from '../utils/logger.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Slash commands
      if (interaction.isChatInputCommand()) {
        const cmd = client.commands?.get(interaction.commandName);
        if (!cmd) return;

        // ✅ ACK temprano por si un comando tarda
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        await cmd.execute(interaction, client);
        return;
      }

      // Buttons
      if (interaction.isButton()) {
        const { customId } = interaction;

        if (customId === 'anuncio_open_modal') {
          const modalFactory = client.modals?.anuncioModal;
          if (!modalFactory) {
            return interaction.reply({
              content: '⚠️ El sistema de anuncios no está listo. Reinicia el bot y vuelve a intentar.',
              ephemeral: true,
            });
          }

          // showModal es la respuesta; NO se usa defer aquí
          await interaction.showModal(modalFactory());
          return;
        }

        if (customId === 'anuncio_cancel') {
          // ✅ ACK rápido del botón
          await interaction.deferUpdate().catch(() => {});
          return interaction.editReply({
            content: '❌ Anuncio cancelado.',
            embeds: [],
            components: [],
          });
        }

        return;
      }

      // Modals
      if (interaction.isModalSubmit()) {
        if (interaction.customId === 'anuncio_modal') {
          const handler = client.handlers?.handleAnuncioModal;
          if (!handler) {
            return interaction.reply({
              content: '⚠️ No se encontró el manejador del anuncio. Reinicia el bot y vuelve a intentar.',
              ephemeral: true,
            });
          }

          // ✅ ACK inmediato SIEMPRE (la clave)
          await interaction.deferReply({ ephemeral: true }).catch(() => {});
          await handler(interaction);
          return;
        }

        return;
      }
    } catch (e) {
      logger.error(e?.stack || String(e));

      if (interaction.isRepliable()) {
        const msg = 'Ocurrió un error ejecutando esta interacción.';
        try {
          if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ content: msg, ephemeral: true });
          } else {
            await interaction.reply({ content: msg, ephemeral: true });
          }
        } catch {}
      }
    }
  },
};
