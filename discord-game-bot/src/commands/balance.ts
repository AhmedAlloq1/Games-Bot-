import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { formatCoins } from "../utils/format";
import { getPlayerContext } from "../utils/interaction";
import { gameEmbed, colors } from "../utils/embeds";

export const balanceCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("balance").setDescription("عرض رصيدك الحالي"),
  async execute(interaction, context) {
    const result = await getPlayerContext(interaction, context);
    if (!result) return;
    await interaction.reply({
      embeds: [gameEmbed("رصيدك", `لديك **${formatCoins(result.player.balance)}**.`, colors.success)],
    });
  },
};