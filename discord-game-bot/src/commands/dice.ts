import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { gameEmbed, colors } from "../utils/embeds";
import { formatCoins } from "../utils/format";
import { getPlayerContext, parseBet, requireGameChannel } from "../utils/interaction";
import { randomInt } from "../utils/random";

export const diceCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("توقع رقم النرد من 1 إلى 6")
    .addIntegerOption((option) =>
      option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName("guess").setDescription("توقعك").setMinValue(1).setMaxValue(6).setRequired(true),
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
    const guess = interaction.options.getInteger("guess", true);
    const roll = randomInt(1, 6);
    const win = guess === roll;
    const recorded = await context.database.recordGame({
      guildId: result.guildId,
      userId: interaction.user.id,
      username: interaction.user.username,
      game: "dice",
      result: win ? "win" : "loss",
      amount: win ? bet.amount * 4 : bet.amount,
    });
    const text = win
      ? `توقعك صحيح! ظهر **${roll}** وفزت بـ **${formatCoins(bet.amount * 4)}**.\nرصيدك: **${formatCoins(recorded.player.balance)}**.`
      : `ظهر **${roll}** بينما توقعت ${guess}. خسرت **${formatCoins(bet.amount)}**.\nرصيدك: **${formatCoins(recorded.player.balance)}**.`;
    await interaction.reply({ embeds: [gameEmbed("النرد", text, win ? colors.success : colors.danger)] });
  },
};