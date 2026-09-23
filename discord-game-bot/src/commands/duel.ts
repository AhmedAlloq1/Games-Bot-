import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { gameEmbed, colors } from "../utils/embeds";
import { formatCoins } from "../utils/format";
import { getPlayerContext, parseBet, requireGameChannel } from "../utils/interaction";
import { randomInt } from "../utils/random";

export const duelCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("تحدَّ لاعبًا آخر برهان متساوٍ")
    .addUserOption((option) => option.setName("opponent").setDescription("اللاعب الذي تتحداه").setRequired(true))
    .addIntegerOption((option) =>
      option.setName("bet").setDescription("قيمة الرهان لكل لاعب").setMinValue(1).setRequired(true),
    ),
  game: true,
  async execute(interaction, context) {
    if (!(await requireGameChannel(interaction, context))) return;
    const result = await getPlayerContext(interaction, context);
    if (!result) return;
    const opponent = interaction.options.getUser("opponent", true);
    if (opponent.bot || opponent.id === interaction.user.id) {
      await interaction.reply({ content: "اختر لاعبًا حقيقيًا آخر.", ephemeral: true });
      return;
    }
    const bet = parseBet(interaction, result.player.balance);
    if (bet.error) {
      await interaction.reply({ content: bet.error, ephemeral: true });
      return;
    }
    const opponentPlayer = await context.database.getPlayer(result.guildId, opponent.id, opponent.username);
    if (opponentPlayer.balance < bet.amount) {
      await interaction.reply({ content: `رصيد ${opponent.username} لا يكفي لهذا الرهان.`, ephemeral: true });
      return;
    }
    const winnerIsChallenger = randomInt(0, 1) === 1;
    const winner = winnerIsChallenger ? interaction.user : opponent;
    const loser = winnerIsChallenger ? opponent : interaction.user;
    const recorded = await context.database.recordDuel({
      guildId: result.guildId,
      winnerId: winner.id,
      winnerName: winner.username,
      loserId: loser.id,
      loserName: loser.username,
      amount: bet.amount,
    });
    await interaction.reply({
      embeds: [
        gameEmbed(
          "مبارزة",
          `الفائز: <@${winner.id}>\nالخاسر: <@${loser.id}>\n\nانتقل إلى الفائز **${formatCoins(bet.amount)}** من الخاسر.\nرصيد الفائز: **${formatCoins(recorded.winner.balance)}**.\nرصيد الخاسر: **${formatCoins(recorded.loser.balance)}**.`,
          colors.success,
        ),
      ],
    });
  },
};