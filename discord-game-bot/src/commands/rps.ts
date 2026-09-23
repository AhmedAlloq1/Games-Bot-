import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types/command";
import { gameEmbed, colors } from "../utils/embeds";
import { formatCoins } from "../utils/format";
import { getPlayerContext, parseBet, requireGameChannel } from "../utils/interaction";
import { pick } from "../utils/random";

const labels = { rock: "حجر", paper: "ورق", scissors: "مقص" } as const;
type Choice = keyof typeof labels;

function outcome(player: Choice, bot: Choice): "win" | "loss" | "draw" {
  if (player === bot) return "draw";
  if ((player === "rock" && bot === "scissors") || (player === "paper" && bot === "rock") || (player === "scissors" && bot === "paper")) {
    return "win";
  }
  return "loss";
}

export const rpsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("العب حجر ورق مقص")
    .addIntegerOption((option) =>
      option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("اختيارك")
        .setRequired(true)
        .addChoices(
          { name: "حجر", value: "rock" },
          { name: "ورق", value: "paper" },
          { name: "مقص", value: "scissors" },
        ),
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
    const playerChoice = interaction.options.getString("choice", true) as Choice;
    const botChoice = pick(Object.keys(labels) as Choice[]);
    const resultType = outcome(playerChoice, botChoice);
    const recorded = await context.database.recordGame({
      guildId: result.guildId,
      userId: interaction.user.id,
      username: interaction.user.username,
      game: "rps",
      result: resultType,
      amount: bet.amount,
    });
    const summary = `أنت: **${labels[playerChoice]}**\nالبوت: **${labels[botChoice]}**`;
    const message =
      resultType === "win"
        ? `${summary}\nفزت بـ **${formatCoins(bet.amount)}**.\nرصيدك: **${formatCoins(recorded.player.balance)}**.`
        : resultType === "loss"
          ? `${summary}\nخسرت **${formatCoins(bet.amount)}**.\nرصيدك: **${formatCoins(recorded.player.balance)}**.`
          : `${summary}\nتعادل — لم يتغير رصيدك.`;
    await interaction.reply({ embeds: [gameEmbed("حجر ورق مقص", message, resultType === "win" ? colors.success : resultType === "loss" ? colors.danger : colors.warning)] });
  },
};