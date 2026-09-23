import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { gameEmbed, colors } from "../utils/embeds";
import { formatCoins } from "../utils/format";
import { getPlayerContext, parseBet, requireGameChannel } from "../utils/interaction";
import { pick } from "../utils/random";

export const coinflipCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("راهن على نتيجة رمي العملة")
    .addIntegerOption((option) =>
      option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("اختيارك")
        .setRequired(true)
        .addChoices({ name: "صورة", value: "heads" }, { name: "كتابة", value: "tails" }),
    ),
  game: true,
  async execute(interaction, context) {
    if (!(await requireGameChannel(interaction, context))) return;
    const result = await getPlayerContext(interaction, context);
    if (!result) return;
    const bet = parseBet(interaction, result.player.balance);
    if (bet.error) {
      await interaction.reply({ content: bet.error, ephemeral: true });
      return;
    }
    const choice = interaction.options.getString("choice", true);
    const outcome = pick(["heads", "tails"] as const);
    const win = choice === outcome;
    const recorded = await context.database.recordGame({
      guildId: result.guildId,
      userId: interaction.user.id,
      username: interaction.user.username,
      game: "coinflip",
      result: win ? "win" : "loss",
      amount: bet.amount,
    });
    const label = outcome === "heads" ? "صورة" : "كتابة";
    const description = win
      ? `ظهرت **${label}** — فزت بـ **${formatCoins(bet.amount)}**.\nرصيدك: **${formatCoins(recorded.player.balance)}**.`
      : `ظهرت **${label}** — خسرت **${formatCoins(bet.amount)}**.\nرصيدك: **${formatCoins(recorded.player.balance)}**.`;
    await interaction.reply({ embeds: [gameEmbed("رمي العملة", description, win ? colors.success : colors.danger)] });
  },
};