import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica si el bot responde.'),
  async execute(interaction) {
    await interaction.reply({ content: `🏓 Pong! (${interaction.client.ws.ping}ms)`, ephemeral: true });
  },
};
