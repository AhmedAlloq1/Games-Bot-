import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { gameEmbed, colors } from "../utils/embeds";
import { formatCoins } from "../utils/format";
import { getPlayerContext, parseBet, requireGameChannel } from "../utils/interaction";
import { randomInt } from "../utils/random";

export const guessCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("خمن الرقم السري من 1 إلى 10")
    .addIntegerOption((option) =>
      option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName("number").setDescription("توقعك").setMinValue(1).setMaxValue(10).setRequired(true),
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
    const guess = interaction.options.getInteger("number", true);
    const secret = randomInt(1, 10);
    const win = guess === secret;
    const recorded = await context.database.recordGame({
      guildId: result.guildId,
      userId: interaction.user.id,
      username: interaction.user.username,
      game: "guess",
      result: win ? "win" : "loss",
      amount: win ? bet.amount * 8 : bet.amount,
    });
    const message = win
      ? `أصبت الرقم **${secret}**! حصلت على **${formatCoins(bet.amount * 8)}**.\nرصيدك: **${formatCoins(recorded.player.balance)}**.`
      : `الرقم كان **${secret}**. خسرت **${formatCoins(bet.amount)}**.\nرصيدك: **${formatCoins(recorded.player.balance)}**.`;
    await interaction.reply({ embeds: [gameEmbed("خمن الرقم", message, win ? colors.success : colors.danger)] });
  },
};