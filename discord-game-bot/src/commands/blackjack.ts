import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { gameEmbed, colors } from "../utils/embeds";
import { formatCoins } from "../utils/format";
import { getPlayerContext, parseBet, requireGameChannel } from "../utils/interaction";
import { randomInt } from "../utils/random";

function drawCard(): number {
  return randomInt(1, 11);
}

function handValue(hand: number[]): number {
  let total = hand.reduce((sum, card) => sum + card, 0);
  let aces = hand.filter((card) => card === 1).length;
  while (aces > 0 && total + 10 <= 21) {
    total += 10;
    aces -= 1;
  }
  return total;
}

export const blackjackCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("العب جولة بلاك جاك سريعة")
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
    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];
    let playerTotal = handValue(playerHand);
    let dealerTotal = handValue(dealerHand);
    while (playerTotal < 17 && playerTotal <= 21) {
      playerHand.push(drawCard());
      playerTotal = handValue(playerHand);
    }
    while (dealerTotal < 17 && dealerTotal <= 21) {
      dealerHand.push(drawCard());
      dealerTotal = handValue(dealerHand);
    }
    const playerBlackjack = playerHand.length === 2 && playerTotal === 21;
    const dealerBlackjack = dealerHand.length === 2 && dealerTotal === 21;
    const win = playerTotal <= 21 && (dealerTotal > 21 || playerTotal > dealerTotal || playerBlackjack);
    const draw = playerTotal <= 21 && playerTotal === dealerTotal && !playerBlackjack && !dealerBlackjack;
    const gameResult = draw ? "draw" : win ? "win" : "loss";
    const payout = win ? (playerBlackjack ? bet.amount * 3 : bet.amount * 2) : bet.amount;
    const recorded = await context.database.recordGame({
      guildId: result.guildId,
      userId: interaction.user.id,
      username: interaction.user.username,
      game: "blackjack",
      result: gameResult,
      amount: payout,
    });
    const message = `يدك: **${playerHand.join(", ")}** = ${playerTotal}\nيد الموزع: **${dealerHand.join(", ")}** = ${dealerTotal}\n\n${
      win ? `فوز! ربحت ${formatCoins(payout)}.` : draw ? "تعادل، لم يتغير رصيدك." : `خسرت ${formatCoins(bet.amount)}.`
    }\nرصيدك: **${formatCoins(recorded.player.balance)}**.`;
    await interaction.reply({ embeds: [gameEmbed("Blackjack", message, win ? colors.success : draw ? colors.warning : colors.danger)] });
  },
};