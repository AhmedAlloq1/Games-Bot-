import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { formatCoins, displayName } from "../utils/format";
import { requireGuild } from "../utils/interaction";
import { colors } from "../utils/embeds";

export const leaderboardCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("leaderboard").setDescription("عرض ترتيب أغنى اللاعبين"),
  async execute(interaction, context) {
    const guildId = await requireGuild(interaction);
    if (!guildId) return;
    const players = await context.database.leaderboard(guildId, 10);
    const lines = players.length
      ? players.map((player, index) => `${index + 1}. **${displayName(player.username)}** — ${formatCoins(player.balance)}`)
      : ["لا توجد حسابات بعد. استخدم `/daily` لبدء اللعب."];
    const embed = new EmbedBuilder()
      .setColor(colors.warning)
      .setTitle("ترتيب اللاعبين")
      .setDescription(lines.join("\n"))
      .setFooter({ text: "الترتيب خاص بهذا السيرفر." });
    await interaction.reply({ embeds: [embed] });
  },
};