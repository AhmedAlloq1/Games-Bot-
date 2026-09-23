"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpsCommand = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../utils/embeds");
const format_1 = require("../utils/format");
const interaction_1 = require("../utils/interaction");
const random_1 = require("../utils/random");
const labels = { rock: "حجر", paper: "ورق", scissors: "مقص" };
function outcome(player, bot) {
    if (player === bot)
        return "draw";
    if ((player === "rock" && bot === "scissors") || (player === "paper" && bot === "rock") || (player === "scissors" && bot === "paper")) {
        return "win";
    }
    return "loss";
}
exports.rpsCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("rps")
        .setDescription("العب حجر ورق مقص")
        .addIntegerOption((option) => option.setName("bet").setDescription("قيمة الرهان").setMinValue(1).setRequired(true))
        .addStringOption((option) => option
        .setName("choice")
        .setDescription("اختيارك")
        .setRequired(true)
        .addChoices({ name: "حجر", value: "rock" }, { name: "ورق", value: "paper" }, { name: "مقص", value: "scissors" })),
    game: true,
    async execute(interaction, context) {
        if (!(await (0, interaction_1.requireGameChannel)(interaction, context)))
            return;
        const result = await (0, interaction_1.getPlayerContext)(interaction, context);
        if (!result)
            return;
        const bet = (0, interaction_1.parseBet)(interaction, result.player.balance);
        if (bet.error) {
            await interaction.reply({ content: bet.error, ephemeral: true });
            return;
        }
        const playerChoice = interaction.options.getString("choice", true);
        const botChoice = (0, random_1.pick)(Object.keys(labels));
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
        const message = resultType === "win"
            ? `${summary}\nفزت بـ **${(0, format_1.formatCoins)(bet.amount)}**.\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`
            : resultType === "loss"
                ? `${summary}\nخسرت **${(0, format_1.formatCoins)(bet.amount)}**.\nرصيدك: **${(0, format_1.formatCoins)(recorded.player.balance)}**.`
                : `${summary}\nتعادل — لم يتغير رصيدك.`;
        await interaction.reply({ embeds: [(0, embeds_1.gameEmbed)("حجر ورق مقص", message, resultType === "win" ? embeds_1.colors.success : resultType === "loss" ? embeds_1.colors.danger : embeds_1.colors.warning)] });
    },
};
