import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { formatCoins, formatDuration } from "../utils/format";
import { getPlayerContext } from "../utils/interaction";
import { gameEmbed, colors } from "../utils/embeds";

export const dailyCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("daily").setDescription("استلام المكافأة اليومية"),
  async execute(interaction, context) {
    const result = await getPlayerContext(interaction, context);
    if (!result) return;
    const claim = await context.database.claimDaily(
      result.guildId,
      interaction.user.id,
      interaction.user.username,
    );
    if (claim.claimed) {
      await interaction.reply({
        embeds: [
          gameEmbed(
            "تم استلام المكافأة",
            `أضيف إلى رصيدك **${formatCoins(claim.reward)}**.\nالرصيد الجديد: **${formatCoins(claim.player.balance)}**.`,
            colors.success,
          ),
        ],
      });
      return;
    }
    const remaining = Math.max(0, Date.parse(claim.nextClaimAt) - Date.now());
    await interaction.reply({
      embeds: [gameEmbed("المكافأة غير متاحة", `يمكنك استلامها بعد **${formatDuration(remaining)}**.`, colors.warning)],
    });
  },
};