import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { formatCoins } from "../utils/format";
import { getPlayerContext } from "../utils/interaction";
import { colors } from "../utils/embeds";

export const profileCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("عرض ملفك وإحصائياتك")
    .addUserOption((option) => option.setName("user").setDescription("لاعب آخر اختياريًا")),
  async execute(interaction, context) {
    const guildId = await (async () => {
      if (interaction.guildId) return interaction.guildId;
      await interaction.reply({ content: "هذا الأمر يعمل داخل السيرفر فقط.", ephemeral: true });
      return null;
    })();
    if (!guildId) return;
    const user = interaction.options.getUser("user") || interaction.user;
    const player = await context.database.getPlayer(guildId, user.id, user.username);
    const winRate = player.stats.gamesPlayed
      ? Math.round((player.stats.wins / player.stats.gamesPlayed) * 100)
      : 0;
    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setAuthor({ name: user.globalName || user.username, iconURL: user.displayAvatarURL() })
      .setTitle("ملف اللاعب")
      .addFields(
        { name: "الرصيد", value: formatCoins(player.balance), inline: true },
        { name: "الألعاب", value: `${player.stats.gamesPlayed}`, inline: true },
        { name: "نسبة الفوز", value: `${winRate}%`, inline: true },
        { name: "الانتصارات", value: `${player.stats.wins}`, inline: true },
        { name: "الخسائر", value: `${player.stats.losses}`, inline: true },
        { name: "إجمالي الرهانات", value: formatCoins(player.stats.wagered), inline: true },
      )
      .setFooter({ text: "الإحصائيات مستقلة لكل سيرفر." });
    await interaction.reply({ embeds: [embed] });
  },
};