import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { gameEmbed, colors } from "../utils/embeds";
import { formatCoins } from "../utils/format";
import { getPlayerContext, parseBet, requireGameChannel } from "../utils/interaction";
import { pick } from "../utils/random";

const symbols = ["7", "BAR", "bell", "cherry", "lemon"] as const;

export const slotsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("شغّل ماكينة الحظ")
    .addIntegerOption((option) =>
      option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true),
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
    const reels = [pick(symbols), pick(symbols), pick(symbols)];
    const jackpot = reels[0] === reels[1] && reels[1] === reels[2];
    const pair = !jackpot && (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]);
    const win = jackpot || pair;
    const payout = jackpot ? bet.amount * 10 : pair ? bet.amount * 2 : bet.amount;
    const recorded = await context.database.recordGame({
      guildId: result.guildId,
      userId: interaction.user.id,
      username: interaction.user.username,
      game: "slots",
      result: win ? "win" : "loss",
      amount: payout,
    });
    const message = `\`${reels.join(" | ")}\`\n\n${
      jackpot ? `Jackpot! ربحت ${formatCoins(payout)}.` : pair ? `زوج متطابق! ربحت ${formatCoins(payout)}.` : `لا تطابق. خسرت ${formatCoins(bet.amount)}.`
    }\nرصيدك: **${formatCoins(recorded.player.balance)}**.`;
    await interaction.reply({ embeds: [gameEmbed("Slots", message, win ? colors.success : colors.danger)] });
  },
};