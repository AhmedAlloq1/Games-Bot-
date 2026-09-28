// events/guildMemberAdd.js
const { Events } = require('discord.js');
const config = require('../utils/config');
const { welcomeEmbed } = require('../utils/embeds');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    try {
      if (!config.welcomeChannelId) return;

      const channel = member.guild.channels.cache.get(
        config.welcomeChannelId
      );

      if (!channel) {
        console.warn(
          '[WELCOME] Configured welcome channel was not found.'
        );
        return;
      }

      await channel.send({
        content: `🎉 مرحبا بك في سيرفر ZN-Mazen <@${member.id}>!`,
        embeds: [
          welcomeEmbed(member),
          {
            image: {
              url: 'https://media.discordapp.net/attachments/1530400151305191635/1540620190516256798/banner.png?ex=6abc0e1c&is=6ababc9c&hm=fb9743b14bdb74314c68fd15516f3fcee254ea151c0bc06e5d101b29afb8ab9e&=&format=webp&quality=lossless',
            },
          },
        ],
      });

    } catch (err) {
      console.error(
        '[WELCOME] Failed to send welcome message:',
        err
      );
    }
  },
};